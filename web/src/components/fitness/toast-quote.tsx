"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Quote, X } from "lucide-react";

const ARNOLD_QUOTES = [
  "Strength does not come from winning. Your struggles develop your strengths.",
  "The last three or four reps is what makes the muscle grow. This area of pain divides the champion from someone else who is not a champion.",
  "If you want to turn a vision into reality, you have to give 100% and never stop believing in your dream.",
  "For me life is continuously being hungry. The meaning of life is not simply to exist, to survive, but to move ahead, to go up, to achieve, to conquer.",
  "What is the point of being on this Earth if you are going to be like everyone else?",
  "You can't climb the ladder of success with your hands in your pockets.",
];

export function ToastQuote() {
  const [isVisible, setIsVisible] = useState(false);
  const [quote, setQuote] = useState("");

  useEffect(() => {
    // Select a random quote
    setQuote(ARNOLD_QUOTES[Math.floor(Math.random() * ARNOLD_QUOTES.length)]);
    
    // Show after 1.5 seconds
    const showTimer = setTimeout(() => setIsVisible(true), 1500);
    
    // Hide after 10 seconds automatically
    const hideTimer = setTimeout(() => setIsVisible(false), 11500);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, x: 20 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed bottom-6 right-6 z-50 w-80 rounded-xl border border-[var(--accent)]/30 bg-zinc-950/90 p-4 shadow-2xl shadow-[var(--accent)]/10 backdrop-blur-md"
        >
          <button
            onClick={() => setIsVisible(false)}
            className="absolute right-2 top-2 rounded-full p-1 text-[var(--muted)] hover:bg-white/10 hover:text-white"
          >
            <X size={14} />
          </button>
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent)]/20 text-[var(--accent)]">
              <Quote size={16} />
            </div>
            <div>
              <p className="text-sm font-medium leading-relaxed text-white">
                "{quote}"
              </p>
              <p className="mt-2 text-xs font-bold uppercase tracking-widest text-[var(--accent)]">
                — Arnold
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
