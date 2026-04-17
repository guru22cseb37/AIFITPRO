"use client";

import { motion } from "framer-motion";

export function MuscleHeatmap({ focus }: { focus: string }) {
  // Simple abstraction of body parts based on focus
  const isUpper = focus.toLowerCase().includes("upper") || focus.toLowerCase().includes("push") || focus.toLowerCase().includes("pull");
  const isLower = focus.toLowerCase().includes("lower") || focus.toLowerCase().includes("legs");
  const isCore = focus.toLowerCase().includes("core") || focus.toLowerCase().includes("abs") || focus.toLowerCase().includes("conditioning");
  const isFull = focus.toLowerCase().includes("full") || focus.toLowerCase().includes("conditioning");

  const getColor = (active: boolean) => {
    if (isFull) return "var(--accent)";
    return active ? "var(--accent)" : "rgba(255,255,255,0.05)";
  };

  const getOpacity = (active: boolean) => {
    if (isFull) return 0.8;
    return active ? 0.8 : 0.2;
  };

  return (
    <div className="flex flex-col items-center justify-center py-2">
      <div className="relative h-40 w-24">
        {/* Head/Neck */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.2 }}
          className="absolute left-1/2 top-0 h-6 w-6 -translate-x-1/2 rounded-full bg-white"
        />
        {/* Torso/Upper Body */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: getOpacity(isUpper) }}
          className="absolute left-1/2 top-7 h-14 w-12 -translate-x-1/2 rounded-lg"
          style={{ backgroundColor: getColor(isUpper), transition: "all 0.5s" }}
        />
        {/* Arms */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: getOpacity(isUpper) }}
          className="absolute left-2 top-7 h-16 w-3 rounded-full"
          style={{ backgroundColor: getColor(isUpper), transition: "all 0.5s delay 0.1s" }}
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: getOpacity(isUpper) }}
          className="absolute right-2 top-7 h-16 w-3 rounded-full"
          style={{ backgroundColor: getColor(isUpper), transition: "all 0.5s delay 0.1s" }}
        />
        {/* Core */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: getOpacity(isCore) }}
          className="absolute left-1/2 top-16 h-8 w-10 -translate-x-1/2 rounded-md"
          style={{ backgroundColor: getColor(isCore), transition: "all 0.5s delay 0.2s" }}
        />
        {/* Legs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: getOpacity(isLower) }}
          className="absolute left-[30%] top-24 h-16 w-4 -translate-x-1/2 rounded-full"
          style={{ backgroundColor: getColor(isLower), transition: "all 0.5s delay 0.3s" }}
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: getOpacity(isLower) }}
          className="absolute right-[30%] top-24 h-16 w-4 translate-x-1/2 rounded-full"
          style={{ backgroundColor: getColor(isLower), transition: "all 0.5s delay 0.3s" }}
        />
      </div>
      <p className="mt-2 text-xs font-bold uppercase tracking-widest text-[var(--muted)]">
        Target: <span className="text-white">{focus}</span>
      </p>
    </div>
  );
}
