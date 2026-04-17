"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { BEGINNER_WEEK, INTERMEDIATE_PPL } from "@/data/weekly-program";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WorkoutTimer } from "@/components/fitness/workout-timer";
import { ExerciseVideoEmbed } from "@/components/fitness/exercise-video-embed";
import { useAppStore } from "@/store/use-app-store";
import type { FitnessLevel } from "@/types/index";

function programForLevel(level: FitnessLevel) {
  if (level === "intermediate") return INTERMEDIATE_PPL;
  if (level === "advanced") return INTERMEDIATE_PPL;
  return BEGINNER_WEEK;
}

export default function SchedulePage() {
  const user = useAppStore((s) => s.user);
  const addLog = useAppStore((s) => s.addWorkoutLog);
  const completeDay = useAppStore((s) => s.completeWorkoutDay);
  const updatePr = useAppStore((s) => s.updatePr);
  const [exercise, setExercise] = useState("");
  const [weight, setWeight] = useState(40);
  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState(10);

  const week = user ? programForLevel(user.fitnessLevel) : BEGINNER_WEEK;
  const [active, setActive] = useState(0);
  const day = week[active];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Weekly schedule</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Expand each exercise to watch the demo inline (YouTube). Same library as Workouts — A–Z muscle coverage.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {week.map((d, i) => (
          <Button key={d.label} type="button" size="sm" variant={active === i ? "primary" : "secondary"} onClick={() => setActive(i)}>
            {d.label.slice(0, 3)}
          </Button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title={`${day.label} — ${day.focus}`}
            subtitle={day.durationMin ? `~${day.durationMin} min` : "Rest"}
          />
          {day.exercises.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">Rest & recovery — keep steps light and sleep consistent.</p>
          ) : (
            <ul className="space-y-4">
              {day.exercises.map((ex) => (
                <li key={ex.id} className="rounded-2xl border border-white/10 bg-zinc-950/40 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold">{ex.name}</p>
                      <p className="text-sm text-[var(--muted)]">
                        {ex.sets} sets × {ex.reps} reps • Rest {ex.restSec}s • Difficulty {ex.difficulty}/5
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">Equipment: {ex.equipment.join(", ")}</p>
                    </div>
                  </div>
                  <details className="group mt-3 overflow-hidden rounded-xl border border-white/10 open:border-[color-mix(in_oklab,var(--accent)_35%,transparent)]">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-2 bg-white/5 px-3 py-2 text-sm font-medium text-[var(--accent)] marker:content-none [&::-webkit-details-marker]:hidden">
                      <span>Watch demo (YouTube)</span>
                      <ChevronDown className="h-4 w-4 shrink-0 transition group-open:rotate-180" />
                    </summary>
                    <div className="border-t border-white/10 p-2">
                      <ExerciseVideoEmbed videoUrl={ex.videoUrl} title={`${ex.name} demo`} />
                    </div>
                  </details>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              type="button"
              onClick={() => {
                completeDay();
                day.exercises.forEach((ex) => {
                  const repNum =
                    typeof ex.reps === "string"
                      ? parseInt(ex.reps.split("-")[0] ?? "10", 10) || 10
                      : ex.reps;
                  addLog({
                    exerciseName: ex.name,
                    sets: ex.sets,
                    reps: repNum,
                    weightKg: weight,
                  });
                });
              }}
            >
              Mark day complete (demo log)
            </Button>
          </div>
        </Card>

        <div className="space-y-4">
          <WorkoutTimer />
          <Card>
            <CardHeader title="Quick log" subtitle="Track PRs and volume." />
            <div className="space-y-2 text-sm">
              <label className="block space-y-1">
                <span className="text-[var(--muted)]">Exercise</span>
                <input
                  className="h-11 w-full rounded-xl border border-white/10 bg-zinc-950/50 px-3"
                  value={exercise}
                  onChange={(e) => setExercise(e.target.value)}
                  placeholder="e.g. Bench press"
                />
              </label>
              <div className="grid grid-cols-3 gap-2">
                <label className="space-y-1">
                  <span className="text-[var(--muted)]">Sets</span>
                  <input
                    type="number"
                    className="h-11 w-full rounded-xl border border-white/10 bg-zinc-950/50 px-3"
                    value={sets}
                    onChange={(e) => setSets(Number(e.target.value))}
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-[var(--muted)]">Reps</span>
                  <input
                    type="number"
                    className="h-11 w-full rounded-xl border border-white/10 bg-zinc-950/50 px-3"
                    value={reps}
                    onChange={(e) => setReps(Number(e.target.value))}
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-[var(--muted)]">kg</span>
                  <input
                    type="number"
                    className="h-11 w-full rounded-xl border border-white/10 bg-zinc-950/50 px-3"
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                  />
                </label>
              </div>
              <Button
                type="button"
                className="w-full"
                variant="secondary"
                onClick={() => {
                  if (!exercise) return;
                  addLog({ exerciseName: exercise, sets, reps, weightKg: weight });
                  updatePr(exercise, weight);
                }}
              >
                Log set
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
