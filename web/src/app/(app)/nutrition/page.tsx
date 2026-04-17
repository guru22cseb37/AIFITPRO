"use client";

import { useMemo, useState } from "react";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

function shoppingList(recipes: Recipe[]): string[] {
  const set = new Set<string>();
  recipes.forEach((r) => r.ingredients.forEach((i) => set.add(i)));
  return Array.from(set);
}

export default function NutritionPage() {
  const user = useAppStore((s) => s.user);
  const water = useAppStore((s) => s.waterMlByDate);
  const addWater = useAppStore((s) => s.addWater);

  const [goal, setGoal] = useState<GoalType>(user?.goalType ?? "recomp");
  const [activity, setActivity] = useState<ActivityLevel>(user?.activity ?? "moderate");

  const tdee = user
    ? computeTdee(user.weightKg, user.heightCm, user.age, user.gender, activity)
    : 2200;
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Nutrition hub</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          TDEE targets, your food log by time of day, recipes, grocery lists, and hydration — saved on this device.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="TDEE & macro calculator" subtitle="Mifflin-St Jeor + activity factor." />
          {user ? (
            <p className="mb-3 text-sm text-[var(--muted)]">
              Using profile: {user.weightKg}kg • {user.heightCm}cm • {user.age}y
            </p>
          ) : null}
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">
              <span className="text-[var(--muted)]">Goal</span>
              <select
                className="mt-1 h-11 w-full rounded-xl border border-white/10 bg-zinc-950/50 px-3"
                value={goal}
                onChange={(e) => setGoal(e.target.value as GoalType)}
              >
                <option value="loss">Calorie deficit (fat loss)</option>
                <option value="gain">Calorie surplus (muscle gain)</option>
                <option value="recomp">Body recomposition</option>
              </select>
            </label>
            <label className="text-sm">
              <span className="text-[var(--muted)]">Activity</span>
              <select
                className="mt-1 h-11 w-full rounded-xl border border-white/10 bg-zinc-950/50 px-3"
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
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl bg-white/5 p-3 text-center">
              <p className="text-xs text-[var(--muted)]">TDEE</p>
              <p className="text-xl font-bold">{Math.round(tdee)}</p>
            </div>
            <div className="rounded-xl bg-white/5 p-3 text-center">
              <p className="text-xs text-[var(--muted)]">Target</p>
              <p className="text-xl font-bold">{target}</p>
            </div>
            <div className="rounded-xl bg-white/5 p-3 text-center">
              <p className="text-xs text-[var(--muted)]">P</p>
              <p className="text-xl font-bold">{macros.proteinG}g</p>
            </div>
            <div className="rounded-xl bg-white/5 p-3 text-center">
              <p className="text-xs text-[var(--muted)]">C / F</p>
              <p className="text-xl font-bold">
                {macros.carbsG} / {macros.fatG}
              </p>
            </div>
          </div>
        </Card>

        <DailyMealLog targetKcal={target} goalType={goal} />
      </div>

      <Card>
        <CardHeader
          title="Water intake"
          subtitle="Daily hydration target ~35ml/kg (adjust for climate & sweat)."
        />
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-2xl font-bold">{waterToday} ml</p>
          <Button type="button" size="sm" onClick={() => addWater(250)}>
            +250ml
          </Button>
          <Button type="button" size="sm" variant="secondary" onClick={() => addWater(500)}>
            +500ml
          </Button>
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Recipe database"
          subtitle="Filter by diet in your profile — add your own recipes in a future update."
        />
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((r) => (
            <div key={r.id} className="rounded-2xl border border-white/10 bg-zinc-950/40 p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold">{r.title}</h3>
                  <p className="text-xs text-[var(--muted)]">
                    {r.calories} kcal • {r.prepMin} min • {r.difficulty}
                  </p>
                </div>
                <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] uppercase text-zinc-400">
                  {r.diet.join(", ")}
                </span>
              </div>
              <p className="mt-2 text-sm text-[var(--muted)]">
                P {r.proteinG}g • C {r.carbsG}g • F {r.fatG}g
              </p>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader title="Shopping list generator" subtitle="Merged from the first few recipes in your filtered list." />
        <ul className="columns-1 gap-4 sm:columns-2">
          {shoppingList(filtered.slice(0, 3)).map((item) => (
            <li key={item} className="mb-2 break-inside-avoid text-sm text-[var(--muted)]">
              • {item}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
