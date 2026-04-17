export const MOTIVATIONAL_QUOTES: string[] = [
  "Small progress is still progress.",
  "Consistency beats intensity when intensity isn’t consistent.",
  "Your future self is built by today’s reps.",
  "Discipline is choosing what you want most over what you want now.",
  "Strength grows in the moments when you think you can’t go on — but you do.",
  "Fuel the work. Recovery is where adaptation happens.",
  "Show up. Adjust. Repeat.",
  "One workout won’t transform you — but the habit will.",
];

export function quoteOfDay(): string {
  const start = new Date(new Date().getFullYear(), 0, 0);
  const diff = Date.now() - start.getTime();
  const day = Math.floor(diff / 86400000);
  return MOTIVATIONAL_QUOTES[day % MOTIVATIONAL_QUOTES.length];
}
