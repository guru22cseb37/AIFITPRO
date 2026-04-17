"use client";

import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader } from "@/components/ui/card";
import { useAppStore } from "@/store/use-app-store";

type Msg = { role: "user" | "assistant"; text: string };

const providerLabel: Record<string, string> = {
  nemotron: "NVIDIA Nemotron 3 Super",
  kimi: "Moonshot Kimi K2.5",
  groq: "Groq",
  "local-fallback": "Offline fallback",
};

export function AIChatPanel() {
  const user = useAppStore((s) => s.user);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      text: "Hi — I’m your AIFIT coach. Ask about training, nutrition, recovery, or form. Replies use Nemotron → Kimi → Groq automatically.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastProvider, setLastProvider] = useState<string | null>(null);

  async function send() {
    const t = input.trim();
    if (!t || loading) return;

    const nextHistory: Msg[] = [...messages, { role: "user", text: t }];
    setMessages(nextHistory);
    setInput("");
    setLoading(true);
    setLastProvider(null);

    try {
      const apiMessages = nextHistory.map((m) => ({
        role: m.role,
        content: m.text,
      }));

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "chat",
          messages: apiMessages,
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

      const data = (await res.json()) as {
        reply?: string;
        provider?: string;
        warning?: string;
        error?: string;
      };

      if (!res.ok || data.error) {
        setMessages((m) => [
          ...m,
          { role: "assistant", text: data.error ?? "Something went wrong. Try again." },
        ]);
        return;
      }

      const reply = data.reply ?? "";
      setLastProvider(data.provider ?? null);
      setMessages((m) => [...m, { role: "assistant", text: reply }]);
      if (data.warning) {
        console.warn("[AIFIT]", data.warning);
      }
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          text: "Network error. Check your connection and that the dev server is running.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader
        title="AI personal trainer"
        subtitle={
          lastProvider
            ? `Last reply: ${providerLabel[lastProvider] ?? lastProvider}`
            : "Multi-model: Nemotron → Kimi → Groq"
        }
      />
      <div className="flex h-[420px] flex-col gap-3">
        <div className="scrollbar-thin flex flex-1 flex-col gap-3 overflow-y-auto rounded-xl border border-white/10 bg-zinc-950/40 p-3">
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={`${i}-${msg.text.slice(0, 12)}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`max-w-[92%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "ml-auto bg-[var(--accent)] text-zinc-950"
                    : "mr-auto border border-white/10 bg-white/5 text-zinc-200"
                }`}
              >
                {msg.text}
              </motion.div>
            ))}
          </AnimatePresence>
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
              <Loader2 className="h-4 w-4 animate-spin text-[var(--accent)]" />
              Generating…
            </div>
          ) : null}
        </div>
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything…"
            disabled={loading}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
          />
          <Button type="button" onClick={send} className="shrink-0" disabled={loading}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
