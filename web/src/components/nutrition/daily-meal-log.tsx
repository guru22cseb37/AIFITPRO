"use client";

import { useMemo, useState } from "react";
import { Check, Edit2, Pencil, Plus, Trash2, X, Sparkles, Loader2 } from "lucide-react";
import type { MealLog, MealSlot } from "@/types/index";
import type { GoalType } from "@/lib/calculations";
import { macroSplit } from "@/lib/calculations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/store/use-app-store";
import { cn } from "@/lib/utils";

const SLOTS: { key: MealSlot; label: string; description: string; icon: string }[] = [
  { key: "morning", label: "Breakfast", description: "Morning fuel", icon: "🍳" },
  { key: "afternoon", label: "Lunch", description: "Midday energy", icon: "🥗" },
  { key: "snack", label: "Snacks", description: "Quick bites", icon: "🍎" },
  { key: "dinner", label: "Dinner", description: "Evening recovery", icon: "🍲" },
];

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function normalizeMealSlot(mealType: MealLog["mealType"]): MealSlot {
  if (mealType === "breakfast") return "morning";
  if (mealType === "lunch") return "afternoon";
  return mealType;
}

function parseNum(s: string): number | null {
  const n = parseFloat(s.replace(",", "."));
  if (Number.isNaN(n) || n < 0) return null;
  return n;
}

