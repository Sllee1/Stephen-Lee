export interface MealLibraryIngredient {
  name: string;
  qty: number;
  unit: string;
}

export interface MealLibraryOption {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: MealLibraryIngredient[];
}

export interface MealLibraryEntry {
  baseCalories: number;
  breakfast: MealLibraryOption[];
  lunch: MealLibraryOption[];
  dinner: MealLibraryOption[];
  snack: MealLibraryOption[];
}

export const MEAL_STYLES = ["balanced", "vegetarian", "vegan", "keto", "carnivore", "mediterranean"] as const;
export type MealStyle = (typeof MEAL_STYLES)[number];

/**
 * Seed meal library — two rotation options per slot, one style shown in full
 * as a worked example. The prototype's full library covers all 6 styles with
 * the same shape; expand the remaining styles with real recipe/ingredient
 * data before shipping (or replace this whole module with a CMS-backed
 * recipe service — the `MealPlanBuilder` component only depends on the
 * `MealLibraryEntry` shape above, not on this being static data).
 */
export const MEAL_LIBRARY: Record<MealStyle, MealLibraryEntry> = {
  balanced: {
    baseCalories: 2000,
    breakfast: [
      {
        name: "Greek yogurt with berries and granola",
        calories: 380,
        protein: 24,
        carbs: 48,
        fat: 10,
        ingredients: [
          { name: "Greek yogurt", qty: 1, unit: "cup" },
          { name: "Mixed berries", qty: 0.75, unit: "cup" },
          { name: "Granola", qty: 0.33, unit: "cup" },
        ],
      },
      {
        name: "Veggie scramble with whole-grain toast",
        calories: 420,
        protein: 26,
        carbs: 38,
        fat: 18,
        ingredients: [
          { name: "Eggs", qty: 3, unit: "each" },
          { name: "Bell pepper", qty: 0.5, unit: "each" },
          { name: "Whole-grain bread", qty: 2, unit: "slice" },
        ],
      },
    ],
    lunch: [
      {
        name: "Grilled chicken bowl with rice and veggies",
        calories: 620,
        protein: 45,
        carbs: 62,
        fat: 18,
        ingredients: [
          { name: "Chicken breast", qty: 6, unit: "oz" },
          { name: "Brown rice", qty: 1, unit: "cup" },
          { name: "Broccoli", qty: 1, unit: "cup" },
        ],
      },
      {
        name: "Turkey and hummus wrap",
        calories: 540,
        protein: 34,
        carbs: 52,
        fat: 20,
        ingredients: [
          { name: "Turkey breast", qty: 4, unit: "oz" },
          { name: "Hummus", qty: 3, unit: "tbsp" },
          { name: "Whole-wheat tortilla", qty: 1, unit: "each" },
        ],
      },
    ],
    dinner: [
      {
        name: "Baked salmon with sweet potato and greens",
        calories: 640,
        protein: 42,
        carbs: 48,
        fat: 28,
        ingredients: [
          { name: "Salmon fillet", qty: 6, unit: "oz" },
          { name: "Sweet potato", qty: 1, unit: "each" },
          { name: "Spinach", qty: 2, unit: "cup" },
        ],
      },
      {
        name: "Lean beef stir-fry with noodles",
        calories: 610,
        protein: 40,
        carbs: 58,
        fat: 20,
        ingredients: [
          { name: "Lean beef strips", qty: 5, unit: "oz" },
          { name: "Rice noodles", qty: 2, unit: "oz" },
          { name: "Mixed stir-fry vegetables", qty: 1.5, unit: "cup" },
        ],
      },
    ],
    snack: [
      {
        name: "Apple with peanut butter",
        calories: 220,
        protein: 7,
        carbs: 26,
        fat: 11,
        ingredients: [
          { name: "Apple", qty: 1, unit: "each" },
          { name: "Peanut butter", qty: 2, unit: "tbsp" },
        ],
      },
    ],
  },
  // TODO: port vegetarian/vegan/keto/carnivore/mediterranean libraries from
  // the prototype (same MealLibraryEntry shape) before this ships.
  vegetarian: { baseCalories: 2000, breakfast: [], lunch: [], dinner: [], snack: [] },
  vegan: { baseCalories: 2000, breakfast: [], lunch: [], dinner: [], snack: [] },
  keto: { baseCalories: 2000, breakfast: [], lunch: [], dinner: [], snack: [] },
  carnivore: { baseCalories: 2000, breakfast: [], lunch: [], dinner: [], snack: [] },
  mediterranean: { baseCalories: 2000, breakfast: [], lunch: [], dinner: [], snack: [] },
};

export interface CategoryRule {
  category: "Produce" | "Meat & Fish" | "Dairy & Eggs" | "Pantry & Grains" | "Other";
  keywords: string[];
}

export const CATEGORY_RULES: CategoryRule[] = [
  {
    category: "Produce",
    keywords: ["berry", "berries", "spinach", "broccoli", "pepper", "apple", "potato", "greens", "vegetable", "onion", "tomato", "lettuce", "cucumber", "avocado"],
  },
  { category: "Meat & Fish", keywords: ["chicken", "beef", "salmon", "turkey", "pork", "fish", "shrimp", "bacon"] },
  { category: "Dairy & Eggs", keywords: ["yogurt", "egg", "cheese", "milk", "butter"] },
  { category: "Pantry & Grains", keywords: ["rice", "bread", "granola", "noodle", "pasta", "oat", "tortilla", "hummus", "peanut butter", "flour"] },
];

export function categorizeIngredient(name: string): CategoryRule["category"] {
  const lower = name.toLowerCase();
  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.some((kw) => lower.includes(kw))) return rule.category;
  }
  return "Other";
}
