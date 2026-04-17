"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Timer, X, Play, Pause, RotateCcw } from "lucide-react";

export function FloatingWorkoutTimer() {
  const [isOpen, setIsOpen] = useState(false);
  const [seconds, setSeconds] = useState(60);
  const [remaining, setRemaining] = useState(60);
  const [running, setRunning] = useState(false);
  const interval = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!running) return;
    interval.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          setRunning(false);
          try {
            const ctx = new window.AudioContext();
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.connect(g);
            g.connect(ctx.destination);
            o.frequency.value = 880;
            g.gain.value = 0.1;
            o.start();
            setTimeout(() => o.stop(), 300);
          } catch {
            /* ignore */
          }
          return seconds;
        }
        return r - 1;
      });
    }, 1000);
    return () => {
      if (interval.current) clearInterval(interval.current);
    };
  }, [running, seconds]);

  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");

  const progress = ((seconds - remaining) / seconds) * 100;

  return (
    <>
      {/* Floating Action Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--accent)] text-black shadow-lg shadow-[var(--accent)]/30 transition-shadow hover:shadow-[var(--accent)]/50"
          >
            <Timer size={24} strokeWidth={2.5} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Timer Widget */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-6 right-6 z-50 w-72 overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/95 shadow-2xl backdrop-blur-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-4 py-3">
              <div className="flex items-center gap-2">
                <Timer size={16} className="text-[var(--accent)]" />
                <span className="text-sm font-bold tracking-widest text-white uppercase">Rest Timer</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1 text-[var(--muted)] hover:bg-white/10 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Timer Display */}
            <div className="p-5 text-center relative">
               {/* Progress bar background */}
               <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
                 <div 
                   className="h-full bg-[var(--accent)] transition-all duration-1000 ease-linear"
                   style={{ width: `${progress}%` }}
                 />
               </div>
               
              <p className="font-mono text-5xl font-black tracking-tight text-white drop-shadow-md">
                {mm}:{ss}
              </p>
              <p className="mt-1 text-xs text-[var(--muted)] uppercase tracking-wider font-semibold">
                {running ? "Focus & Recover" : "Ready"}
              </p>
            </div>

            {/* Controls */}
            <div className="px-4 pb-4 space-y-3">
              <div className="flex justify-center gap-2">
                {[30, 45, 60, 90].map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setSeconds(s);
                      setRemaining(s);
                      setRunning(false);
                    }}
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-colors ${
                      seconds === s && !running
                        ? "bg-[var(--accent)] text-black"
                        : "bg-white/5 text-[var(--muted)] hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {s}s
                  </button>
                ))}
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setRunning((r) => !r)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--accent)] py-2.5 text-sm font-bold text-black transition-transform active:scale-95"
                >
                  {running ? (
                    <>
                      <Pause size={16} fill="currentColor" /> Pause
                    </>
                  ) : (
                    <>
                      <Play size={16} fill="currentColor" /> Start
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setRunning(false);
                    setRemaining(seconds);
                  }}
                  className="flex items-center justify-center rounded-xl bg-white/5 px-4 text-[var(--muted)] transition-colors hover:bg-white/10 hover:text-white active:scale-95"
                  aria-label="Reset"
                >
                  <RotateCcw size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
