"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { GoalType } from "@/lib/calculations";
import type {
  FitnessLevel,
  MealLog,
  ProgressEntry,
  SleepEntry,
  UserProfile,
  WorkoutLog,
} from "@/types/index";
import { computeBmi } from "@/lib/calculations";
import { supabase } from "@/lib/supabase";

export type ColorTheme = "midnight" | "energy";

interface AppState {
  colorTheme: ColorTheme;
  setColorTheme: (t: ColorTheme) => void;

  user: UserProfile | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    data: Omit<UserProfile, "id" | "createdAt" | "lastLogin"> & { password: string },
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (partial: Partial<UserProfile>) => Promise<void>;
  
  loadInitialData: (userId: string) => Promise<void>;

  workoutLogs: WorkoutLog[];
  addWorkoutLog: (log: Omit<WorkoutLog, "id" | "userId" | "date"> & { date?: string }) => void;

  mealLogs: MealLog[];
  addMealLog: (meal: Omit<MealLog, "id" | "userId" | "date"> & { date?: string }) => void;
  updateMealLog: (id: string, patch: Partial<Omit<MealLog, "id" | "userId">>) => void;
  deleteMealLog: (id: string) => void;

  progress: ProgressEntry[];
  addProgress: (p: Omit<ProgressEntry, "id" | "userId" | "date"> & { date?: string }) => void;

  waterMlByDate: Record<string, number>;
  addWater: (ml: number, date?: string) => void;

  streakDays: number;
  lastWorkoutDate: string | null;
  completeWorkoutDay: () => void;

  badges: string[];
  awardBadge: (id: string) => void;

  prByExercise: Record<string, number>;
  updatePr: (exercise: string, weightKg: number) => void;

  sleepLogs: SleepEntry[];
  addSleepLog: (entry: Omit<SleepEntry, "id" | "date"> & { date?: string }) => void;
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      colorTheme: "midnight",
      setColorTheme: (t) => set({ colorTheme: t }),

      user: null,

