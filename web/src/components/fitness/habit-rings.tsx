"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface RingProps {
  radius: number;
  stroke: number;
  progress: number;
  color: string;
  bgColor: string;
  label: string;
  icon?: React.ReactNode;
}

function Ring({ radius, stroke, progress, color, bgColor, label, icon }: RingProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
        <circle
          stroke={bgColor}
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          className="transition-all duration-1000 ease-in-out"
        />
        <motion.circle
          stroke={color}
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={circumference + " " + circumference}
          style={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: mounted ? strokeDashoffset : circumference }}
          transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-[var(--muted)] mb-1">{icon}</span>
        <span className="text-sm font-bold">{Math.round(progress)}%</span>
        <span className="text-[10px] uppercase tracking-wider text-[var(--muted)]">{label}</span>
      </div>
    </div>
  );
}

export function HabitRings({
  caloriesProgress,
  proteinProgress,
  waterProgress,
}: {
  caloriesProgress: number;
  proteinProgress: number;
  waterProgress: number;
}) {
  return (
    <div className="flex flex-wrap justify-around gap-4 py-4">
      <Ring
        radius={50}
        stroke={6}
        progress={Math.min(caloriesProgress, 100)}
        color="#ef4444"
        bgColor="rgba(239, 68, 68, 0.2)"
        label="Cals"
      />
      <Ring
        radius={50}
        stroke={6}
        progress={Math.min(proteinProgress, 100)}
        color="#3b82f6"
        bgColor="rgba(59, 130, 246, 0.2)"
        label="Protein"
      />
      <Ring
        radius={50}
        stroke={6}
        progress={Math.min(waterProgress, 100)}
        color="#10b981"
        bgColor="rgba(16, 185, 129, 0.2)"
        label="Water"
      />
    </div>
  );
}
