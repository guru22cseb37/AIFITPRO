"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { EXERCISES, MUSCLE_GROUPS_AZ } from "@/data/exercises";
import { Card, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ExerciseVideoEmbed } from "@/components/fitness/exercise-video-embed";

const muscles = ["All", ...MUSCLE_GROUPS_AZ];
const equipments = ["All", ...Array.from(new Set(EXERCISES.flatMap((e) => e.equipment))).sort((a, b) => a.localeCompare(b))];

export default function WorkoutsPage() {
  const [q, setQ] = useState("");
  const [muscle, setMuscle] = useState("All");
  const [equip, setEquip] = useState("All");
  const [diff, setDiff] = useState<number | "All">("All");

  const filtered = useMemo(() => {
    return EXERCISES.filter((e) => {
      if (muscle !== "All" && e.muscle !== muscle) return false;
      if (equip !== "All" && !e.equipment.includes(equip)) return false;
      if (diff !== "All" && e.difficulty !== diff) return false;
      if (q && !e.name.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [q, muscle, equip, diff]);

  const groupedByMuscle = useMemo(() => {
    const map = new Map<string, typeof EXERCISES>();
    for (const ex of filtered) {
      const list = map.get(ex.muscle) ?? [];
      list.push(ex);
      map.set(ex.muscle, list);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [filtered]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Workout library (A–Z by muscle)</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {EXERCISES.length}+ movements across abs to traps — filter by muscle (alphabetical), equipment, and difficulty.
          Videos use privacy-enhanced YouTube embeds; tap play or use Open in YouTube if a blocker stops the player.
        </p>
      </div>

      <Card>
        <CardHeader title="Filters & search" />
        <div className="grid gap-3 md:grid-cols-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <Input className="pl-9" placeholder="Search exercises A–Z by name…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <select
            className="h-11 rounded-xl border border-white/10 bg-zinc-950/50 px-3 text-sm"
            value={muscle}
            onChange={(e) => setMuscle(e.target.value)}
          >
            {muscles.map((m) => (
              <option key={m} value={m}>
                Muscle: {m}
              </option>
            ))}
          </select>
          <select
            className="h-11 rounded-xl border border-white/10 bg-zinc-950/50 px-3 text-sm"
            value={equip}
            onChange={(e) => setEquip(e.target.value)}
          >
            {equipments.map((m) => (
              <option key={m} value={m}>
                Equipment: {m}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="text-xs text-[var(--muted)]">Difficulty:</span>
          {(["All", 1, 2, 3, 4, 5] as const).map((d) => (
            <Button
              key={String(d)}
              type="button"
              size="sm"
              variant={diff === d ? "primary" : "secondary"}
              onClick={() => setDiff(d)}
            >
              {d === "All" ? "All" : d}
            </Button>
          ))}
        </div>
      </Card>

      {muscle === "All" && !q ? (
        <div className="space-y-10">
          {groupedByMuscle.map(([group, items]) => (
            <section key={group} id={`muscle-${group.replace(/\s+/g, "-").toLowerCase()}`}>
              <h2 className="mb-4 border-b border-white/10 pb-2 text-lg font-semibold tracking-tight text-[var(--accent)]">
                {group}
                <span className="ml-2 text-sm font-normal text-[var(--muted)]">({items.length})</span>
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {items.map((ex) => (
                  <ExerciseCard key={ex.id} ex={ex} />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((ex) => (
            <ExerciseCard key={ex.id} ex={ex} />
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="text-center text-sm text-[var(--muted)]">No exercises match these filters.</p>
      ) : null}
    </div>
  );
}

function ExerciseCard({ ex }: { ex: (typeof EXERCISES)[number] }) {
  return (
    <Card className="overflow-hidden p-0">
      <ExerciseVideoEmbed videoUrl={ex.videoUrl} title={ex.name} />
      <div className="p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="font-semibold">{ex.name}</h2>
            <p className="text-xs text-[var(--muted)]">
              {ex.muscle} • Difficulty {ex.difficulty}/5
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={() => window.print()}>
            Print sheet
          </Button>
        </div>
        <p className="mt-3 text-sm text-[var(--muted)]">
          <span className="font-medium text-zinc-200">Cues: </span>
          {ex.cues}
        </p>
        <p className="mt-2 text-sm text-[var(--muted)]">
          <span className="font-medium text-zinc-200">Common mistakes: </span>
          {ex.mistakes}
        </p>
      </div>
    </Card>
  );
}