export function DailyMealLog({ targetKcal, goalType }: { targetKcal: number; goalType: GoalType }) {
  const user = useAppStore((s) => s.user);
  const mealLogs = useAppStore((s) => s.mealLogs);
  const addMeal = useAppStore((s) => s.addMealLog);
  const updateMeal = useAppStore((s) => s.updateMealLog);
  const deleteMeal = useAppStore((s) => s.deleteMealLog);

  const [logDate, setLogDate] = useState(todayISO);

  const dayMeals = useMemo(() => {
    if (!user) return [];
    return mealLogs.filter((m) => m.userId === user.id && m.date === logDate);
  }, [mealLogs, user, logDate]);

  if (!user) {
    return (
      <div className="rounded-3xl border border-white/10 bg-zinc-950/60 p-8 text-center shadow-2xl backdrop-blur-xl">
        <h3 className="text-xl font-semibold">Food Log</h3>
        <p className="mt-2 text-sm text-[var(--muted)]">Sign in to start tracking your daily nutrition.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Today's Meals</h2>
        <Input
          type="date"
          className="w-auto border-none bg-white/5 font-medium text-white shadow-inner"
          value={logDate}
          max={todayISO()}
          onChange={(e) => setLogDate(e.target.value)}
        />
      </div>

      <div className="grid gap-4">
        {SLOTS.map(({ key, label, description, icon }) => (
          <MealSlotBlock
            key={key}
            label={label}
            description={description}
            icon={icon}
            meals={dayMeals.filter((m) => normalizeMealSlot(m.mealType) === key)}
            goalType={goalType}
            onAdd={(data) =>
              addMeal({
                mealType: key,
                foodItems: data.foodItems,
                calories: data.calories,
                proteinG: data.proteinG,
                carbsG: data.carbsG,
                fatG: data.fatG,
                date: logDate,
              })
            }
            onUpdate={updateMeal}
            onDelete={deleteMeal}
          />
        ))}
      </div>
    </div>
  );
}

function MealSlotBlock({
  label,
  description,
  icon,
  meals,
  goalType,
  onAdd,
  onUpdate,
  onDelete,
}: {
  label: string;
  description: string;
  icon: string;
  meals: MealLog[];
  goalType: GoalType;
  onAdd: (data: { foodItems: string; calories: number; proteinG: number; carbsG: number; fatG: number }) => void;
  onUpdate: (id: string, patch: Partial<Omit<MealLog, "id" | "userId">>) => void;
  onDelete: (id: string) => void;
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isEstimating, setIsEstimating] = useState(false);

  const [food, setFood] = useState("");
  const [calStr, setCalStr] = useState("");
  const [pStr, setPStr] = useState("");
  const [cStr, setCStr] = useState("");
  const [fStr, setFStr] = useState("");

  const slotTotal = meals.reduce((a, m) => a + m.calories, 0);

  function submitAdd() {
    const cal = parseNum(calStr);
    if (!food.trim() || cal === null || cal <= 0) return;

    let proteinG = parseNum(pStr);
    let carbsG = parseNum(cStr);
    let fatG = parseNum(fStr);

    if (proteinG === null || carbsG === null || fatG === null) {
      const split = macroSplit(cal, goalType);
      proteinG = split.proteinG;
      carbsG = split.carbsG;
      fatG = split.fatG;
    }

    onAdd({ foodItems: food.trim(), calories: cal, proteinG, carbsG, fatG });
    setFood("");
    setCalStr("");
    setPStr("");
    setCStr("");
    setFStr("");
    setIsAdding(false);
  }

  async function estimateMacros() {
    if (!food.trim()) return;
    setIsEstimating(true);
    try {
      const res = await fetch("/api/ai/macros", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ food: food.trim() }),
      });
      if (!res.ok) throw new Error("Failed to estimate macros");
      const data = await res.json();
      setCalStr(String(Math.round(data.calories)));
      setPStr(String(Math.round(data.proteinG)));
      setCStr(String(Math.round(data.carbsG)));
      setFStr(String(Math.round(data.fatG)));
    } catch (err) {
      console.error(err);
      alert("Failed to auto-estimate. Please try again.");
    } finally {
      setIsEstimating(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/40 shadow-xl backdrop-blur-md transition-all hover:bg-zinc-950/60">
      {/* Header */}
      <div className="flex items-center justify-between p-5">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-2xl shadow-inner">
            {icon}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{label}</h3>
            <p className="text-xs text-[var(--muted)]">{description}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {meals.length > 0 && (
            <span className="text-lg font-black tracking-tight text-[var(--accent)] drop-shadow-[0_0_8px_var(--accent-glow)]">
              {Math.round(slotTotal)} <span className="text-xs font-normal text-zinc-500">kcal</span>
            </span>
          )}
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent)] text-zinc-950 transition-transform hover:scale-110 hover:shadow-[0_0_15px_var(--accent-glow)] active:scale-95"
          >
            {isAdding ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Add Form */}
      {isAdding && (
        <div className="border-t border-white/5 bg-black/20 p-5">
          <div className="flex flex-wrap gap-4 items-start">
            <div className="flex min-w-[200px] flex-1 gap-2">
              <Input
                placeholder="What did you eat? (e.g. 2 dosas with dal)"
                className="flex-1 border-white/10 bg-white/5 shadow-inner"
                value={food}
                onChange={(e) => setFood(e.target.value)}
                autoFocus
              />
              <Button 
                onClick={estimateMacros} 
                disabled={!food.trim() || isEstimating}
                className="shrink-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-[0_0_10px_rgba(245,158,11,0.3)] hover:shadow-[0_0_15px_rgba(245,158,11,0.5)] transition-all px-3"
              >
                {isEstimating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 mr-1.5" />}
                {isEstimating ? "Estimating..." : "AI Estimate"}
              </Button>
            </div>
            
            <div className="flex shrink-0 flex-wrap gap-2">
              <Input
                placeholder="Calories"
                className="w-24 border-white/10 bg-white/5 text-center shadow-inner focus:border-[var(--accent)] transition-colors"
                value={calStr}
                onChange={(e) => setCalStr(e.target.value)}
                inputMode="decimal"
              />
              <div className="flex shrink-0 gap-2">
                <Input placeholder="P" className="w-14 border-white/10 bg-white/5 px-1 text-center shadow-inner focus:border-blue-500 transition-colors" value={pStr} onChange={(e) => setPStr(e.target.value)} />
                <Input placeholder="C" className="w-14 border-white/10 bg-white/5 px-1 text-center shadow-inner focus:border-purple-500 transition-colors" value={cStr} onChange={(e) => setCStr(e.target.value)} />
                <Input placeholder="F" className="w-14 border-white/10 bg-white/5 px-1 text-center shadow-inner focus:border-amber-500 transition-colors" value={fStr} onChange={(e) => setFStr(e.target.value)} />
                <Button onClick={submitAdd} disabled={!food.trim() || !parseNum(calStr)} className="shrink-0 px-3">
                  <Check className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Meal Items */}
      {meals.length > 0 && (
        <div className="border-t border-white/5 px-5 pb-5 pt-3">
          <ul className="space-y-3">
            {meals.map((m) => (
              <li key={m.id} className="group flex items-center justify-between rounded-2xl bg-white/5 p-3 shadow-sm transition-all hover:bg-white/10">
                {editingId === m.id ? (
                  <EditMealRow
                    meal={m}
                    goalType={goalType}
                    onSave={(patch: Partial<Omit<MealLog, "id" | "userId">>) => {
                      onUpdate(m.id, patch);
                      setEditingId(null);
                    }}
                    onCancel={() => setEditingId(null)}
                  />
                ) : (
                  <>
                    <div className="flex-1">
                      <p className="font-semibold text-zinc-100">{m.foodItems}</p>
                      <div className="mt-1 flex gap-3 text-xs font-medium text-zinc-400">
                        <span><span className="text-zinc-500">P</span> {Math.round(m.proteinG)}g</span>
                        <span><span className="text-zinc-500">C</span> {Math.round(m.carbsG)}g</span>
                        <span><span className="text-zinc-500">F</span> {Math.round(m.fatG)}g</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold tabular-nums text-zinc-200">{Math.round(m.calories)} kcal</span>
                      <div className="flex opacity-0 transition-opacity group-hover:opacity-100">
                        <button onClick={() => setEditingId(m.id)} className="p-2 text-zinc-400 hover:text-white">
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button onClick={() => onDelete(m.id)} className="p-2 text-red-400/70 hover:text-red-400">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function EditMealRow({ meal, goalType, onSave, onCancel }: any) {
  const [food, setFood] = useState(meal.foodItems);
  const [calStr, setCalStr] = useState(String(meal.calories));
  const [pStr, setPStr] = useState(String(Math.round(meal.proteinG)));
  const [cStr, setCStr] = useState(String(Math.round(meal.carbsG)));
  const [fStr, setFStr] = useState(String(Math.round(meal.fatG)));

  function save() {
    const cal = parseNum(calStr);
    if (!food.trim() || cal === null || cal <= 0) return;
    let proteinG = parseNum(pStr);
    let carbsG = parseNum(cStr);
    let fatG = parseNum(fStr);
    if (proteinG === null || carbsG === null || fatG === null) {
      const split = macroSplit(cal, goalType);
      proteinG = split.proteinG;
      carbsG = split.carbsG;
      fatG = split.fatG;
    }
    onSave({ foodItems: food.trim(), calories: cal, proteinG, carbsG, fatG });
  }

  return (
    <div className="flex w-full flex-col gap-2 sm:flex-row">
      <Input value={food} onChange={(e) => setFood(e.target.value)} className="flex-1 border-white/10 bg-black/40" />
      <Input value={calStr} onChange={(e) => setCalStr(e.target.value)} className="w-20 border-white/10 bg-black/40 text-center" />
      <div className="flex gap-1">
        <Input value={pStr} onChange={(e) => setPStr(e.target.value)} className="w-14 border-white/10 bg-black/40 px-1 text-center" />
        <Input value={cStr} onChange={(e) => setCStr(e.target.value)} className="w-14 border-white/10 bg-black/40 px-1 text-center" />
        <Input value={fStr} onChange={(e) => setFStr(e.target.value)} className="w-14 border-white/10 bg-black/40 px-1 text-center" />
      </div>
      <div className="flex gap-1">
        <Button size="sm" onClick={save} className="h-11 px-3"><Check className="h-4 w-4" /></Button>
        <Button size="sm" variant="secondary" onClick={onCancel} className="h-11 px-3"><X className="h-4 w-4" /></Button>
      </div>
    </div>
  );
}
