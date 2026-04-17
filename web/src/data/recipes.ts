export interface Recipe {
  id: string;
  title: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  prepMin: number;
  difficulty: "Easy" | "Medium" | "Hard";
  diet: ("omnivore" | "vegetarian" | "vegan")[];
  ingredients: string[];
}

export const RECIPES: Recipe[] = [
  {
    id: "r1",
    title: "Greek yogurt bowl with berries",
    calories: 380,
    proteinG: 32,
    carbsG: 38,
    fatG: 12,
    prepMin: 8,
    difficulty: "Easy",
    diet: ["omnivore", "vegetarian"],
    ingredients: ["Greek yogurt 250g", "Mixed berries 120g", "Honey 10g", "Chia 10g"],
  },
  {
    id: "r2",
    title: "Grilled chicken with quinoa salad",
    calories: 520,
    proteinG: 45,
    carbsG: 48,
    fatG: 16,
    prepMin: 25,
    difficulty: "Medium",
    diet: ["omnivore"],
    ingredients: ["Chicken breast 180g", "Quinoa 60g dry", "Cucumber", "Tomato", "Olive oil 10g", "Lemon"],
  },
  {
    id: "r3",
    title: "Tofu stir-fry with vegetables",
    calories: 440,
    proteinG: 28,
    carbsG: 52,
    fatG: 14,
    prepMin: 20,
    difficulty: "Easy",
    diet: ["vegan", "vegetarian"],
    ingredients: ["Firm tofu 200g", "Mixed veg 250g", "Soy sauce", "Ginger", "Garlic", "Rice 70g dry"],
  },
  {
    id: "r4",
    title: "Overnight oats (protein)",
    calories: 410,
    proteinG: 30,
    carbsG: 52,
    fatG: 10,
    prepMin: 10,
    difficulty: "Easy",
    diet: ["vegetarian", "omnivore"],
    ingredients: ["Rolled oats 60g", "Milk or soy 200ml", "Protein powder 25g", "Banana"],
  },
  {
    id: "r5",
    title: "Salmon, sweet potato, greens",
    calories: 560,
    proteinG: 38,
    carbsG: 48,
    fatG: 22,
    prepMin: 30,
    difficulty: "Medium",
    diet: ["omnivore"],
    ingredients: ["Salmon 180g", "Sweet potato 250g", "Broccoli", "Olive oil", "Lemon"],
  },
];
