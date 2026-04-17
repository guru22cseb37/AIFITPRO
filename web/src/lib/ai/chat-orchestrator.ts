import {
  DEFAULT_MODEL_GROQ,
  DEFAULT_MODEL_KIMI,
  DEFAULT_MODEL_NEMOTRON,
  GROQ_BASE,
  OPENROUTER_BASE,
} from "@/lib/ai/constants";

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export type OrchestratorResult = {
  text: string;
  provider: "nemotron" | "kimi" | "groq";
};

function getEnv() {
  return {
    nemotronKey: process.env.OPENROUTER_NEMOTRON_KEY,
    kimiKey: process.env.OPENROUTER_KIMI_KEY,
    groqKey: process.env.GROQ_API_KEY,
    modelNemotron: process.env.OPENROUTER_MODEL_NEMOTRON ?? DEFAULT_MODEL_NEMOTRON,
    modelKimi: process.env.OPENROUTER_MODEL_KIMI ?? DEFAULT_MODEL_KIMI,
    modelGroq: process.env.GROQ_MODEL ?? DEFAULT_MODEL_GROQ,
    appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001",
  };
}

async function openRouterComplete(
  apiKey: string,
  model: string,
  messages: ChatMessage[],
  appUrl: string,
): Promise<string> {
  const res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": appUrl,
      "X-Title": "AIFIT PRO",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.55,
      max_tokens: 2048,
    }),
  });
  const raw = await res.text();
  if (!res.ok) {
    throw new Error(`OpenRouter ${res.status}: ${raw.slice(0, 800)}`);
  }
  const data = JSON.parse(raw) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("OpenRouter: empty response");
  return text;
}

async function groqComplete(
  apiKey: string,
  model: string,
  messages: ChatMessage[],
): Promise<string> {
  const res = await fetch(`${GROQ_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.55,
      max_tokens: 2048,
    }),
  });
  const raw = await res.text();
  if (!res.ok) {
    throw new Error(`Groq ${res.status}: ${raw.slice(0, 800)}`);
  }
  const data = JSON.parse(raw) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("Groq: empty response");
  return text;
}

/**
 * Tries NVIDIA Nemotron (OpenRouter) → Kimi K2.5 (OpenRouter) → Groq.
 * Logs failures to server console only.
 */
export async function completeWithFallback(messages: ChatMessage[]): Promise<OrchestratorResult> {
  const env = getEnv();
  const errors: string[] = [];

  if (env.nemotronKey) {
    try {
      const text = await openRouterComplete(env.nemotronKey, env.modelNemotron, messages, env.appUrl);
      return { text, provider: "nemotron" };
    } catch (e) {
      errors.push(`Nemotron: ${e instanceof Error ? e.message : String(e)}`);
      console.warn("[AIFIT AI]", errors[errors.length - 1]);
    }
  } else {
    console.warn("[AIFIT AI] OPENROUTER_NEMOTRON_KEY not set");
  }

  if (env.kimiKey) {
    try {
      const text = await openRouterComplete(env.kimiKey, env.modelKimi, messages, env.appUrl);
      return { text, provider: "kimi" };
    } catch (e) {
      errors.push(`Kimi: ${e instanceof Error ? e.message : String(e)}`);
      console.warn("[AIFIT AI]", errors[errors.length - 1]);
    }
  } else {
    console.warn("[AIFIT AI] OPENROUTER_KIMI_KEY not set");
  }

  if (env.groqKey) {
    try {
      const text = await groqComplete(env.groqKey, env.modelGroq, messages);
      return { text, provider: "groq" };
    } catch (e) {
      errors.push(`Groq: ${e instanceof Error ? e.message : String(e)}`);
      console.warn("[AIFIT AI]", errors[errors.length - 1]);
    }
  } else {
    console.warn("[AIFIT AI] GROQ_API_KEY not set");
  }

  throw new Error(
    `All AI providers failed.${errors.length ? ` Details: ${errors.join(" | ")}` : " No API keys configured."}`,
  );
}
