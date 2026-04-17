"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, Target } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";

interface Mission {
  id: string;
  label: string;
  completed: boolean;
}

export function TodaysMission({ workoutName, targetKcal, waterMl }: { workoutName: string, targetKcal: number, waterMl: number }) {
  const [missions, setMissions] = useState<Mission[]>([
    { id: "m1", label: `Crush workout: ${workoutName}`, completed: false },
    { id: "m2", label: `Hit calorie target: ${targetKcal} kcal`, completed: false },
    { id: "m3", label: `Drink ${waterMl}ml of water`, completed: false },
    { id: "m4", label: "Review tomorrow's plan", completed: false },
  ]);

  const toggleMission = (id: string) => {
    setMissions((prev) =>
      prev.map((m) => (m.id === id ? { ...m, completed: !m.completed } : m))
    );
  };

  const completedCount = missions.filter((m) => m.completed).length;
  const progressPercent = (completedCount / missions.length) * 100;
  const allDone = completedCount === missions.length;

  return (
    <Card className={`relative overflow-hidden transition-all duration-500 ${allDone ? 'border-[var(--accent)]/50 bg-[var(--accent)]/5' : ''}`}>
      {/* Animated background progress bar */}
      <div 
        className="absolute left-0 top-0 h-1 bg-[var(--accent)] transition-all duration-1000"
        style={{ width: `${progressPercent}%` }}
      />
      
      <CardHeader 
        title="Today's Mission" 
        subtitle={allDone ? "Mission Accomplished! 🏆" : `${completedCount}/${missions.length} objectives completed`}
        action={
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent)]/10 text-[var(--accent)]">
            <Target size={18} />
          </div>
        }
      />
      
      <div className="space-y-3 mt-2">
        {missions.map((mission) => (
          <motion.div
            key={mission.id}
            layout
            onClick={() => toggleMission(mission.id)}
            className={`group flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors ${
              mission.completed 
                ? "border-transparent bg-white/5 text-[var(--muted)]" 
                : "border-white/10 bg-zinc-950/40 hover:bg-white/5 text-white"
            }`}
          >
            <div className={`transition-colors ${mission.completed ? "text-[var(--accent)]" : "text-[var(--muted)] group-hover:text-white"}`}>
              {mission.completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
            </div>
            <span className={`text-sm font-medium transition-all ${mission.completed ? "line-through opacity-70" : ""}`}>
              {mission.label}
            </span>
          </motion.div>
        ))}
      </div>
      
      {allDone && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 rounded-xl bg-[var(--accent)]/20 p-3 text-center text-sm font-bold text-[var(--accent)]"
        >
          Excellent work! You are one step closer to your goal.
        </motion.div>
      )}
    </Card>
  );
}
