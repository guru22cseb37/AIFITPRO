"use client";

import { motion } from "framer-motion";
import { quoteOfDay } from "@/data/quotes";

export function QuoteBanner() {
  const q = quoteOfDay();
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="animate-shimmer rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm text-zinc-200"
    >
      <span className="font-medium text-[var(--accent)]">Today&apos;s drive — </span>
      {q}
    </motion.div>
  );
}
