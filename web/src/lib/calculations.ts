export type BmiCategory =
  | "Underweight"
  | "Normal"
  | "Overweight"
  | "Obese";

export function kgFromLbs(lbs: number): number {
  return lbs * 0.453592;
}

export function cmFromFeetInches(feet: number, inches: number): number {
  return feet * 30.48 + inches * 2.54;
}

export function computeBmi(weightKg: number, heightCm: number): number {
  const m = heightCm / 100;
  if (m <= 0 || weightKg <= 0) return 0;
  return weightKg / (m * m);
}

export function bmiCategory(bmi: number): BmiCategory {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal";
  if (bmi < 30) return "Overweight";
  return "Obese";
}

export function bmiTips(category: BmiCategory): string[] {
  switch (category) {
    case "Underweight":
      return [
        "Prioritize nutrient-dense foods and a slight calorie surplus if gaining is appropriate.",
        "Include resistance training to build lean mass with guidance from a clinician if needed.",
      ];
    case "Normal":
      return [
        "Maintain habits with balanced training, protein, sleep, and hydration.",
        "Use progress metrics beyond scale weight (strength, energy, measurements).",
      ];
    case "Overweight":
      return [
        "A sustainable deficit, higher protein, and daily movement support fat loss.",
        "Strength training helps preserve muscle while you lose weight gradually.",
      ];
    case "Obese":
      return [
        "Start with achievable steps: walking, protein targets, and sleep consistency.",
        "Consult a healthcare professional for personalized medical guidance.",
      ];
    default:
      return [];
  }
}

/** Mifflin-St Jeor BMR */
export function bmrMifflin(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: "male" | "female",
): number {
  const s = gender === "male" ? 5 : -161;
  return 10 * weightKg + 6.25 * heightCm - 5 * age + s;
}

export type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "very_active";

export function activityMultiplier(level: ActivityLevel): number {
  switch (level) {
    case "sedentary":
      return 1.2;
    case "light":
      return 1.375;
    case "moderate":
      return 1.55;
    case "active":
      return 1.725;
    case "very_active":
      return 1.9;
    default:
      return 1.2;
  }
}

export function computeTdee(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: "male" | "female",
  activity: ActivityLevel,
): number {
  return bmrMifflin(weightKg, heightCm, age, gender) * activityMultiplier(activity);
}

export type GoalType = "loss" | "gain" | "recomp";

export function calorieTargetFromGoal(tdee: number, goal: GoalType): number {
  switch (goal) {
    case "loss":
      return Math.round(tdee - 400);
    case "gain":
      return Math.round(tdee + 350);
    case "recomp":
      return Math.round(tdee);
    default:
      return Math.round(tdee);
  }
}

export function macroSplit(
  calories: number,
  goal: GoalType,
): { proteinG: number; carbsG: number; fatG: number } {
  let p = 0.3;
  let c = 0.4;
  let f = 0.3;
  if (goal === "loss") {
    p = 0.35;
    c = 0.35;
    f = 0.3;
  } else if (goal === "gain") {
    p = 0.25;
    c = 0.45;
    f = 0.3;
  } else {
    p = 0.3;
    c = 0.4;
    f = 0.3;
  }
  return {
    proteinG: Math.round((calories * p) / 4),
    carbsG: Math.round((calories * c) / 4),
    fatG: Math.round((calories * f) / 9),
  };
}
