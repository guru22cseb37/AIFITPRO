"use client";

import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";

interface ConfettiBurstProps {
  trigger: boolean;
}

export function ConfettiBurst({ trigger }: ConfettiBurstProps) {
  const fired = useRef(false);

  useEffect(() => {
    if (trigger && !fired.current) {
      fired.current = true;

      // Left cannon
      confetti({
        particleCount: 80,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: ["#f59e0b", "#fbbf24", "#ffffff", "#10b981"],
      });

      // Right cannon
      confetti({
        particleCount: 80,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: ["#f59e0b", "#fbbf24", "#ffffff", "#10b981"],
      });

      // Center burst after slight delay
      setTimeout(() => {
        confetti({
          particleCount: 60,
          spread: 100,
          origin: { x: 0.5, y: 0.5 },
          colors: ["#f59e0b", "#fbbf24", "#ffffff", "#10b981"],
          scalar: 1.2,
        });
      }, 300);
    }

    if (!trigger) {
      fired.current = false;
    }
  }, [trigger]);

  return null;
}
