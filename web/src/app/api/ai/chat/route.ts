import { NextResponse } from "next/server";
import { completeWithFallback, type ChatMessage } from "@/lib/ai/chat-orchestrator";
import { mockTrainerReply, mockWorkoutPlan } from "@/lib/ai-mock";

export const maxDuration = 60;

const TRAINER_SYSTEM = `You are AIFIT PRO, an expert fitness and nutrition coach. Be concise, evidence-based, and encouraging.
- Give practical steps (sets/reps, progression, protein targets) when relevant.
- Never diagnose medical conditions; suggest seeing a clinician for pain, chest pain, or eating disorders.
- Prefer metric units unless the user uses imperial.
- Keep answers under ~400 words unless the user asks for detail.`;

const WORKOUT_SYSTEM = `You are AIFIT PRO. Generate a single structured workout session as plain text with clear sections:
Warm-up, Main work (exercises with sets × reps, rest), Optional finisher, Cool-down.
Adapt to the user's level, time budget, equipment, and energy. Use exercise names only (no videos). No medical claims.`;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      messages?: Array<{ role: string; content: string }>;
      mode?: "chat" | "workout";
      context?: {
        name?: string;
        goalType?: string;
        fitnessLevel?: string;
        weightKg?: number;
        heightCm?: number;
      };
      workoutParams?: {
        minutes: number;
        energy: number;
        equipment: string;
        level: string;
      };
    };

    const mode = body.mode ?? "chat";
    const raw = body.messages ?? [];

    const userMsgs: ChatMessage[] = raw
      .filter((m) => m.role === "user" || m.role === "assistant" || m.role === "system")
      .map((m) => ({
        role: m.role as ChatMessage["role"],
        content: String(m.content ?? ""),
      }))
      .filter((m) => m.content.length > 0);

    const ctx = body.context;
    const contextLine =
      ctx && (ctx.fitnessLevel || ctx.goalType)
        ? `\n[User profile: ${ctx.name ?? "User"}; goal: ${ctx.goalType ?? "n/a"}; level: ${ctx.fitnessLevel ?? "n/a"}; ~${ctx.weightKg ?? "?"} kg, ${ctx.heightCm ?? "?"} cm]`
        : "";

    let messages: ChatMessage[];

    if (mode === "workout") {
      const wp = body.workoutParams;
      const userContent =
        userMsgs.filter((m) => m.role === "user").pop()?.content ??
        (wp
          ? `Generate a workout for ${wp.level} level, ${wp.minutes} minutes, equipment: ${wp.equipment}, energy today ${wp.energy}/10.`
          : "Generate a balanced full-body workout.");
      messages = [
        { role: "system", content: WORKOUT_SYSTEM + contextLine },
        { role: "user", content: userContent },
      ];
    } else {
      if (userMsgs.length === 0) {
        return NextResponse.json({ error: "No messages" }, { status: 400 });
      }
      messages = [{ role: "system", content: TRAINER_SYSTEM + contextLine }, ...userMsgs.filter((m) => m.role !== "system")];
    }

    try {
      const { text, provider } = await completeWithFallback(messages);
      return NextResponse.json({ reply: text, provider });
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : String(e);
      const wp = body.workoutParams;
      const lastUser = [...userMsgs].reverse().find((m) => m.role === "user");
      const fallbackText =
        mode === "workout" && wp
          ? mockWorkoutPlan({
              level: wp.level,
              minutes: wp.minutes,
              equipment: wp.equipment,
              energy: wp.energy,
            })
          : mockTrainerReply(lastUser?.content ?? "help");

      return NextResponse.json({
        reply: fallbackText,
        provider: "local-fallback",
        warning: errMsg,
      });
    }
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
