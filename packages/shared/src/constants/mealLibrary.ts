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

/** Ported verbatim from the prototype's MEAL_LIBRARY — two rotation options per slot, one snack. */
export const MEAL_LIBRARY: Record<MealStyle, MealLibraryEntry> = {
  balanced: {
    baseCalories: 2000,
    breakfast: [
      { name: "Greek yogurt, berries & granola", calories: 350, protein: 22, carbs: 45, fat: 9, ingredients: [{ name: "Greek yogurt", qty: 1, unit: "cup" }, { name: "Mixed berries", qty: 0.5, unit: "cup" }, { name: "Granola", qty: 0.25, unit: "cup" }] },
      { name: "Veggie omelet & toast", calories: 380, protein: 24, carbs: 30, fat: 18, ingredients: [{ name: "Eggs", qty: 3, unit: "whole" }, { name: "Bell pepper", qty: 0.5, unit: "whole" }, { name: "Whole-grain bread", qty: 1, unit: "slice" }] },
    ],
    lunch: [
      { name: "Grilled chicken & quinoa bowl", calories: 520, protein: 40, carbs: 50, fat: 16, ingredients: [{ name: "Chicken breast", qty: 5, unit: "oz" }, { name: "Quinoa", qty: 0.75, unit: "cup cooked" }, { name: "Mixed greens", qty: 2, unit: "cup" }] },
      { name: "Turkey & avocado wrap", calories: 480, protein: 32, carbs: 42, fat: 20, ingredients: [{ name: "Turkey breast", qty: 4, unit: "oz" }, { name: "Whole-wheat tortilla", qty: 1, unit: "whole" }, { name: "Avocado", qty: 0.5, unit: "whole" }] },
    ],
    dinner: [
      { name: "Baked salmon, rice & broccoli", calories: 560, protein: 38, carbs: 48, fat: 22, ingredients: [{ name: "Salmon fillet", qty: 6, unit: "oz" }, { name: "Brown rice", qty: 0.75, unit: "cup cooked" }, { name: "Broccoli", qty: 1.5, unit: "cup" }] },
      { name: "Lean beef stir-fry", calories: 540, protein: 36, carbs: 44, fat: 20, ingredients: [{ name: "Lean beef strips", qty: 5, unit: "oz" }, { name: "Stir-fry vegetables", qty: 2, unit: "cup" }, { name: "Brown rice", qty: 0.5, unit: "cup cooked" }] },
    ],
    snack: [{ name: "Apple & almond butter", calories: 210, protein: 5, carbs: 24, fat: 11, ingredients: [{ name: "Apple", qty: 1, unit: "whole" }, { name: "Almond butter", qty: 1, unit: "tbsp" }] }],
  },
  vegetarian: {
    baseCalories: 1950,
    breakfast: [
      { name: "Cottage cheese & fruit bowl", calories: 340, protein: 26, carbs: 38, fat: 8, ingredients: [{ name: "Cottage cheese", qty: 1, unit: "cup" }, { name: "Pineapple", qty: 0.5, unit: "cup" }, { name: "Walnuts", qty: 1, unit: "tbsp" }] },
      { name: "Spinach & feta omelet", calories: 360, protein: 22, carbs: 20, fat: 22, ingredients: [{ name: "Eggs", qty: 3, unit: "whole" }, { name: "Spinach", qty: 1, unit: "cup" }, { name: "Feta cheese", qty: 2, unit: "tbsp" }] },
    ],
    lunch: [
      { name: "Chickpea & halloumi salad", calories: 500, protein: 26, carbs: 48, fat: 22, ingredients: [{ name: "Chickpeas", qty: 1, unit: "cup" }, { name: "Halloumi cheese", qty: 3, unit: "oz" }, { name: "Mixed greens", qty: 2, unit: "cup" }] },
      { name: "Black bean & rice bowl", calories: 480, protein: 20, carbs: 68, fat: 12, ingredients: [{ name: "Black beans", qty: 1, unit: "cup" }, { name: "Brown rice", qty: 0.75, unit: "cup cooked" }, { name: "Salsa", qty: 0.25, unit: "cup" }] },
    ],
    dinner: [
      { name: "Paneer tikka & vegetables", calories: 540, protein: 28, carbs: 40, fat: 28, ingredients: [{ name: "Paneer", qty: 5, unit: "oz" }, { name: "Bell peppers", qty: 1, unit: "cup" }, { name: "Basmati rice", qty: 0.5, unit: "cup cooked" }] },
      { name: "Lentil & vegetable curry", calories: 500, protein: 24, carbs: 62, fat: 14, ingredients: [{ name: "Lentils", qty: 1, unit: "cup cooked" }, { name: "Mixed vegetables", qty: 1.5, unit: "cup" }, { name: "Basmati rice", qty: 0.5, unit: "cup cooked" }] },
    ],
    snack: [{ name: "Hummus & veggies", calories: 200, protein: 7, carbs: 22, fat: 10, ingredients: [{ name: "Hummus", qty: 0.25, unit: "cup" }, { name: "Carrots", qty: 1, unit: "cup" }] }],
  },
  vegan: {
    baseCalories: 1900,
    breakfast: [
      { name: "Overnight oats & almond milk", calories: 340, protein: 12, carbs: 54, fat: 10, ingredients: [{ name: "Rolled oats", qty: 0.5, unit: "cup" }, { name: "Almond milk", qty: 1, unit: "cup" }, { name: "Chia seeds", qty: 1, unit: "tbsp" }] },
      { name: "Tofu scramble & toast", calories: 360, protein: 20, carbs: 32, fat: 16, ingredients: [{ name: "Firm tofu", qty: 6, unit: "oz" }, { name: "Whole-grain bread", qty: 1, unit: "slice" }, { name: "Turmeric", qty: 0.5, unit: "tsp" }] },
    ],
    lunch: [
      { name: "Buddha bowl w/ tempeh", calories: 500, protein: 24, carbs: 58, fat: 18, ingredients: [{ name: "Tempeh", qty: 4, unit: "oz" }, { name: "Quinoa", qty: 0.75, unit: "cup cooked" }, { name: "Mixed vegetables", qty: 1.5, unit: "cup" }] },
      { name: "Lentil soup & bread", calories: 460, protein: 22, carbs: 64, fat: 10, ingredients: [{ name: "Lentils", qty: 1, unit: "cup cooked" }, { name: "Vegetable broth", qty: 2, unit: "cup" }, { name: "Whole-grain bread", qty: 1, unit: "slice" }] },
    ],
    dinner: [
      { name: "Chickpea curry & rice", calories: 520, protein: 20, carbs: 70, fat: 16, ingredients: [{ name: "Chickpeas", qty: 1, unit: "cup" }, { name: "Coconut milk", qty: 0.5, unit: "cup" }, { name: "Basmati rice", qty: 0.75, unit: "cup cooked" }] },
      { name: "Black bean tacos", calories: 500, protein: 18, carbs: 66, fat: 16, ingredients: [{ name: "Black beans", qty: 1, unit: "cup" }, { name: "Corn tortillas", qty: 3, unit: "whole" }, { name: "Avocado", qty: 0.5, unit: "whole" }] },
    ],
    snack: [{ name: "Trail mix", calories: 210, protein: 6, carbs: 20, fat: 13, ingredients: [{ name: "Mixed nuts", qty: 0.25, unit: "cup" }, { name: "Dried cranberries", qty: 2, unit: "tbsp" }] }],
  },
  keto: {
    baseCalories: 1900,
    breakfast: [
      { name: "Bacon & eggs", calories: 420, protein: 26, carbs: 3, fat: 34, ingredients: [{ name: "Eggs", qty: 3, unit: "whole" }, { name: "Bacon", qty: 3, unit: "slice" }] },
      { name: "Avocado & sausage skillet", calories: 440, protein: 22, carbs: 6, fat: 36, ingredients: [{ name: "Breakfast sausage", qty: 4, unit: "oz" }, { name: "Avocado", qty: 1, unit: "whole" }, { name: "Eggs", qty: 2, unit: "whole" }] },
    ],
    lunch: [
      { name: "Cobb salad", calories: 520, protein: 34, carbs: 8, fat: 40, ingredients: [{ name: "Grilled chicken", qty: 4, unit: "oz" }, { name: "Bacon", qty: 2, unit: "slice" }, { name: "Blue cheese", qty: 2, unit: "tbsp" }] },
      { name: "Tuna & olive oil salad", calories: 480, protein: 32, carbs: 5, fat: 38, ingredients: [{ name: "Canned tuna", qty: 5, unit: "oz" }, { name: "Olive oil", qty: 2, unit: "tbsp" }, { name: "Mixed greens", qty: 2, unit: "cup" }] },
    ],
    dinner: [
      { name: "Ribeye & buttered greens", calories: 620, protein: 40, carbs: 6, fat: 48, ingredients: [{ name: "Ribeye steak", qty: 8, unit: "oz" }, { name: "Butter", qty: 1, unit: "tbsp" }, { name: "Green beans", qty: 1.5, unit: "cup" }] },
      { name: "Salmon & asparagus", calories: 580, protein: 36, carbs: 6, fat: 44, ingredients: [{ name: "Salmon fillet", qty: 7, unit: "oz" }, { name: "Asparagus", qty: 1.5, unit: "cup" }, { name: "Olive oil", qty: 1, unit: "tbsp" }] },
    ],
    snack: [{ name: "Cheese & macadamias", calories: 260, protein: 9, carbs: 3, fat: 24, ingredients: [{ name: "Cheddar cheese", qty: 1.5, unit: "oz" }, { name: "Macadamia nuts", qty: 0.25, unit: "cup" }] }],
  },
  carnivore: {
    baseCalories: 2000,
    breakfast: [
      { name: "Eggs & bacon", calories: 460, protein: 30, carbs: 1, fat: 36, ingredients: [{ name: "Eggs", qty: 4, unit: "whole" }, { name: "Bacon", qty: 4, unit: "slice" }] },
      { name: "Steak & eggs", calories: 520, protein: 40, carbs: 0, fat: 38, ingredients: [{ name: "Sirloin steak", qty: 5, unit: "oz" }, { name: "Eggs", qty: 2, unit: "whole" }] },
    ],
    lunch: [
      { name: "Ground beef patties", calories: 540, protein: 38, carbs: 0, fat: 42, ingredients: [{ name: "Ground beef (80/20)", qty: 8, unit: "oz" }, { name: "Butter", qty: 1, unit: "tbsp" }] },
      { name: "Chicken thighs", calories: 500, protein: 42, carbs: 0, fat: 34, ingredients: [{ name: "Chicken thighs", qty: 10, unit: "oz" }] },
    ],
    dinner: [
      { name: "Ribeye steak", calories: 620, protein: 44, carbs: 0, fat: 48, ingredients: [{ name: "Ribeye steak", qty: 9, unit: "oz" }, { name: "Butter", qty: 1, unit: "tbsp" }] },
      { name: "Pork chops & bone broth", calories: 560, protein: 46, carbs: 0, fat: 38, ingredients: [{ name: "Pork chops", qty: 9, unit: "oz" }, { name: "Bone broth", qty: 1, unit: "cup" }] },
    ],
    snack: [{ name: "Beef jerky & hard cheese", calories: 240, protein: 22, carbs: 2, fat: 16, ingredients: [{ name: "Beef jerky", qty: 2, unit: "oz" }, { name: "Hard cheese", qty: 1, unit: "oz" }] }],
  },
  mediterranean: {
    baseCalories: 1950,
    breakfast: [
      { name: "Greek yogurt, honey & walnuts", calories: 340, protein: 20, carbs: 36, fat: 12, ingredients: [{ name: "Greek yogurt", qty: 1, unit: "cup" }, { name: "Honey", qty: 1, unit: "tbsp" }, { name: "Walnuts", qty: 2, unit: "tbsp" }] },
      { name: "Tomato, feta & olive toast", calories: 360, protein: 14, carbs: 38, fat: 18, ingredients: [{ name: "Whole-grain bread", qty: 2, unit: "slice" }, { name: "Feta cheese", qty: 2, unit: "tbsp" }, { name: "Tomato", qty: 1, unit: "whole" }] },
    ],
    lunch: [
      { name: "Grilled fish & farro salad", calories: 500, protein: 34, carbs: 46, fat: 18, ingredients: [{ name: "White fish fillet", qty: 5, unit: "oz" }, { name: "Farro", qty: 0.75, unit: "cup cooked" }, { name: "Cucumber", qty: 1, unit: "cup" }] },
      { name: "Falafel & tabbouleh bowl", calories: 480, protein: 18, carbs: 58, fat: 18, ingredients: [{ name: "Falafel", qty: 5, unit: "pieces" }, { name: "Tabbouleh", qty: 1, unit: "cup" }, { name: "Olive oil", qty: 1, unit: "tbsp" }] },
    ],
    dinner: [
      { name: "Baked cod, olive oil & vegetables", calories: 520, protein: 36, carbs: 34, fat: 22, ingredients: [{ name: "Cod fillet", qty: 7, unit: "oz" }, { name: "Olive oil", qty: 2, unit: "tbsp" }, { name: "Roasted vegetables", qty: 2, unit: "cup" }] },
      { name: "Chicken souvlaki & couscous", calories: 540, protein: 38, carbs: 46, fat: 18, ingredients: [{ name: "Chicken breast", qty: 6, unit: "oz" }, { name: "Couscous", qty: 0.75, unit: "cup cooked" }, { name: "Tzatziki", qty: 0.25, unit: "cup" }] },
    ],
    snack: [{ name: "Olives & almonds", calories: 200, protein: 5, carbs: 10, fat: 16, ingredients: [{ name: "Olives", qty: 0.25, unit: "cup" }, { name: "Almonds", qty: 0.2, unit: "cup" }] }],
  },
};

