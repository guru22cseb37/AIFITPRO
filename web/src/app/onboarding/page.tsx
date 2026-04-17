"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/use-app-store";

const questions = [
  {
    id: "q1",
    text: "How many days per week can you realistically train?",
    options: ["2", "3", "4", "5+"],
  },
  {
    id: "q2",
    text: "What equipment do you have access to?",
    options: ["Bodyweight only", "Home dumbbells", "Full gym"],
  },
  {
    id: "q3",
    text: "What matters most to you right now?",
    options: ["Fat loss", "Strength", "Muscle size", "General health"],
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const user = useAppStore((s) => s.user);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <p className="text-[var(--muted)]">Please register first.</p>
        <Link href="/register" className="mt-4 inline-block text-[var(--accent)] underline">
          Create account
        </Link>
      </div>
    );
  }

  const q = questions[step];

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <Card>
        <CardHeader
          title="AI-assisted onboarding"
          subtitle={`Question ${step + 1} of ${questions.length} — answers can tune your dashboard copy and future model prompts.`}
        />
        <p className="text-lg font-medium">{q.text}</p>
        <div className="mt-4 flex flex-col gap-2">
          {q.options.map((opt) => (
            <Button
              key={opt}
              type="button"
              variant={answers[q.id] === opt ? "primary" : "secondary"}
              className="justify-start"
              onClick={() => setAnswers((a) => ({ ...a, [q.id]: opt }))}
            >
              {opt}
            </Button>
          ))}
        </div>
        <div className="mt-6 flex justify-between gap-2">
          <Button type="button" variant="ghost" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
            Back
          </Button>
          {step < questions.length - 1 ? (
            <Button type="button" onClick={() => setStep((s) => s + 1)} disabled={!answers[q.id]}>
              Next
            </Button>
          ) : (
            <Button type="button" onClick={() => router.push("/dashboard")} disabled={!answers[q.id]}>
              Finish
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
