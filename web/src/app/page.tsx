"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Flame, LineChart, Sparkles } from "lucide-react";
import { BMICalculator } from "@/components/fitness/bmi-calculator";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { QuoteBanner } from "@/components/fitness/quote-banner";
import { SUCCESS_STORIES } from "@/data/success-stories";

export default function HomePage() {
  return (
    <div className="flex-1">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="hero-video-wrap">
          <video autoPlay muted loop playsInline poster="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&q=80">
            <source
              src="https://assets.mixkit.co/videos/preview/mixkit-man-training-on-a-strength-machine-in-the-gym-40572-large.mp4"
              type="video/mp4"
            />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-[var(--background)]" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-14 sm:px-6 sm:pt-20">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-300">
              <Sparkles className="h-3.5 w-3.5 text-[var(--accent)]" />
              AI-assisted personalization • Mobile-first
            </p>
            <h1 className="mt-5 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Train smarter.{" "}
              <span className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] bg-clip-text text-transparent">
                Feel unstoppable.
              </span>
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-zinc-400">
              Calculators, structured programs, scheduling, nutrition tools, and an AI coach experience — built for
              beginners through advanced lifters.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/register">
                <Button size="lg" className="gap-2">
                  Start free <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/#bmi">
                <Button size="lg" variant="outline">
                  Try BMI calculator
                </Button>
              </Link>
            </div>
          </motion.div>

          <div className="mt-10 max-w-xl">
            <QuoteBanner />
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight">Everything in one training hub</h2>
          <p className="mt-2 text-[var(--muted)]">
            Goal paths, level-based programming, scheduling, nutrition, progress analytics, and AI coaching modules.
          </p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "Goals: lose, gain, recomp",
              body: "Meal targets and training emphasis adapt to your primary outcome.",
              icon: Flame,
            },
            {
              title: "Level-based programs",
              body: "Beginner full-body → intermediate splits → advanced specialization tracks.",
              icon: CheckCircle2,
            },
            {
              title: "Progress intelligence",
              body: "Weight trends, measurements, streaks, PRs, and export-ready history.",
              icon: LineChart,
            },
          ].map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
              <Card className="h-full p-5">
                <f.icon className="h-8 w-8 text-[var(--accent)]" />
                <h3 className="mt-3 font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-[var(--muted)]">{f.body}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="bmi" className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <BMICalculator />
      </section>

      <section className="border-t border-white/10 bg-zinc-950/30 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-2xl font-bold tracking-tight">Transformation stories</h2>
          <p className="mt-2 text-[var(--muted)]">Realistic timelines, sustainable habits — not overnight hype.</p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {SUCCESS_STORIES.map((s) => (
              <Card key={s.id} className="p-5">
                <p className="text-xs uppercase tracking-widest text-[var(--accent)]">{s.duration}</p>
                <h3 className="mt-2 font-semibold">{s.headline}</h3>
                <p className="mt-2 text-sm text-[var(--muted)]">{s.excerpt}</p>
                <p className="mt-4 text-xs text-zinc-500">— {s.name}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