export interface CategoryRule {
  category: "Produce" | "Meat & Fish" | "Dairy & Eggs" | "Pantry & Grains" | "Other";
  keywords: string[];
}

/** Ported verbatim from the prototype's CATEGORY_RULES (substring match, case-insensitive, in this order — "Other" is the fallback). */
export const CATEGORY_RULES: CategoryRule[] = [
  { category: "Produce", keywords: ["berr", "pepper", "avocado", "greens", "broccoli", "spinach", "tomato", "cucumber", "carrot", "apple", "pineapple", "asparagus", "vegetable", "salsa", "onion", "garlic"] },
  { category: "Meat & Fish", keywords: ["chicken", "beef", "salmon", "turkey", "bacon", "steak", "pork", "fish", "cod", "tuna", "sausage", "jerky", "ribeye", "sirloin"] },
  { category: "Dairy & Eggs", keywords: ["egg", "yogurt", "cheese", "feta", "butter", "halloumi", "paneer", "milk"] },
  {
    category: "Pantry & Grains",
    keywords: ["rice", "quinoa", "oat", "bread", "tortilla", "granola", "farro", "couscous", "lentil", "bean", "chickpea", "tofu", "tempeh", "broth", "honey", "olive oil", "nut", "almond", "walnut", "macadamia", "seed", "falafel", "tabbouleh", "tzatziki", "cranberr", "coconut"],
  },
];

export function categorizeIngredient(name: string): CategoryRule["category"] {
  const lower = name.toLowerCase();
  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.some((kw) => lower.includes(kw))) return rule.category;
  }
  return "Other";
}
