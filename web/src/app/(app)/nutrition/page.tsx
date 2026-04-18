"use client";

import { useMemo, useState } from "react";
import { Settings, Utensils, PartyPopper } from "lucide-react";
import {
  activityMultiplier,
  type ActivityLevel,
  calorieTargetFromGoal,
  computeTdee,
  macroSplit,
  type GoalType,
} from "@/lib/calculations";
import { RECIPES, type Recipe } from "@/data/recipes";
import { useAppStore } from "@/store/use-app-store";
import { DailyMealLog } from "@/components/nutrition/daily-meal-log";
import { RingDashboard } from "@/components/nutrition/ring-dashboard";
import { HydrationTracker } from "@/components/nutrition/hydration-tracker";
import { Button } from "@/components/ui/button";
import { ConfettiBurst } from "@/components/gamification/confetti-burst";

function shoppingList(recipes: Recipe[]): string[] {
  const set = new Set<string>();
  recipes.forEach((r) => r.ingredients.forEach((i) => set.add(i)));
  return Array.from(set);
}

export default function NutritionPage() {
  const user = useAppStore((s) => s.user);
  const water = useAppStore((s) => s.waterMlByDate);
  const addWater = useAppStore((s) => s.addWater);
  const mealLogs = useAppStore((s) => s.mealLogs);

  const [goal, setGoal] = useState<GoalType>(user?.goalType ?? "recomp");
  const [activity, setActivity] = useState<ActivityLevel>(user?.activity ?? "moderate");
  const [showSettings, setShowSettings] = useState(false);

  const tdee = user ? computeTdee(user.weightKg, user.heightCm, user.age, user.gender, activity) : 2200;
  const target = calorieTargetFromGoal(tdee, goal);
  const macros = macroSplit(target, goal);

  const filtered = useMemo(() => {
    if (!user) return RECIPES;
    if (user.dietaryPreference === "vegan") return RECIPES.filter((r) => r.diet.includes("vegan"));
    if (user.dietaryPreference === "vegetarian") {
      return RECIPES.filter((r) => r.diet.includes("vegetarian") || r.diet.includes("vegan"));
    }
    return RECIPES;
  }, [user]);

  const today = new Date().toISOString().slice(0, 10);
  const waterToday = water[today] ?? 0;

  // Calculate consumed totals for today
  const dayMeals = useMemo(() => {
    if (!user) return [];
    return mealLogs.filter((m) => m.userId === user.id && m.date === today);
  }, [mealLogs, user, today]);

  const consumedKcal = dayMeals.reduce((a, m) => a + m.calories, 0);
  const consumedP = dayMeals.reduce((a, m) => a + m.proteinG, 0);
  const consumedC = dayMeals.reduce((a, m) => a + m.carbsG, 0);
  const consumedF = dayMeals.reduce((a, m) => a + m.fatG, 0);

  // 🎉 Confetti: fires when within 50 kcal of goal (and consumed > 0)
  const goalHit = consumedKcal > 0 && Math.abs(consumedKcal - target) <= 50;

  return (
    <div className="space-y-10 pb-20">
      <ConfettiBurst trigger={goalHit} />
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-4xl font-black tracking-tight text-transparent">
            Nutrition Hub
          </h1>
          <p className="mt-2 text-sm font-medium text-zinc-400">
            Track your macros, hydration, and meal plans all in one premium dashboard.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setShowSettings(!showSettings)} className="gap-2 rounded-full border-white/10 bg-white/5">
          <Settings className="h-4 w-4" />
          Settings
        </Button>
      </div>

      {/* Settings Panel (Collapsible) */}
      {showSettings && (
        <div className="grid gap-4 rounded-3xl border border-white/10 bg-zinc-950/40 p-6 shadow-xl backdrop-blur-md sm:grid-cols-2">
          <label className="text-sm">
            <span className="mb-2 block font-medium text-zinc-300">Target Goal</span>
            <select
              className="h-12 w-full rounded-2xl border border-white/10 bg-black/40 px-4 text-white shadow-inner focus:border-[var(--accent)] focus:outline-none"
              value={goal}
              onChange={(e) => setGoal(e.target.value as GoalType)}
            >
              <option value="loss">Calorie deficit (fat loss)</option>
              <option value="gain">Calorie surplus (muscle gain)</option>
              <option value="recomp">Body recomposition</option>
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-2 block font-medium text-zinc-300">Activity Factor</span>
            <select
              className="h-12 w-full rounded-2xl border border-white/10 bg-black/40 px-4 text-white shadow-inner focus:border-[var(--accent)] focus:outline-none"
              value={activity}
              onChange={(e) => setActivity(e.target.value as ActivityLevel)}
            >
              <option value="sedentary">Sedentary ×{activityMultiplier("sedentary")}</option>
              <option value="light">Light ×{activityMultiplier("light")}</option>
              <option value="moderate">Moderate ×{activityMultiplier("moderate")}</option>
              <option value="active">Active ×{activityMultiplier("active")}</option>
              <option value="very_active">Very active ×{activityMultiplier("very_active")}</option>
            </select>
          </label>
        </div>
      )}

      {/* Top Dashboard Grid */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-5 xl:col-span-4">
          <RingDashboard
            consumedKcal={consumedKcal}
            targetKcal={target}
            consumedP={consumedP}
            targetP={macros.proteinG}
            consumedC={consumedC}
            targetC={macros.carbsG}
            consumedF={consumedF}
            targetF={macros.fatG}
          />
        </div>
        <div className="lg:col-span-7 xl:col-span-8">
          <DailyMealLog targetKcal={target} goalType={goal} />
        </div>
      </div>

      {/* Hydration Tracker */}
      <HydrationTracker waterToday={waterToday} addWater={addWater} />

      {/* Recipe Database */}
      <div>
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent)] text-zinc-950 shadow-[0_0_15px_var(--accent-glow)]">
            <Utensils className="h-5 w-5" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Recipe Database</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => (
            <div key={r.id} className="group relative overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/40 shadow-xl backdrop-blur-md transition-all hover:-translate-y-1 hover:bg-zinc-950/60 hover:shadow-2xl">
              {/* YouTube Embed or Fake image gradient background */}
              {r.videoUrl ? (
                <div className="relative h-48 w-full overflow-hidden">
                  <iframe
                    src={r.videoUrl}
                    title={r.title}
                    className="absolute top-0 left-0 h-full w-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="h-48 w-full bg-gradient-to-br from-white/5 to-white/10 group-hover:from-[var(--accent)]/10 group-hover:to-white/5 transition-colors" />
              )}
              
              <div className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-white line-clamp-1">{r.title}</h3>
                  <span className="shrink-0 rounded-full bg-[var(--accent)]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--accent)]">
                    {r.diet[0]}
                  </span>
                </div>
                
                <p className="mt-2 text-sm text-zinc-400">
                  {r.prepMin} min prep • Level {r.difficulty}
                </p>
                
                <div className="mt-4 flex items-center justify-between rounded-2xl bg-black/40 p-3 shadow-inner">
                  <div className="text-center">
                    <p className="text-xs text-zinc-500">Kcal</p>
                    <p className="font-bold text-zinc-200">{r.calories}</p>
                  </div>
                  <div className="h-8 w-px bg-white/10" />
                  <div className="text-center">
                    <p className="text-xs text-zinc-500">Protein</p>
                    <p className="font-bold text-zinc-200">{r.proteinG}g</p>
                  </div>
                  <div className="h-8 w-px bg-white/10" />
                  <div className="text-center">
                    <p className="text-xs text-zinc-500">Carbs</p>
                    <p className="font-bold text-zinc-200">{r.carbsG}g</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Shopping List Generator */}
      <div className="rounded-3xl border border-white/10 bg-zinc-950/40 p-6 shadow-xl backdrop-blur-md">
        <h3 className="mb-4 text-xl font-bold">Smart Shopping List</h3>
        <p className="mb-6 text-sm text-zinc-400">Merged from the first few recipes in your filtered list.</p>
        <ul className="columns-1 gap-4 sm:columns-2 lg:columns-3">
          {shoppingList(filtered.slice(0, 3)).map((item) => (
            <li key={item} className="mb-3 break-inside-avoid">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-white/20 transition-colors group-hover:border-[var(--accent)]">
                  {/* Fake checkbox */}
                </div>
                <span className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">{item}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
