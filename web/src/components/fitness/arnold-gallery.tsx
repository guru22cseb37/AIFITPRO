"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Flame } from "lucide-react";

const ARNOLD_SLIDES = [
  {
    src: "/arnold-1.png",
    quote: "The Iron Never Lies to you.",
    author: "Arnold Schwarzenegger",
    tag: "IRON MENTALITY",
    accent: "#f59e0b",
  },
  {
    src: "/arnold-2.png",
    quote: "Be the best version of yourself. Every single day.",
    author: "Arnold Schwarzenegger",
    tag: "CHAMPION MINDSET",
    accent: "#ef4444",
  },
  {
    src: "/arnold-3.png",
    quote: "No pain. No gain. No shortcuts. No excuses.",
    author: "Arnold Schwarzenegger",
    tag: "NO EXCUSES",
    accent: "#10b981",
  },
];

export function ArnoldGallery() {
  const [current, setCurrent] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  useEffect(() => {
    if (!autoPlay) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % ARNOLD_SLIDES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [autoPlay]);

  const prev = () => {
    setAutoPlay(false);
    setCurrent((c) => (c - 1 + ARNOLD_SLIDES.length) % ARNOLD_SLIDES.length);
  };

  const next = () => {
    setAutoPlay(false);
    setCurrent((c) => (c + 1) % ARNOLD_SLIDES.length);
  };

  const slide = ARNOLD_SLIDES[current];

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl"
      style={{
        background: "linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: `0 0 40px ${slide.accent}22`,
        transition: "box-shadow 0.6s ease",
      }}
    >
      {/* Section header */}
      <div className="flex items-center gap-2 px-4 pt-4 pb-0 sm:px-6 sm:pt-5">
        <Flame
          className="h-5 w-5 flex-shrink-0"
          style={{ color: slide.accent, transition: "color 0.5s" }}
        />
        <span className="text-sm font-bold tracking-widest uppercase" style={{ color: slide.accent, transition: "color 0.5s" }}>
          Arnold's Corner — Daily Motivation
        </span>
      </div>

      {/* Main content: image + quote side by side on md+, stacked on mobile */}
      <div className="flex flex-col md:flex-row items-stretch gap-0">
        {/* Image panel */}
        <div className="relative w-full md:w-64 lg:w-80 flex-shrink-0 aspect-[4/3] md:aspect-auto md:h-72 lg:h-80">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.55, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <Image
                src={slide.src}
                alt={`Arnold motivation ${current + 1}`}
                fill
                className="object-cover object-top"
                sizes="(max-width: 768px) 100vw, 320px"
                priority={current === 0}
              />
              {/* Dark gradient overlay on image edges */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to right, transparent 60%, #0f0f0f 100%), linear-gradient(to bottom, transparent 60%, #0f0f0f 100%)",
                }}
              />
              {/* Tag badge */}
              <div
                className="absolute top-3 left-3 rounded-full px-2.5 py-0.5 text-xs font-bold tracking-widest uppercase"
                style={{
                  background: slide.accent + "33",
                  border: `1px solid ${slide.accent}66`,
                  color: slide.accent,
                }}
              >
                {slide.tag}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Quote panel */}
        <div className="flex flex-1 flex-col justify-center gap-4 px-5 py-6 sm:px-7 sm:py-7 md:py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.45, delay: 0.1 }}
              className="space-y-3"
            >
              {/* Opening quote mark */}
              <div
                className="text-5xl font-serif leading-none select-none"
                style={{ color: slide.accent + "55" }}
              >
                &ldquo;
              </div>
              <p className="text-xl sm:text-2xl font-bold leading-snug text-white tracking-tight">
                {slide.quote}
              </p>
              <p className="text-sm font-medium" style={{ color: slide.accent }}>
                — {slide.author}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Progress dots + navigation */}
          <div className="flex items-center gap-4 mt-2">
            <button
              onClick={prev}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-white/10 active:scale-95"
              aria-label="Previous"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex flex-1 items-center justify-center gap-2">
              {ARNOLD_SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setAutoPlay(false); setCurrent(i); }}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: i === current ? 24 : 8,
                    height: 8,
                    background: i === current ? slide.accent : "rgba(255,255,255,0.2)",
                  }}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-white/10 active:scale-95"
              aria-label="Next"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Animated accent glow strip at bottom */}
      <div
        className="h-0.5 w-full transition-all duration-700"
        style={{
          background: `linear-gradient(to right, transparent, ${slide.accent}, transparent)`,
        }}
      />
    </div>
  );
}
