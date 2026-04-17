"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { Dumbbell, TrendingUp } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QuoteBanner } from "@/components/fitness/quote-banner";
import { ArnoldGallery } from "@/components/fitness/arnold-gallery";
import { HabitRings } from "@/components/fitness/habit-rings";
import { MuscleHeatmap } from "@/components/fitness/muscle-heatmap";
import { StreakFire } from "@/components/fitness/streak-fire";
import { ToastQuote } from "@/components/fitness/toast-quote";
import { TodaysMission } from "@/components/fitness/todays-mission";
import { TransformationTimeline } from "@/components/fitness/transformation-timeline";
import { FloatingWorkoutTimer } from "@/components/fitness/floating-workout-timer";
import { useAppStore, selectBmi, goalLabel, fitnessLabel } from "@/store/use-app-store";
import { bmiCategory } from "@/lib/calculations";
import {
  calorieTargetFromGoal,
  computeTdee,
  macroSplit,
} from "@/lib/calculations";
import { RECIPES } from "@/data/recipes";
import { BEGINNER_WEEK } from "@/data/weekly-program";

export default function DashboardPage() {
  const user = useAppStore((s) => s.user);
  const progress = useAppStore((s) => s.progress);
  const streak = useAppStore((s) => s.streakDays);
  const badges = useAppStore((s) => s.badges);
  const water = useAppStore((s) => s.waterMlByDate);

  if (!user) return null;

  const bmi = selectBmi(user);
  const cat = bmiCategory(bmi);
  const tdee = computeTdee(user.weightKg, user.heightCm, user.age, user.gender, user.activity);
  const target = calorieTargetFromGoal(tdee, user.goalType);
  const macros = macroSplit(target, user.goalType);

  const today = new Date().toISOString().slice(0, 10);
  const waterToday = water[today] ?? 0;

  const dayIdx = new Date().getDay();
  const mapped = dayIdx === 0 ? 6 : dayIdx - 1;
  const todayWorkout = BEGINNER_WEEK.find((d) => d.dayIndex === mapped) ?? BEGINNER_WEEK[0];

  const weightData = [...progress]
    .reverse()
    .slice(-12)
    .map((p) => ({ date: p.date.slice(5), kg: p.weightKg }));

  const demoData =
    weightData.length > 0
      ? weightData
      : [
          { date: "W1", kg: user.weightKg + 0.8 },
          { date: "W2", kg: user.weightKg + 0.4 },
          { date: "W3", kg: user.weightKg + 0.1 },
          { date: "W4", kg: user.weightKg },
        ];

  const meal = RECIPES.filter((r) => r.diet.includes(user.dietaryPreference === "omnivore" ? "omnivore" : user.dietaryPreference))[0] ?? RECIPES[0];

  return (
    <div className="space-y-6 relative pb-20">
      <ToastQuote />
      <FloatingWorkoutTimer />

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold tracking-tight">Welcome back, {user.name.split(" ")[0]}</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {goalLabel(user.goalType)} • {fitnessLabel(user.fitnessLevel)} • TDEE {Math.round(tdee)} kcal
        </p>
      </motion.div>

      <QuoteBanner />

      <ArnoldGallery />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <TodaysMission workoutName={todayWorkout.focus} targetKcal={target} waterMl={3000} />
          
          <Card>
            <CardHeader
              title="Today's workout"
              subtitle={todayWorkout.focus}
              action={
                <Link href="/schedule">
                  <Button size="sm" variant="outline">
                    Open schedule
                  </Button>
                </Link>
              }
            />
            <div className="flex flex-col md:flex-row gap-6 mt-2">
              <div className="flex-1">
                {todayWorkout.exercises.length === 0 ? (
                  <p className="text-sm text-[var(--muted)]">Recovery day — light walk or mobility recommended.</p>
                ) : (
                  <ul className="space-y-2">
                    {todayWorkout.exercises.slice(0, 4).map((ex) => (
                      <li
                        key={ex.id}
                        className="flex items-center justify-between rounded-xl border border-white/10 bg-zinc-950/40 px-3 py-2 text-sm"
                      >
                        <span className="flex items-center gap-2 font-medium">
                          <Dumbbell className="h-4 w-4 text-[var(--accent)]" />
                          {ex.name}
                        </span>
                        <span className="text-[var(--muted)]">
                          {ex.sets}×{ex.reps} · {ex.restSec}s rest
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="w-full md:w-48 rounded-xl bg-zinc-950/60 border border-white/5 flex items-center justify-center py-4">
                <MuscleHeatmap focus={todayWorkout.focus} />
              </div>
            </div>
          </Card>
        </div>

        <Card className="flex flex-col">
          <CardHeader title="Momentum" />
          <div className="flex flex-1 flex-col items-center justify-center py-6">
            <StreakFire days={streak} />
          </div>
          <dl className="space-y-3 text-sm mt-auto border-t border-white/10 pt-4">
            <div className="flex justify-between">
              <dt className="text-[var(--muted)]">Weight</dt>
              <dd>{user.weightKg.toFixed(1)} kg</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[var(--muted)]">BMI</dt>
              <dd>
                {bmi.toFixed(1)} ({cat})
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[var(--muted)]">Water</dt>
              <dd>{waterToday} ml</dd>
            </div>
          </dl>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Daily Habits" subtitle="Close your rings" />
          <HabitRings 
            caloriesProgress={85} // Demo progress
            proteinProgress={70}
            waterProgress={waterToday > 0 ? Math.min((waterToday / 3000) * 100, 100) : 40}
          />
        </Card>

        <Card>
          <CardHeader title="Meal spotlight" subtitle="Pulled from your recipe database (demo)." />
          <p className="font-medium">{meal.title}</p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {meal.calories} kcal • P {meal.proteinG}g • C {meal.carbsG}g • F {meal.fatG}g • {meal.prepMin} min
          </p>
          <Link href="/nutrition" className="mt-4 inline-block">
            <Button size="sm" variant="secondary">
              Open nutrition hub
            </Button>
          </Link>
        </Card>
      </div>

      <TransformationTimeline 
        currentWeight={user.weightKg} 
        goalType={user.goalType} 
      />

      <Card>
        <CardHeader title="Achievements" subtitle="Earn badges as you train consistently." />
        <div className="flex flex-wrap gap-2">
          {badges.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">Complete workouts and log PRs to unlock badges.</p>
          ) : (
            badges.map((b) => (
              <span
                key={b}
                className="inline-flex items-center gap-1 rounded-full border border-[var(--accent)]/40 bg-[var(--accent)]/10 px-3 py-1 text-xs font-medium"
              >
                <TrendingUp className="h-3.5 w-3.5" />
                {b}
              </span>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
