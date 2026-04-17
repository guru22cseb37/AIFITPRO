"use client";

import { motion } from "framer-motion";

/** Map BMI to 0–100 position on a 15–40 scale for display */
function bmiToPct(bmi: number): number {
  const min = 15;
  const max = 40;
  const p = ((bmi - min) / (max - min)) * 100;
  return Math.min(100, Math.max(0, p));
}

export function BMIGauge({ bmi }: { bmi: number }) {
  const pct = bmiToPct(bmi);

  return (
    <div className="relative h-36 w-36">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
        <defs>
          <linearGradient id="bmiGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="35%" stopColor="#22c55e" />
            <stop offset="65%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
        </defs>
        <motion.circle
          cx="60"
          cy="60"
          r="52"
          fill="none"
          stroke="url(#bmiGrad)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={326}
          initial={{ strokeDashoffset: 326 }}
          animate={{ strokeDashoffset: 326 - (326 * pct) / 100 }}
          transition={{ type: "spring", stiffness: 80, damping: 18 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-[10px] uppercase tracking-widest text-[var(--muted)]">BMI</span>
        <span className="text-lg font-semibold">{bmi.toFixed(1)}</span>
      </div>
    </div>
  );
}
