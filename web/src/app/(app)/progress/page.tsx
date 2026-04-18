"use client";

import { useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  LineChart,
  Line,
  ReferenceLine,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/store/use-app-store";
import {
  TrendingDown,
  TrendingUp,
  Flame,
  Trophy,
  Scale,
  Target,
  Download,
  CalendarDays,
  Dumbbell,
} from "lucide-react";

/* ──────────────────────────────────────────────
   Helpers
────────────────────────────────────────────── */
function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-3xl border border-white/10 bg-zinc-950/40 p-6 shadow-xl backdrop-blur-md ${className}`}>
      {children}
    </div>
  );
}

function StatPill({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: any;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 transition-all hover:bg-white/10">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs font-medium text-zinc-500">{label}</p>
        <p className="text-lg font-bold text-white">{value}</p>
      </div>
    </div>
  );
}

const CustomTooltipStyle = {
  background: "rgba(9,9,11,0.95)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "12px",
  color: "#f4f4f5",
  fontSize: 12,
};

/* ──────────────────────────────────────────────
   Weight Prediction Engine
   Uses a linear regression over past weights to
   project a future date to reach the goal weight.
────────────────────────────────────────────── */
function predictGoalDate(
  weightSeries: { date: string; weight: number }[],
  goalKg: number
): string | null {
  if (weightSeries.length < 2) return null;

  // Simple linear regression (least squares)
  const n = weightSeries.length;
  const xs = weightSeries.map((_, i) => i);
  const ys = weightSeries.map((p) => p.weight);
  const meanX = xs.reduce((a, x) => a + x, 0) / n;
  const meanY = ys.reduce((a, y) => a + y, 0) / n;
  const slope =
    xs.reduce((a, x, i) => a + (x - meanX) * (ys[i] - meanY), 0) /
    xs.reduce((a, x) => a + (x - meanX) ** 2, 0);
  const intercept = meanY - slope * meanX;

  if (slope === 0) return null;

  // Steps needed from last entry
  const lastIdx = n - 1;
  const stepsNeeded = (goalKg - (slope * lastIdx + intercept)) / slope;
  if (stepsNeeded < 0) return "Already achieved! 🎉";
  if (stepsNeeded > 730) return "> 2 years";

  const lastDate = new Date(weightSeries[lastIdx].date);
  lastDate.setDate(lastDate.getDate() + Math.round(stepsNeeded));
  return lastDate.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

/* ──────────────────────────────────────────────
   Page
────────────────────────────────────────────── */
export default function ProgressPage() {
  const progress = useAppStore((s) => s.progress);
  const addProgress = useAppStore((s) => s.addProgress);
  const workoutLogs = useAppStore((s) => s.workoutLogs);
  const prByExercise = useAppStore((s) => s.prByExercise);
  const streak = useAppStore((s) => s.streakDays);
  const mealLogs = useAppStore((s) => s.mealLogs);
  const user = useAppStore((s) => s.user);

  const [w, setW] = useState("");
  const [waist, setWaist] = useState("");
  const [bf, setBf] = useState("");
  const [goalKg, setGoalKg] = useState(String(user?.weightKg ? user.weightKg - 5 : 70));

  // Build chart series (oldest first)
  const weightSeries = useMemo(
    () =>
      [...progress]
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((p) => ({ date: p.date.slice(5), weight: p.weightKg, waist: p.waistCm ?? null })),
    [progress]
  );

  // Weekly calorie data (last 7 days of meal logs)
  const calorieSeries = useMemo(() => {
    const days: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days[key] = 0;
    }
    mealLogs.forEach((m) => {
      if (m.date in days) days[m.date] += m.calories;
    });
    return Object.entries(days).map(([date, kcal]) => ({ date: date.slice(5), kcal }));
  }, [mealLogs]);

  // Prediction
  const predicted = useMemo(
    () => predictGoalDate(weightSeries.map(p => ({ date: p.date, weight: p.weight })), parseFloat(goalKg) || 0),
    [weightSeries, goalKg]
  );

  const latestWeight = progress.length ? progress[progress.length - 1].weightKg : null;
  const firstWeight = progress.length ? progress[0].weightKg : null;
  const weightChange = latestWeight && firstWeight ? latestWeight - firstWeight : null;

  const exportCsv = () => {
    const rows = [["date", "weightKg", "waistCm", "bodyFat"]];
    progress.forEach((p) => {
      rows.push([p.date, String(p.weightKg), String(p.waistCm ?? ""), String(p.bodyFatPct ?? "")]);
    });
    const blob = new Blob([rows.map((r) => r.join(",")).join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "aifit-progress.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-4xl font-black tracking-tight text-transparent">
            Progress Center
          </h1>
          <p className="mt-2 text-sm font-medium text-zinc-400">
            Weight trends, nutrition analytics, streaks, and PRs — all in one.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={exportCsv}
          className="gap-2 rounded-full border-white/10 bg-white/5"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatPill
          icon={Flame}
          label="Current Streak"
          value={`${streak} days 🔥`}
          color="bg-orange-500/20 text-orange-400"
        />
        <StatPill
          icon={Scale}
          label="Current Weight"
          value={latestWeight ? `${latestWeight} kg` : "—"}
          color="bg-blue-500/20 text-blue-400"
        />
        <StatPill
          icon={weightChange !== null && weightChange < 0 ? TrendingDown : TrendingUp}
          label="Total Change"
          value={weightChange !== null ? `${weightChange > 0 ? "+" : ""}${weightChange.toFixed(1)} kg` : "—"}
          color={weightChange !== null && weightChange < 0 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}
        />
        <StatPill
          icon={Trophy}
          label="Total PRs"
          value={`${Object.keys(prByExercise).length} exercises`}
          color="bg-amber-500/20 text-amber-400"
        />
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Log Check-In */}
        <GlassCard className="lg:col-span-4">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent)] text-zinc-950">
              <CalendarDays className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold">Log Check-In</h2>
          </div>
          <div className="space-y-3">
            <label className="block text-sm">
              <span className="mb-1 block text-zinc-400">Weight (kg)</span>
              <Input type="number" value={w} onChange={(e) => setW(e.target.value)} className="border-white/10 bg-white/5" />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-zinc-400">Waist (cm)</span>
              <Input type="number" value={waist} onChange={(e) => setWaist(e.target.value)} className="border-white/10 bg-white/5" />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-zinc-400">Body fat % (optional)</span>
              <Input type="number" value={bf} onChange={(e) => setBf(e.target.value)} className="border-white/10 bg-white/5" />
            </label>
            <Button
              type="button"
              className="w-full"
              onClick={() => {
                const weightKg = parseFloat(w);
                if (Number.isNaN(weightKg)) return;
                addProgress({
                  weightKg,
                  waistCm: waist ? parseFloat(waist) : undefined,
                  bodyFatPct: bf ? parseFloat(bf) : undefined,
                });
                setW("");
                setWaist("");
                setBf("");
              }}
            >
              Save Entry
            </Button>
          </div>
        </GlassCard>

        {/* Weight Chart */}
        <GlassCard className="lg:col-span-8">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400">
              <TrendingDown className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold">Weight History</h2>
          </div>
          <div className="h-56">
            {weightSeries.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weightSeries}>
                  <defs>
                    <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" stroke="#52525b" fontSize={11} />
                  <YAxis stroke="#52525b" fontSize={11} domain={["auto", "auto"]} />
                  <Tooltip contentStyle={CustomTooltipStyle} />
                  <Area
                    type="monotone"
                    dataKey="weight"
                    stroke="var(--accent)"
                    strokeWidth={2.5}
                    fill="url(#weightGrad)"
                    dot={{ fill: "var(--accent)", r: 4, strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-zinc-500">
                <Scale className="h-8 w-8 opacity-30" />
                <p className="text-sm">No entries yet — log your first check-in!</p>
              </div>
            )}
          </div>
        </GlassCard>
      </div>

      {/* Weight Prediction Engine */}
      <GlassCard>
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-500/20 text-green-400">
            <Target className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-bold">AI Weight Prediction Engine</h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm">
              <span className="mb-1 block text-zinc-400">Your goal weight (kg)</span>
              <Input
                type="number"
                value={goalKg}
                onChange={(e) => setGoalKg(e.target.value)}
                className="border-white/10 bg-white/5"
              />
            </label>
            <p className="mt-3 text-xs text-zinc-500">
              Based on your logged weight trend, we calculate when you will reach this goal.
            </p>
          </div>
          <div className="flex items-center justify-center rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/5 p-6 text-center">
            {weightSeries.length < 2 ? (
              <p className="text-sm text-zinc-500">Log at least 2 weight entries to see your prediction.</p>
            ) : (
              <div>
                <p className="text-xs uppercase tracking-widest text-zinc-500">Predicted Goal Date</p>
                <p className="mt-2 text-3xl font-black text-green-400">{predicted}</p>
                <p className="mt-1 text-xs text-zinc-500">based on your current trend</p>
              </div>
            )}
          </div>
        </div>
      </GlassCard>

      {/* Weekly Calorie Intake */}
      <GlassCard>
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
            <Flame className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-bold">Weekly Calorie Intake</h2>
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={calorieSeries}>
              <defs>
                <linearGradient id="calGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.9} />
                  <stop offset="95%" stopColor="var(--accent)" stopOpacity={0.3} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" stroke="#52525b" fontSize={11} />
              <YAxis stroke="#52525b" fontSize={11} />
              <Tooltip contentStyle={CustomTooltipStyle} formatter={(v) => [`${v} kcal`, "Calories"]} />
              <Bar dataKey="kcal" fill="url(#calGrad)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      {/* Workout Volume + PRs */}
      <div className="grid gap-6 lg:grid-cols-2">
        <GlassCard>
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400">
              <Dumbbell className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold">Workout Volume</h2>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={workoutLogs.slice(-8).map((l) => ({
                  name: l.exerciseName.slice(0, 8),
                  vol: l.sets * l.reps * l.weightKg,
                }))}
              >
                <defs>
                  <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.9} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0.3} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#52525b" fontSize={10} />
                <YAxis stroke="#52525b" fontSize={10} />
                <Tooltip contentStyle={CustomTooltipStyle} formatter={(v) => [`${v} kg`, "Volume"]} />
                <Bar dataKey="vol" fill="url(#volGrad)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
              <Trophy className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold">Personal Records</h2>
          </div>
          {Object.keys(prByExercise).length === 0 ? (
            <div className="flex h-32 flex-col items-center justify-center gap-2 text-center text-zinc-500">
              <Trophy className="h-8 w-8 opacity-30" />
              <p className="text-sm">Log workouts to automatically track PRs.</p>
            </div>
          ) : (
            <ul className="grid gap-2 sm:grid-cols-2">
              {Object.entries(prByExercise).map(([ex, kg]) => (
                <li
                  key={ex}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm transition-all hover:bg-white/10"
                >
                  <span className="font-medium text-zinc-300">{ex}</span>
                  <span className="rounded-full bg-amber-500/10 px-2 py-0.5 font-mono text-xs font-bold text-amber-400">
                    {kg} kg
                  </span>
                </li>
              ))}
            </ul>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
