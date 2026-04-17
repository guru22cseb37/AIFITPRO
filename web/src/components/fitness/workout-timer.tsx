"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

export function WorkoutTimer() {
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
            const ctx = new AudioContext();
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.connect(g);
            g.connect(ctx.destination);
            o.frequency.value = 880;
            g.gain.value = 0.08;
            o.start();
            setTimeout(() => o.stop(), 200);
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

  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-950/50 p-4">
      <p className="text-xs uppercase tracking-widest text-[var(--muted)]">Rest timer</p>
      <p className="mt-2 font-mono text-4xl font-bold tracking-tight">
        {mm}:{ss}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {[30, 60, 90, 120].map((s) => (
          <Button key={s} type="button" size="sm" variant="secondary" onClick={() => {
            setSeconds(s);
            setRemaining(s);
            setRunning(false);
          }}>
            {s}s
          </Button>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <Button type="button" className="flex-1" onClick={() => setRunning((r) => !r)}>
          {running ? "Pause" : "Start"}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={() => {
            setRunning(false);
            setRemaining(seconds);
          }}
        >
          Reset
        </Button>
      </div>
    </div>
  );
}
