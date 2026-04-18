"use client";

import { Droplets, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function HydrationTracker({
  waterToday,
  addWater,
}: {
  waterToday: number;
  addWater: (amount: number) => void;
}) {
  const target = 3000; // 3L default target
  const percent = Math.min(100, (waterToday / target) * 100);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/60 p-6 shadow-2xl backdrop-blur-xl">
      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/20 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
            <Droplets className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Hydration</h3>
            <p className="text-sm text-zinc-400">Daily target: {target / 1000}L</p>
          </div>
        </div>

        <div className="flex flex-col items-center sm:items-end gap-2">
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-black text-blue-400 tracking-tight">{waterToday}</span>
            <span className="text-sm font-medium text-zinc-500">/ {target} ml</span>
          </div>
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => addWater(250)}
              className="group relative flex items-center gap-1 overflow-hidden rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-400 transition-all hover:bg-blue-500/20 hover:shadow-[0_0_12px_rgba(59,130,246,0.4)] active:scale-95"
            >
              <Plus className="h-3 w-3" /> 250ml
            </button>
            <button
              onClick={() => addWater(500)}
              className="group relative flex items-center gap-1 overflow-hidden rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-400 transition-all hover:bg-blue-500/20 hover:shadow-[0_0_12px_rgba(59,130,246,0.4)] active:scale-95"
            >
              <Plus className="h-3 w-3" /> 500ml
            </button>
          </div>
        </div>
      </div>

      {/* Animated Water Fill Background */}
      <div
        className="absolute bottom-0 left-0 right-0 z-0 bg-gradient-to-t from-blue-500/20 to-blue-400/5 transition-all duration-1000 ease-out"
        style={{ height: `${percent}%` }}
      >
        <div className="absolute top-0 h-[1px] w-full bg-gradient-to-r from-transparent via-blue-400/50 to-transparent" />
      </div>
    </div>
  );
}
