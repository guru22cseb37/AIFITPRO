"use client";

import { Flame } from "lucide-react";

interface StreakBadgeProps {
  days: number;
}

export function StreakBadge({ days }: StreakBadgeProps) {
  if (days === 0) return null;

  return (
    <div className="flex items-center gap-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1.5 text-sm font-bold text-orange-400 shadow-[0_0_12px_rgba(249,115,22,0.2)] transition-all hover:shadow-[0_0_20px_rgba(249,115,22,0.35)]">
      <Flame className="h-4 w-4 animate-pulse text-orange-400" />
      <span>{days}</span>
      <span className="hidden text-xs font-normal text-orange-400/70 sm:block">day streak</span>
    </div>
  );
}