      login: async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error || !data.user) {
          return false;
        }

        // Fetch profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .single();

        if (profile) {
          const userObj: UserProfile = {
            id: profile.id,
            email: profile.email,
            name: profile.name,
            age: profile.age,
            gender: profile.gender,
            heightCm: Number(profile.height_cm),
            weightKg: Number(profile.weight_kg),
            goalWeightKg: profile.goal_weight_kg ? Number(profile.goal_weight_kg) : undefined,
            fitnessLevel: profile.fitness_level,
            goalType: profile.goal_type,
            activity: profile.activity,
            dietaryPreference: profile.dietary_preference,
            allergies: profile.allergies || "",
            budget: profile.budget,
            createdAt: profile.created_at,
            lastLogin: new Date().toISOString(),
          };
          set({ user: userObj });
          
          // Update last login in db
          supabase.from("profiles").update({ last_login: new Date().toISOString() }).eq("id", profile.id).then();
          
          // Load all async data for this user
          get().loadInitialData(profile.id);
          return true;
        }
        
        return false;
      },

      register: async (data) => {
        // 1. Create auth user
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
        });

        if (authError || !authData.user) {
          return { success: false, error: authError?.message || "Signup failed." };
        }

        const now = new Date().toISOString();
        const profilePayload = {
          id: authData.user.id,
          email: data.email,
          name: data.name,
          age: data.age,
          gender: data.gender,
          height_cm: data.heightCm,
          weight_kg: data.weightKg,
          goal_weight_kg: data.goalWeightKg,
          fitness_level: data.fitnessLevel,
          goal_type: data.goalType,
          activity: data.activity,
          dietary_preference: data.dietaryPreference,
          allergies: data.allergies ? [data.allergies] : [],
          budget: data.budget,
          created_at: now,
          last_login: now,
        };

        // 2. Insert into profiles table
        const { error: profileError } = await supabase.from("profiles").insert([profilePayload]);
        
        if (profileError) {
          console.error("Profile insertion error:", profileError.message || profileError, profileError.details, profileError.hint);
          // If this is an RLS policy error or "new row violates row-level security policy", the user needs to disable email confirmations or fix RLS.
          return { success: false, error: profileError.message || "Failed to create profile. Please check schema." };
        }

        const profile: UserProfile = {
          id: authData.user.id,
          ...data,
          createdAt: now,
          lastLogin: now,
        };

        set({ user: profile });
        return { success: true };
      },

      logout: async () => {
        await supabase.auth.signOut();
        set({ user: null, workoutLogs: [], mealLogs: [], progress: [], waterMlByDate: {}, badges: [], prByExercise: {} });
      },

      updateProfile: async (partial) => {
        const u = get().user;
        if (!u) return;
        
        const next = { ...u, ...partial };
        set({ user: next });
        
        // Push to supabase
        const payload: any = {};
        if (partial.name) payload.name = partial.name;
        if (partial.weightKg) payload.weight_kg = partial.weightKg;
        if (partial.goalWeightKg) payload.goal_weight_kg = partial.goalWeightKg;
        
        await supabase.from("profiles").update(payload).eq("id", u.id);
      },
      
      loadInitialData: async (userId: string) => {
        // Fetch Workouts
        const { data: workouts } = await supabase.from("workout_logs").select("*").order('date', { ascending: false });
        if (workouts) {
          set({ workoutLogs: workouts.map(w => ({
            id: w.id, userId: w.user_id, date: w.date, exerciseName: w.exercise_name,
            sets: w.sets, reps: w.reps, weightKg: Number(w.weight_kg), durationMin: w.duration_min,
            caloriesBurned: w.calories_burned, notes: w.notes
          }))});
        }
        
        // Fetch Meals
        const { data: meals } = await supabase.from("meal_logs").select("*").order('date', { ascending: false });
        if (meals) {
          set({ mealLogs: meals.map(m => ({
            id: m.id, userId: m.user_id, date: m.date, mealType: m.meal_type,
            foodItems: m.food_items, calories: m.calories, proteinG: m.protein_g,
            carbsG: m.carbs_g, fatG: m.fat_g
          }))});
        }
        
        // Fetch Progress
        const { data: prog } = await supabase.from("progress_entries").select("*").order('date', { ascending: false });
        if (prog) {
          set({ progress: prog.map(p => ({
            id: p.id, userId: p.user_id, date: p.date, weightKg: Number(p.weight_kg),
            bodyFatPct: p.body_fat_pct ? Number(p.body_fat_pct) : undefined,
            photoUrl: p.photo_url || undefined
          }))});
        }
        
        // Fetch Water
        const { data: water } = await supabase.from("daily_water").select("*");
        if (water) {
          const wMap: Record<string, number> = {};
          water.forEach(w => { wMap[w.date] = w.water_ml; });
          set({ waterMlByDate: wMap });
        }
        
        // Fetch Badges
        const { data: badg } = await supabase.from("user_badges").select("*");
        if (badg) {
          set({ badges: badg.map(b => b.badge_id) });
        }
        
        // Fetch PRs
        const { data: prs } = await supabase.from("personal_records").select("*");
        if (prs) {
          const pMap: Record<string, number> = {};
          prs.forEach(p => { pMap[p.exercise_name] = Number(p.weight_kg); });
          set({ prByExercise: pMap });
        }
      },

      workoutLogs: [],
      addWorkoutLog: (log) => {
        const u = get().user;
        if (!u) return;
        const id = crypto.randomUUID();
        const date = log.date ?? todayISO();
        
        const entry: WorkoutLog = {
          id,
          userId: u.id,
          date,
          exerciseName: log.exerciseName,
          sets: log.sets,
          reps: log.reps,
          weightKg: log.weightKg,
          durationMin: log.durationMin,
          caloriesBurned: log.caloriesBurned,
          notes: log.notes,
        };
        
        // Optimistic UI update
        set({ workoutLogs: [entry, ...get().workoutLogs] });
        get().updatePr(log.exerciseName, log.weightKg);
        
        // Push async to Supabase
        supabase.from("workout_logs").insert([{
          id,
          user_id: u.id,
          date,
          exercise_name: log.exerciseName,
          sets: log.sets,
          reps: log.reps,
          weight_kg: log.weightKg,
          duration_min: log.durationMin,
          calories_burned: log.caloriesBurned,
          notes: log.notes
        }]).then();
      },

      mealLogs: [],
      addMealLog: (meal) => {
        const u = get().user;
        if (!u) return;
        const id = crypto.randomUUID();
        const date = meal.date ?? todayISO();
        
        const entry: MealLog = {
          id,
          userId: u.id,
          date,
          mealType: meal.mealType,
          foodItems: meal.foodItems,
          calories: meal.calories,
          proteinG: meal.proteinG,
          carbsG: meal.carbsG,
          fatG: meal.fatG,
        };
        
        set({ mealLogs: [entry, ...get().mealLogs] });
        
        supabase.from("meal_logs").insert([{
          id,
          user_id: u.id,
          date,
          meal_type: meal.mealType,
          food_items: meal.foodItems,
          calories: meal.calories,
          protein_g: meal.proteinG,
          carbs_g: meal.carbsG,
          fat_g: meal.fatG
        }]).then();
      },

      updateMealLog: (id, patch) => {
        set({
          mealLogs: get().mealLogs.map((m) => (m.id === id ? { ...m, ...patch } : m)),
        });
        
        // Best effort sync
        const payload: any = {};
        if (patch.calories !== undefined) payload.calories = patch.calories;
        if (patch.proteinG !== undefined) payload.protein_g = patch.proteinG;
        if (patch.carbsG !== undefined) payload.carbs_g = patch.carbsG;
        if (patch.fatG !== undefined) payload.fat_g = patch.fatG;
        
        if (Object.keys(payload).length > 0) {
          supabase.from("meal_logs").update(payload).eq("id", id).then();
        }
      },

      deleteMealLog: (id) => {
        set({ mealLogs: get().mealLogs.filter((m) => m.id !== id) });
        supabase.from("meal_logs").delete().eq("id", id).then();
      },

      progress: [],
      addProgress: (p) => {
        const u = get().user;
        if (!u) return;
        const id = crypto.randomUUID();
        const date = p.date ?? todayISO();
        
        const entry: ProgressEntry = {
          id,
          userId: u.id,
          date,
          weightKg: p.weightKg,
          bodyFatPct: p.bodyFatPct,
          chestCm: p.chestCm,
          waistCm: p.waistCm,
          hipsCm: p.hipsCm,
          armsCm: p.armsCm,
          thighsCm: p.thighsCm,
          photoUrl: p.photoUrl,
        };
        set({ progress: [entry, ...get().progress] });
        get().updateProfile({ weightKg: p.weightKg });
        
        supabase.from("progress_entries").insert([{
          id,
          user_id: u.id,
          date,
          weight_kg: p.weightKg,
          body_fat_pct: p.bodyFatPct,
          photo_url: p.photoUrl
        }]).then();
      },

      waterMlByDate: {},
      addWater: (ml, date) => {
        const u = get().user;
        if (!u) return;
        const d = date ?? todayISO();
        const cur = get().waterMlByDate[d] ?? 0;
        const newAmt = cur + ml;
        
        set({ waterMlByDate: { ...get().waterMlByDate, [d]: newAmt } });
        
        supabase.from("daily_water").upsert({
          user_id: u.id,
          date: d,
          water_ml: newAmt
        }, { onConflict: 'user_id, date' }).then();
      },

      streakDays: 0,
      lastWorkoutDate: null,
      completeWorkoutDay: () => {
        const t = todayISO();
        const last = get().lastWorkoutDate;
        let streak = get().streakDays;
        if (last) {
          const prev = new Date(last);
          const today = new Date(t);
          const diff = (today.getTime() - prev.getTime()) / 86400000;
          if (diff === 1) streak += 1;
          else if (diff === 0) {
            /* same day */
          } else streak = 1;
        } else streak = 1;
        set({ streakDays: streak, lastWorkoutDate: t });
        
        if (streak === 7) get().awardBadge("week-streak");
        if (streak === 30) get().awardBadge("month-streak");
      },

      badges: [],
      awardBadge: (id) => {
        const u = get().user;
        if (!u) return;
        if (get().badges.includes(id)) return;
        
        set({ badges: [...get().badges, id] });
        supabase.from("user_badges").insert([{ user_id: u.id, badge_id: id }]).then();
      },

      prByExercise: {},
      updatePr: (exercise, weightKg) => {
        const u = get().user;
        if (!u) return;
        
        const prev = get().prByExercise[exercise] ?? 0;
        if (weightKg > prev) {
          set({
            prByExercise: { ...get().prByExercise, [exercise]: weightKg },
          });
          get().awardBadge("pr-chaser");
          
          supabase.from("personal_records").upsert({
            user_id: u.id,
            exercise_name: exercise,
            weight_kg: weightKg
          }, { onConflict: 'user_id, exercise_name' }).then();
        }
      },

      sleepLogs: [],
      addSleepLog: (entry) => {
        const id = crypto.randomUUID();
        const date = entry.date ?? todayISO();
        const newEntry: SleepEntry = { id, date, ...entry };
        set({ sleepLogs: [newEntry, ...get().sleepLogs] });
      },
    }),
    {
      name: "aifit-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        colorTheme: s.colorTheme,
        user: s.user,
        workoutLogs: s.workoutLogs,
        mealLogs: s.mealLogs,
        progress: s.progress,
        waterMlByDate: s.waterMlByDate,
        streakDays: s.streakDays,
        lastWorkoutDate: s.lastWorkoutDate,
        badges: s.badges,
        prByExercise: s.prByExercise,
        sleepLogs: s.sleepLogs,
      }),
    },
  ),
);

export function selectBmi(user: UserProfile | null): number {
  if (!user) return 0;
  return computeBmi(user.weightKg, user.heightCm);
}

export function goalLabel(g: GoalType): string {
  switch (g) {
    case "loss":
      return "Weight loss";
    case "gain":
      return "Weight gain";
    case "recomp":
      return "Body recomposition";
    default:
      return "";
  }
}

export function fitnessLabel(f: FitnessLevel): string {
  switch (f) {
    case "beginner":
      return "Beginner";
    case "intermediate":
      return "Intermediate";
    case "advanced":
      return "Advanced";
    default:
      return "";
  }
}
