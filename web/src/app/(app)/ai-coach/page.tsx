"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AIChatPanel } from "@/components/ai/ai-chat-panel";
import { useAppStore } from "@/store/use-app-store";
import { mockWorkoutPlan } from "@/lib/ai-mock";

export default function AICoachPage() {
  const user = useAppStore((s) => s.user);
  const [energy, setEnergy] = useState(7);
  const [minutes, setMinutes] = useState(45);
  const [equipment, setEquipment] = useState("home dumbbells");
  const [plan, setPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState<string | null>(null);

  async function generatePlan() {
    setLoading(true);
    setProvider(null);
    try {
      const level = user?.fitnessLevel ?? "beginner";
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "workout",
          messages: [
            {
              role: "user",
              content: `Generate one complete workout session for ${level} level. Time: ${minutes} minutes. Equipment available: ${equipment}. Energy today: ${energy}/10. Include warm-up, main lifts, accessories, and cool-down with sets, reps, and rest.`,
            },
          ],
          workoutParams: {
            minutes,
            energy,
            equipment,
            level,
          },
          context: user
            ? {
                name: user.name,
                goalType: user.goalType,
                fitnessLevel: user.fitnessLevel,
                weightKg: user.weightKg,
                heightCm: user.heightCm,
              }
            : undefined,
        }),
      });
      const data = (await res.json()) as { reply?: string; provider?: string; warning?: string };
      setPlan(data.reply ?? mockWorkoutPlan({ level, minutes, equipment, energy }));
      setProvider(data.provider ?? null);
      if (data.warning) console.warn("[AIFIT workout]", data.warning);
    } catch {
      setPlan(mockWorkoutPlan({ level: user?.fitnessLevel ?? "beginner", minutes, equipment, energy }));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">AI coaching suite</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Chat and workout generation use the same model chain: Nemotron 3 Super → Kimi K2.5 → Groq Llama 3.3.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <AIChatPanel />
        <Card>
          <CardHeader
            title="AI workout generator"
            subtitle={provider ? `Source: ${provider}` : "Uses the same multi-provider pipeline as chat."}
          />
          <div className="space-y-3 text-sm">
            <label className="block space-y-1">
              <span className="text-[var(--muted)]">Minutes available</span>
              <Input
                type="number"
                min={15}
                max={120}
                value={minutes}
                onChange={(e) => setMinutes(Number(e.target.value))}
              />
            </label>
            <label className="block space-y-1">
              <span className="text-[var(--muted)]">Equipment</span>
              <Input value={equipment} onChange={(e) => setEquipment(e.target.value)} />
            </label>
            <div>
              <span className="text-[var(--muted)]">Energy (1–10)</span>
              <input
                type="range"
                min={1}
                max={10}
                value={energy}
                onChange={(e) => setEnergy(Number(e.target.value))}
                className="mt-2 w-full accent-[var(--accent)]"
              />
              <p className="text-xs text-zinc-500">{energy}/10</p>
            </div>
            <Button type="button" onClick={() => void generatePlan()} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating…
                </>
              ) : (
                "Generate plan"
              )}
            </Button>
            {plan ? (
              <pre className="mt-3 whitespace-pre-wrap rounded-xl border border-white/10 bg-zinc-950/60 p-3 text-xs leading-relaxed text-zinc-300">
                {plan}
              </pre>
            ) : null}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="AI form check (computer vision)" subtitle="MediaPipe / TensorFlow.js + WebRTC." />
          <p className="text-sm text-[var(--muted)]">
            Enable camera access to run pose estimation in-browser. For production, add frame processing, rep counting,
            and privacy toggles (local inference optional).
          </p>
          <div className="mt-4 aspect-video overflow-hidden rounded-xl bg-black">
            <video className="h-full w-full object-cover opacity-60" muted playsInline />
          </div>
          <Button type="button" className="mt-3" variant="secondary" disabled>
            Start webcam preview (integrate MediaPipe)
          </Button>
        </Card>
        <Card>
          <CardHeader title="AI progress insights" />
          <ul className="space-y-2 text-sm text-[var(--muted)]">
            <li>• Predict goal date from weight trend + adherence (train a small model on your warehouse).</li>
            <li>• Correlate sleep/steps when wearables sync (Apple Health / Fitbit APIs).</li>
            <li>• Plateau breaker rules: adjust calories, volume, or deload based on stall detection.</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
