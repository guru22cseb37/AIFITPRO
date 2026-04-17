"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/store/use-app-store";

export default function ProgressPage() {
  const progress = useAppStore((s) => s.progress);
  const addProgress = useAppStore((s) => s.addProgress);
  const workoutLogs = useAppStore((s) => s.workoutLogs);
  const prByExercise = useAppStore((s) => s.prByExercise);
  const streak = useAppStore((s) => s.streakDays);

  const [w, setW] = useState("");
  const [waist, setWaist] = useState("");
  const [bf, setBf] = useState("");

  const weightSeries = [...progress].reverse().map((p) => ({
    date: p.date,
    weight: p.weightKg,
    waist: p.waistCm ?? null,
  }));

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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Progress center</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Weight, measurements, streaks, PRs, and exports — connect a DB for cloud backup.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader title="Log check-in" />
          <div className="space-y-2">
            <label className="text-sm">
              <span className="text-[var(--muted)]">Weight (kg)</span>
              <Input type="number" value={w} onChange={(e) => setW(e.target.value)} />
            </label>
            <label className="text-sm">
              <span className="text-[var(--muted)]">Waist (cm)</span>
              <Input type="number" value={waist} onChange={(e) => setWaist(e.target.value)} />
            </label>
            <label className="text-sm">
              <span className="text-[var(--muted)]">Body fat % (optional)</span>
              <Input type="number" value={bf} onChange={(e) => setBf(e.target.value)} />
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
              Save entry
            </Button>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader
            title="Weight history"
            action={
              <Button type="button" size="sm" variant="outline" onClick={exportCsv}>
                Export CSV
              </Button>
            }
          />
          <div className="h-56">
            {weightSeries.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weightSeries}>
                  <XAxis dataKey="date" stroke="#71717a" fontSize={11} />
                  <YAxis stroke="#71717a" fontSize={11} domain={["auto", "auto"]} />
                  <Tooltip contentStyle={{ background: "#18181b", border: "1px solid rgba(255,255,255,0.1)" }} />
                  <Line type="monotone" dataKey="weight" stroke="var(--accent)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="flex h-full items-center justify-center text-sm text-[var(--muted)]">
                No entries yet — add your first check-in.
              </p>
            )}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Workout completion streak" subtitle="From schedule completions." />
          <p className="text-4xl font-bold">{streak} days</p>
        </Card>
        <Card>
          <CardHeader title="Volume (last sessions)" />
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={workoutLogs.slice(0, 8).map((l) => ({
                  name: l.exerciseName.slice(0, 10),
                  vol: l.sets * l.reps * l.weightKg,
                }))}
              >
                <XAxis dataKey="name" stroke="#71717a" fontSize={10} />
                <YAxis stroke="#71717a" fontSize={10} />
                <Tooltip contentStyle={{ background: "#18181b", border: "1px solid rgba(255,255,255,0.1)" }} />
                <Bar dataKey="vol" fill="var(--accent)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Personal records" />
        {Object.keys(prByExercise).length === 0 ? (
          <p className="text-sm text-[var(--muted)]">Log workouts to track PRs automatically.</p>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {Object.entries(prByExercise).map(([ex, kg]) => (
              <li key={ex} className="flex justify-between rounded-xl border border-white/10 px-3 py-2 text-sm">
                <span>{ex}</span>
                <span className="font-mono text-[var(--accent)]">{kg} kg</span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <CardHeader
          title="Progress photos"
          subtitle="Upload to S3/Cloudinary in production — compare side-by-side with privacy controls."
        />
        <div className="rounded-xl border border-dashed border-white/20 p-8 text-center text-sm text-[var(--muted)]">
          Drag & drop or use camera — WebRTC + encrypted storage integration placeholder.
        </div>
      </Card>
    </div>
  );
}
