"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { GoalType } from "@/lib/calculations";
import type {
  FitnessLevel,
  MealLog,
  ProgressEntry,
  UserProfile,
  WorkoutLog,
} from "@/types/index";
import { computeBmi } from "@/lib/calculations";

export type ColorTheme = "midnight" | "energy";

interface AppState {
  colorTheme: ColorTheme;
  setColorTheme: (t: ColorTheme) => void;

  user: UserProfile | null;
  login: (email: string, password: string) => boolean;
  register: (
    data: Omit<UserProfile, "id" | "createdAt" | "lastLogin"> & { password: string },
  ) => void;
  logout: () => void;
  updateProfile: (partial: Partial<UserProfile>) => void;

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

      login: (email, password) => {
        const raw = localStorage.getItem("aifit-users");
        if (!raw || !password) return false;
        try {
          const users = JSON.parse(raw) as Record<
            string,
            { profile: UserProfile; password: string }
          >;
          const u = users[email.toLowerCase()];
          if (u && u.password === password) {
            set({
              user: { ...u.profile, lastLogin: new Date().toISOString() },
            });
            return true;
          }
        } catch {
          return false;
        }
        return false;
      },

      register: (data) => {
        const id = crypto.randomUUID();
        const now = new Date().toISOString();
        const profile: UserProfile = {
          id,
          email: data.email,
          name: data.name,
          age: data.age,
          gender: data.gender,
          heightCm: data.heightCm,
          weightKg: data.weightKg,
          goalWeightKg: data.goalWeightKg,
          fitnessLevel: data.fitnessLevel,
          goalType: data.goalType,
          activity: data.activity,
          dietaryPreference: data.dietaryPreference,
          allergies: data.allergies,
          budget: data.budget,
          createdAt: now,
          lastLogin: now,
        };
        const raw = localStorage.getItem("aifit-users");
        const users = raw ? (JSON.parse(raw) as Record<string, { profile: UserProfile; password: string }>) : {};
        users[data.email.toLowerCase()] = { profile, password: data.password };
        localStorage.setItem("aifit-users", JSON.stringify(users));
        set({ user: profile });
      },

      logout: () => set({ user: null }),

      updateProfile: (partial) => {
        const u = get().user;
        if (!u) return;
        const next = { ...u, ...partial };
        set({ user: next });
        const raw = localStorage.getItem("aifit-users");
        if (raw) {
          const users = JSON.parse(raw) as Record<string, { profile: UserProfile; password: string }>;
          const entry = users[u.email.toLowerCase()];
          if (entry) {
            entry.profile = next;
            localStorage.setItem("aifit-users", JSON.stringify(users));
          }
        }
      },

      workoutLogs: [],
      addWorkoutLog: (log) => {
        const u = get().user;
        if (!u) return;
        const entry: WorkoutLog = {
          id: crypto.randomUUID(),
          userId: u.id,
          date: log.date ?? todayISO(),
          exerciseName: log.exerciseName,
          sets: log.sets,
          reps: log.reps,
          weightKg: log.weightKg,
          durationMin: log.durationMin,
          caloriesBurned: log.caloriesBurned,
          notes: log.notes,
        };
        set({ workoutLogs: [entry, ...get().workoutLogs] });
        get().updatePr(log.exerciseName, log.weightKg);
      },

      mealLogs: [],
      addMealLog: (meal) => {
        const u = get().user;
        if (!u) return;
        const entry: MealLog = {
          id: crypto.randomUUID(),
          userId: u.id,
          date: meal.date ?? todayISO(),
          mealType: meal.mealType,
          foodItems: meal.foodItems,
          calories: meal.calories,
          proteinG: meal.proteinG,
          carbsG: meal.carbsG,
          fatG: meal.fatG,
        };
        set({ mealLogs: [entry, ...get().mealLogs] });
      },

      updateMealLog: (id, patch) => {
        set({
          mealLogs: get().mealLogs.map((m) => (m.id === id ? { ...m, ...patch } : m)),
        });
      },

      deleteMealLog: (id) => {
        set({ mealLogs: get().mealLogs.filter((m) => m.id !== id) });
      },

      progress: [],
      addProgress: (p) => {
        const u = get().user;
        if (!u) return;
        const entry: ProgressEntry = {
          id: crypto.randomUUID(),
          userId: u.id,
          date: p.date ?? todayISO(),
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
      },

      waterMlByDate: {},
      addWater: (ml, date) => {
        const d = date ?? todayISO();
        const cur = get().waterMlByDate[d] ?? 0;
        set({ waterMlByDate: { ...get().waterMlByDate, [d]: cur + ml } });
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
        if (get().badges.includes(id)) return;
        set({ badges: [...get().badges, id] });
      },

      prByExercise: {},
      updatePr: (exercise, weightKg) => {
        const prev = get().prByExercise[exercise] ?? 0;
        if (weightKg > prev) {
          set({
            prByExercise: { ...get().prByExercise, [exercise]: weightKg },
          });
          get().awardBadge("pr-chaser");
        }
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
