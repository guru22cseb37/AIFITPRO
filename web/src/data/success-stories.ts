export interface Story {
  id: string;
  name: string;
  headline: string;
  excerpt: string;
  duration: string;
}

export const SUCCESS_STORIES: Story[] = [
  {
    id: "s1",
    name: "Jordan M.",
    headline: "From inconsistent to 4× weekly training",
    excerpt: "Structured sessions and simple nutrition habits helped me lose 12kg in 6 months without crash dieting.",
    duration: "6 months",
  },
  {
    id: "s2",
    name: "Alex R.",
    headline: "Built strength while working night shifts",
    excerpt: "Short workouts and recovery-aware scheduling made training realistic on a tough schedule.",
    duration: "8 months",
  },
  {
    id: "s3",
    name: "Sam K.",
    headline: "Recomp: stronger lifts, tighter measurements",
    excerpt: "Tracking lifts and measurements—not just the scale—kept me motivated through plateaus.",
    duration: "12 months",
  },
];
