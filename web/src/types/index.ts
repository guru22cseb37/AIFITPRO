import type { ActivityLevel, GoalType } from "@/lib/calculations";

export type FitnessLevel = "beginner" | "intermediate" | "advanced";

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  age: number;
  gender: "male" | "female";
  heightCm: number;
  weightKg: number;
  goalWeightKg?: number;
  fitnessLevel: FitnessLevel;
  goalType: GoalType;
  activity: ActivityLevel;
  dietaryPreference: "omnivore" | "vegetarian" | "vegan";
  allergies: string;
  budget: "low" | "medium" | "high";
  createdAt: string;
  lastLogin: string;
}

export interface WorkoutLog {
  id: string;
  userId: string;
  date: string;
  exerciseName: string;
  sets: number;
  reps: number;
  weightKg: number;
  durationMin?: number;
  caloriesBurned?: number;
  notes?: string;
}

/** Daily meal periods — legacy `breakfast`/`lunch` still load as Morning/Afternoon */
export type MealSlot =
  | "morning"
  | "afternoon"
  | "evening"
  | "snack"
  | "dinner"
  | "breakfast"
  | "lunch";

export interface MealLog {
  id: string;
  userId: string;
  date: string;
  mealType: MealSlot;
  foodItems: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export interface ProgressEntry {
  id: string;
  userId: string;
  date: string;
  weightKg: number;
  bodyFatPct?: number;
  chestCm?: number;
  waistCm?: number;
  hipsCm?: number;
  armsCm?: number;
  thighsCm?: number;
  photoUrl?: string;
}

export interface ScheduledExercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  restSec: number;
  videoUrl: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  equipment: string[];
}

export interface DayWorkout {
  dayIndex: number;
  label: string;
  focus: string;
  durationMin: number;
  exercises: ScheduledExercise[];
}

export interface SleepEntry {
  id: string;
  date: string;
  hoursSlept: number;      // e.g. 7.5
  sleepQuality: 1 | 2 | 3 | 4 | 5;   // 1=terrible, 5=excellent
  energyLevel: 1 | 2 | 3 | 4 | 5;    // how you feel next morning
  stressLevel: 1 | 2 | 3 | 4 | 5;    // 1=calm, 5=very stressed
  notes?: string;
}
