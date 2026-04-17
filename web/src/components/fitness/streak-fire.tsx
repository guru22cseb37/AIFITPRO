"use client";

import { motion } from "framer-motion";
import { Flame } from "lucide-react";

export function StreakFire({ days }: { days: number }) {
  // Determine fire intensity based on days
  const getFireColor = () => {
    if (days >= 30) return "#8b5cf6"; // Purple fire (epic)
    if (days >= 14) return "#3b82f6"; // Blue fire (hot)
    if (days >= 7) return "#10b981"; // Green fire (solid)
    return "#ef4444"; // Red/Orange fire (starter)
  };

  const getGlow = () => {
    if (days >= 30) return "0 0 20px rgba(139, 92, 246, 0.6)";
    if (days >= 14) return "0 0 15px rgba(59, 130, 246, 0.5)";
    if (days >= 7) return "0 0 10px rgba(16, 185, 129, 0.4)";
    return "0 0 5px rgba(239, 68, 68, 0.3)";
  };

  return (
    <div className="flex flex-col items-center justify-center p-2">
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.8, 1, 0.8],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="relative"
      >
        <Flame
          size={32}
          style={{ color: getFireColor(), filter: `drop-shadow(${getGlow()})` }}
          strokeWidth={1.5}
        />
        {/* Particle effects for high streaks */}
        {days >= 7 && (
          <motion.div
            className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: getFireColor() }}
            animate={{ y: [-5, -15], opacity: [1, 0], scale: [1, 0.5] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
          />
        )}
        {days >= 14 && (
          <motion.div
            className="absolute top-1 -left-1 w-1 h-1 rounded-full"
            style={{ backgroundColor: getFireColor() }}
            animate={{ y: [-2, -12], opacity: [1, 0], scale: [1, 0.5] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: 0.5 }}
          />
        )}
      </motion.div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="text-xl font-black tracking-tighter" style={{ color: getFireColor() }}>
          {days}
        </span>
        <span className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">Days</span>
      </div>
      <div className="mt-1 text-[10px] font-medium text-[var(--muted)]">
        {days >= 30 ? "Unstoppable!" : days >= 14 ? "On Fire!" : days >= 7 ? "Heating Up!" : "Keep it going"}
      </div>
    </div>
  );
}
