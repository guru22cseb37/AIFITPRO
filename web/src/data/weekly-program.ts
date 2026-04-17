import type { DayWorkout } from "@/types/index";
import { EXERCISES, toScheduled } from "@/data/exercises";

const goblet = EXERCISES.find((e) => e.id === "sq-1")!;
const rdl = EXERCISES.find((e) => e.id === "dl-1")!;
const row = EXERCISES.find((e) => e.id === "row-1")!;
const bench = EXERCISES.find((e) => e.id === "bp-1")!;
const ohp = EXERCISES.find((e) => e.id === "ohp-1")!;
const pull = EXERCISES.find((e) => e.id === "pu-1")!;
const plank = EXERCISES.find((e) => e.id === "pl-1")!;
const lunge = EXERCISES.find((e) => e.id === "lc-1")!;

/** Sample 7-day template: beginner full-body + conditioning */
export const BEGINNER_WEEK: DayWorkout[] = [
  {
    dayIndex: 0,
    label: "Monday",
    focus: "Full body A",
    durationMin: 45,
    exercises: [
      toScheduled(goblet, 3, "8-12", 90),
      toScheduled(row, 3, "8-12", 90),
      toScheduled(bench, 3, "8-12", 120),
      toScheduled(plank, 3, "30-45s", 60),
    ],
  },
  {
    dayIndex: 1,
    label: "Tuesday",
    focus: "Active recovery / walk",
    durationMin: 25,
    exercises: [toScheduled(lunge, 3, "10 each", 60)],
  },
  {
    dayIndex: 2,
    label: "Wednesday",
    focus: "Full body B",
    durationMin: 45,
    exercises: [
      toScheduled(rdl, 3, "8-10", 120),
      toScheduled(ohp, 3, "8-12", 90),
      toScheduled(pull, 3, "AMRAP", 120),
    ],
  },
  {
    dayIndex: 3,
    label: "Thursday",
    focus: "Mobility + core",
    durationMin: 30,
    exercises: [toScheduled(plank, 4, "30-45s", 45)],
  },
  {
    dayIndex: 4,
    label: "Friday",
    focus: "Full body C",
    durationMin: 50,
    exercises: [
      toScheduled(goblet, 4, "8-12", 90),
      toScheduled(row, 4, "8-12", 90),
      toScheduled(bench, 3, "6-10", 120),
    ],
  },
  {
    dayIndex: 5,
    label: "Saturday",
    focus: "Conditioning",
    durationMin: 20,
    exercises: [toScheduled(lunge, 4, "12 each", 45)],
  },
  {
    dayIndex: 6,
    label: "Sunday",
    focus: "Rest",
    durationMin: 0,
    exercises: [],
  },
];

export const INTERMEDIATE_PPL: DayWorkout[] = [
  {
    dayIndex: 0,
    label: "Monday",
    focus: "Push",
    durationMin: 60,
    exercises: [
      toScheduled(bench, 4, "6-10", 120),
      toScheduled(ohp, 3, "8-12", 90),
      toScheduled(plank, 3, "45s", 60),
    ],
  },
  {
    dayIndex: 1,
    label: "Tuesday",
    focus: "Pull",
    durationMin: 60,
    exercises: [
      toScheduled(pull, 4, "6-12", 120),
      toScheduled(row, 4, "8-12", 90),
    ],
  },
  {
    dayIndex: 2,
    label: "Wednesday",
    focus: "Legs",
    durationMin: 65,
    exercises: [
      toScheduled(goblet, 4, "8-12", 120),
      toScheduled(rdl, 3, "8-10", 120),
      toScheduled(lunge, 3, "10 each", 90),
    ],
  },
  {
    dayIndex: 3,
    label: "Thursday",
    focus: "Rest",
    durationMin: 0,
    exercises: [],
  },
  {
    dayIndex: 4,
    label: "Friday",
    focus: "Push (volume)",
    durationMin: 55,
    exercises: [toScheduled(bench, 4, "8-12", 90), toScheduled(ohp, 3, "10-12", 90)],
  },
  {
    dayIndex: 5,
    label: "Saturday",
    focus: "Pull + core",
    durationMin: 55,
    exercises: [toScheduled(row, 4, "8-12", 90), toScheduled(plank, 3, "60s", 60)],
  },
  {
    dayIndex: 6,
    label: "Sunday",
    focus: "Active recovery",
    durationMin: 25,
    exercises: [toScheduled(lunge, 3, "12 each", 60)],
  },
];
