"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface CircularProgressProps {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  colorClass?: string;
  label?: string;
  subLabel?: string;
  className?: string;
}

export function CircularProgress({
  value,
  max,
  size = 120,
  strokeWidth = 10,
  colorClass = "text-[var(--accent)]",
  label,
  subLabel,
  className,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percent = max > 0 ? Math.min(value / max, 1) : 0;
  const offset = circumference - percent * circumference;

  return (
    <div className={cn("relative flex flex-col items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg className="absolute inset-0 -rotate-90 transform" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          className="text-white/10"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className={cn("transition-all duration-1000 ease-out", colorClass)}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        {label && <span className="text-xl font-bold tabular-nums">{label}</span>}
        {subLabel && <span className="text-xs text-[var(--muted)]">{subLabel}</span>}
      </div>
    </div>
  );
}

export function RingDashboard({
  consumedKcal,
  targetKcal,
  consumedP,
  targetP,
  consumedC,
  targetC,
  consumedF,
  targetF,
}: {
  consumedKcal: number;
  targetKcal: number;
  consumedP: number;
  targetP: number;
  consumedC: number;
  targetC: number;
  consumedF: number;
  targetF: number;
}) {
  const remaining = Math.max(0, targetKcal - consumedKcal);
  const isOver = consumedKcal > targetKcal;

  return (
    <div className="flex flex-col items-center justify-center gap-6 rounded-3xl border border-white/10 bg-zinc-950/60 p-6 shadow-2xl backdrop-blur-xl">
      {/* Main Calorie Ring */}
      <div className="relative flex items-center justify-center">
        <CircularProgress
          value={consumedKcal}
          max={targetKcal}
          size={180}
          strokeWidth={14}
          colorClass={isOver ? "text-red-500 drop-shadow-[0_0_12px_rgba(239,68,68,0.5)]" : "text-[var(--accent)] drop-shadow-[0_0_12px_var(--accent-glow)]"}
        />
        <div className="absolute flex flex-col items-center text-center">
          <span className="text-sm font-medium text-[var(--muted)]">Remaining</span>
          <span className={cn("text-3xl font-black tabular-nums tracking-tight", isOver && "text-red-400")}>
            {Math.round(isOver ? consumedKcal - targetKcal : remaining)}
          </span>
          <span className="text-xs font-semibold text-[var(--muted)]">{isOver ? "kcal over" : "kcal"}</span>
        </div>
      </div>

      {/* Macros Rings */}
      <div className="flex w-full justify-between gap-4 sm:justify-evenly">
        <div className="flex flex-col items-center gap-2">
          <CircularProgress
            value={consumedP}
            max={targetP}
            size={70}
            strokeWidth={6}
            colorClass="text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
            label={`${Math.round(consumedP)}g`}
            subLabel="Protein"
          />
          <span className="text-[10px] text-[var(--muted)]">{Math.round(targetP)}g goal</span>
        </div>
        
        <div className="flex flex-col items-center gap-2">
          <CircularProgress
            value={consumedC}
            max={targetC}
            size={70}
            strokeWidth={6}
            colorClass="text-purple-500 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]"
            label={`${Math.round(consumedC)}g`}
            subLabel="Carbs"
          />
          <span className="text-[10px] text-[var(--muted)]">{Math.round(targetC)}g goal</span>
        </div>
        
        <div className="flex flex-col items-center gap-2">
          <CircularProgress
            value={consumedF}
            max={targetF}
            size={70}
            strokeWidth={6}
            colorClass="text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]"
            label={`${Math.round(consumedF)}g`}
            subLabel="Fat"
          />
          <span className="text-[10px] text-[var(--muted)]">{Math.round(targetF)}g goal</span>
        </div>
      </div>
    </div>
  );
}
