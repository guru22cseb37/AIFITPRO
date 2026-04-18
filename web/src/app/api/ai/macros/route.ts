import { NextResponse } from "next/server";
import { completeWithFallback } from "@/lib/ai/chat-orchestrator";

const SYSTEM_PROMPT = `You are an expert nutritionist AI. Your task is to estimate the macronutrients for food items provided by the user with 100% accuracy using standard USDA databases or equivalent common knowledge.
Return ONLY a raw JSON object and nothing else. No markdown wrappers, no explanations. 
The JSON must have this exact structure:
{
  "calories": number,
  "proteinG": number,
  "carbsG": number,
  "fatG": number
}

Rules:
1. Estimate reasonable portion sizes if none are given (e.g., "Dosa with dal" -> assume 2 medium dosas and 1 small bowl of dal).
2. Calories MUST strictly equal approximately (proteinG * 4) + (carbsG * 4) + (fatG * 9).
3. If the user input is completely unintelligible or not food, return 0 for all values.`;

export async function POST(req: Request) {
  try {
    const { food } = await req.json();

    if (!food || typeof food !== "string") {
      return NextResponse.json({ error: "Food string is required" }, { status: 400 });
    }

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: `Estimate macros for: ${food}` },
    ];

    const result = await completeWithFallback(messages);
    
    // Attempt to parse JSON. Sometimes LLMs return markdown despite being told not to.
    let jsonStr = result.text.trim();
    if (jsonStr.startsWith("```json")) {
      jsonStr = jsonStr.replace(/^```json\n?/, "").replace(/\n?```$/, "");
    }

    const data = JSON.parse(jsonStr);

    if (
      typeof data.calories === "number" &&
      typeof data.proteinG === "number" &&
      typeof data.carbsG === "number" &&
      typeof data.fatG === "number"
    ) {
      return NextResponse.json(data);
    } else {
      throw new Error("Invalid JSON structure returned by AI.");
    }
  } catch (error) {
    console.error("[Macro API Error]", error);
    return NextResponse.json(
      { error: "Failed to estimate macros. Please try again." },
      { status: 500 }
    );
  }
}
