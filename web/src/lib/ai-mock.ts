/** Demo responses when no LLM API key is configured. Replace with server action + OpenAI/Anthropic. */

export function mockTrainerReply(userMessage: string): string {
  const m = userMessage.toLowerCase();

  if (m.includes("squat")) {
    return "For squats: brace before you descend, keep ribs stacked over pelvis, and think ‘spread the floor’ with your feet. Film a set from the side to check depth and knee tracking.";
  }
  if (m.includes("protein")) {
    return "A practical target is ~1.6–2.2 g/kg/day if you’re resistance training. Build meals around a palm-sized protein portion and adjust based on hunger, recovery, and rate of progress.";
  }
  if (m.includes("plateau") || m.includes("stuck")) {
    return "Plateaus are normal. First tighten tracking (sleep, steps, calories), then adjust one lever: add a small weekly volume bump, improve technique, or schedule a deload if fatigue is high.";
  }
  if (m.includes("lose") && m.includes("fat")) {
    return "Fat loss is mostly sustained calorie deficit + high protein + strength training. Aim for ~0.5–1% bodyweight loss per week; faster isn’t always better for muscle retention.";
  }
  if (m.includes("motivat")) {
    return "Motivation is unreliable; systems win. Commit to a minimum viable workout on busy days—even 15 minutes counts—and protect sleep like it’s training.";
  }

  return "I’m your AIFIT coach (demo mode). Ask about training form, nutrition basics, recovery, or programming. For medical concerns, please consult a qualified clinician.";
}

export function mockWorkoutPlan(input: {
  level: string;
  minutes: number;
  equipment: string;
  energy: number;
}): string {
  return `Generated session (${input.level}, ~${input.minutes} min, ${input.equipment}, energy ${input.energy}/10):

1) Warm-up: 6–8 min easy cardio + dynamic mobility
2) Main: 3–4 compound lifts, 3–4 sets each, RPE 7–8
3) Accessories: 2 isolation movements, 2–3 sets
4) Finisher (optional): 6–10 min conditioning if energy ≥ 6

Progression: add reps first, then load. If energy is low, reduce sets by ~20% and prioritize technique.`;

}
