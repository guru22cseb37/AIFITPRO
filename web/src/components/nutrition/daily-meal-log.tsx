"use client";

import { useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import type { MealLog, MealSlot } from "@/types/index";
import type { GoalType } from "@/lib/calculations";
import { macroSplit } from "@/lib/calculations";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/store/use-app-store";

const SLOTS: { key: MealSlot; label: string; description: string }[] = [
  { key: "morning", label: "Morning", description: "Breakfast & early meals" },
  { key: "afternoon", label: "Afternoon", description: "Lunch & midday" },
  { key: "evening", label: "Evening", description: "Late afternoon / pre-dinner" },
  { key: "snack", label: "Snacks", description: "Anytime snacks" },
  { key: "dinner", label: "Dinner", description: "Main evening meal" },
];

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Map stored types to one of the five display columns */
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

  const consumed = dayMeals.reduce((a, m) => a + m.calories, 0);
  const totalP = dayMeals.reduce((a, m) => a + m.proteinG, 0);
  const totalC = dayMeals.reduce((a, m) => a + m.carbsG, 0);
  const totalF = dayMeals.reduce((a, m) => a + m.fatG, 0);

  const pct = targetKcal > 0 ? Math.min(100, (consumed / targetKcal) * 100) : 0;

  if (!user) {
    return (
      <Card>
        <CardHeader title="Food log" subtitle="Log in to track meals." />
        <p className="text-sm text-[var(--muted)]">Sign in to save your daily meals to this device.</p>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title="Today’s food log"
        subtitle="Log what you eat by time of day — calories and macros update your daily totals automatically."
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm">
          <span className="text-[var(--muted)]">Date</span>
          <Input
            type="date"
            className="w-auto min-w-[10rem]"
            value={logDate}
            max={todayISO()}
            onChange={(e) => setLogDate(e.target.value)}
          />
        </label>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <p className="text-4xl font-bold tabular-nums">{Math.round(consumed)}</p>
          <p className="text-sm text-[var(--muted)]">
            of {Math.round(targetKcal)} kcal • P {Math.round(totalP)}g • C {Math.round(totalC)}g • F {Math.round(totalF)}g
          </p>
        </div>
        <div className="h-3 min-w-[120px] flex-1 rounded-full bg-white/10 sm:max-w-xs">
          <div className="h-3 rounded-full bg-[var(--accent)] transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="mt-6 space-y-8">
        {SLOTS.map(({ key, label, description }) => (
          <MealSlotBlock
            key={key}
            label={label}
            description={description}
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
            onUpdate={(id, patch) => updateMeal(id, patch)}
            onDelete={(id) => deleteMeal(id)}
          />
        ))}
      </div>
    </Card>
  );
}

function MealSlotBlock({
  label,
  description,
  meals,
  goalType,
  onAdd,
  onUpdate,
  onDelete,
}: {
  label: string;
  description: string;
  meals: MealLog[];
  goalType: GoalType;
  onAdd: (data: {
    foodItems: string;
    calories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
  }) => void;
  onUpdate: (id: string, patch: Partial<Omit<MealLog, "id" | "userId">>) => void;
  onDelete: (id: string) => void;
}) {
  const [food, setFood] = useState("");
  const [calStr, setCalStr] = useState("");
  const [pStr, setPStr] = useState("");
  const [cStr, setCStr] = useState("");
  const [fStr, setFStr] = useState("");
  const [showMacros, setShowMacros] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const slotTotal = meals.reduce((a, m) => a + m.calories, 0);

  function resetForm() {
    setFood("");
    setCalStr("");
    setPStr("");
    setCStr("");
    setFStr("");
    setShowMacros(false);
  }

  function submitAdd() {
    const cal = parseNum(calStr);
    if (!food.trim() || cal === null || cal <= 0) return;

    const pIn = parseNum(pStr);
    const cIn = parseNum(cStr);
    const fIn = parseNum(fStr);
    const typedAnyMacro = pStr.trim() !== "" || cStr.trim() !== "" || fStr.trim() !== "";

    let proteinG: number;
    let carbsG: number;
    let fatG: number;

    if (typedAnyMacro && pIn !== null && cIn !== null && fIn !== null) {
      proteinG = pIn;
      carbsG = cIn;
      fatG = fIn;
    } else {
      const split = macroSplit(cal, goalType);
      proteinG = split.proteinG;
      carbsG = split.carbsG;
      fatG = split.fatG;
    }

    onAdd({
      foodItems: food.trim(),
      calories: cal,
      proteinG,
      carbsG,
      fatG,
    });
    resetForm();
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-zinc-950/30 p-4">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h3 className="font-semibold text-[var(--accent)]">{label}</h3>
          <p className="text-xs text-[var(--muted)]">{description}</p>
        </div>
        {meals.length > 0 ? (
          <span className="text-sm tabular-nums text-zinc-400">
            {Math.round(slotTotal)} kcal in this block
          </span>
        ) : null}
      </div>

      <ul className="mb-4 space-y-2">
        {meals.map((m) => (
          <li
            key={m.id}
            className="flex flex-col gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
          >
            {editingId === m.id ? (
              <EditMealRow
                meal={m}
                goalType={goalType}
                onSave={(patch) => {
                  onUpdate(m.id, patch);
                  setEditingId(null);
                }}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-zinc-100">{m.foodItems}</p>
                  <p className="text-xs text-[var(--muted)]">
                    {Math.round(m.calories)} kcal • P {Math.round(m.proteinG)}g • C {Math.round(m.carbsG)}g • F{" "}
                    {Math.round(m.fatG)}g
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button type="button" size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setEditingId(m.id)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button type="button" size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-400" onClick={() => onDelete(m.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>

      <div className="space-y-2 rounded-xl border border-dashed border-white/15 p-3">
        <p className="text-xs font-medium text-zinc-500">Add food for {label.toLowerCase()}</p>
        <Input placeholder="What did you eat? (e.g. Oats, banana, coffee)" value={food} onChange={(e) => setFood(e.target.value)} />
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="text-xs">
            <span className="text-[var(--muted)]">Calories (kcal) *</span>
            <Input inputMode="decimal" placeholder="e.g. 450" value={calStr} onChange={(e) => setCalStr(e.target.value)} />
          </label>
          <div className="flex items-end">
            <Button type="button" size="sm" variant="secondary" className="w-full" onClick={() => setShowMacros((s) => !s)}>
              {showMacros ? "Hide macros" : "Add protein / carbs / fat (optional)"}
            </Button>
          </div>
        </div>
        {showMacros ? (
          <div className="grid grid-cols-3 gap-2">
            <label className="text-xs">
              <span className="text-[var(--muted)]">Protein g</span>
              <Input inputMode="decimal" placeholder="auto" value={pStr} onChange={(e) => setPStr(e.target.value)} />
            </label>
            <label className="text-xs">
              <span className="text-[var(--muted)]">Carbs g</span>
              <Input inputMode="decimal" placeholder="auto" value={cStr} onChange={(e) => setCStr(e.target.value)} />
            </label>
            <label className="text-xs">
              <span className="text-[var(--muted)]">Fat g</span>
              <Input inputMode="decimal" placeholder="auto" value={fStr} onChange={(e) => setFStr(e.target.value)} />
            </label>
          </div>
        ) : null}
        <Button type="button" className="w-full gap-2 sm:w-auto" onClick={submitAdd} disabled={!food.trim() || !parseNum(calStr)}>
          <Plus className="h-4 w-4" />
          Add to {label}
        </Button>
      </div>
    </section>
  );
}

function EditMealRow({
  meal,
  goalType,
  onSave,
  onCancel,
}: {
  meal: MealLog;
  goalType: GoalType;
  onSave: (patch: Partial<Omit<MealLog, "id" | "userId">>) => void;
  onCancel: () => void;
}) {
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
    onSave({
      foodItems: food.trim(),
      calories: cal,
      proteinG,
      carbsG,
      fatG,
    });
  }

  return (
    <div className="w-full space-y-2">
      <Input value={food} onChange={(e) => setFood(e.target.value)} />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Input placeholder="kcal" value={calStr} onChange={(e) => setCalStr(e.target.value)} />
        <Input placeholder="P g" value={pStr} onChange={(e) => setPStr(e.target.value)} />
        <Input placeholder="C g" value={cStr} onChange={(e) => setCStr(e.target.value)} />
        <Input placeholder="F g" value={fStr} onChange={(e) => setFStr(e.target.value)} />
      </div>
      <div className="flex gap-2">
        <Button type="button" size="sm" onClick={save}>
          Save
        </Button>
        <Button type="button" size="sm" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
