import { categorizeIngredient, MEAL_LIBRARY, type MealStyle } from "../constants/mealLibrary.js";

export interface ShoppingListItem {
  name: string;
  unit: string;
  quantity: number;
  category: ReturnType<typeof categorizeIngredient>;
}

export function roundQty(qty: number): number {
  if (qty < 1) return Math.round(qty * 100) / 100;
  if (qty < 10) return Math.round(qty * 10) / 10;
  return Math.round(qty);
}

const SLOTS = ["breakfast", "lunch", "dinner", "snack"] as const;

/** Sums ingredients across `days` days of a rotating meal-plan style, scaled by `scale`. */
export function buildShoppingList(style: MealStyle, days: number, scale: number): ShoppingListItem[] {
  const lib = MEAL_LIBRARY[style];
  const totals = new Map<string, ShoppingListItem>();

  for (let dayIndex = 0; dayIndex < days; dayIndex++) {
    for (const slot of SLOTS) {
      const options = lib[slot];
      if (!options.length) continue;
      const option = options[dayIndex % options.length];
      for (const ing of option.ingredients) {
        const key = `${ing.name}|${ing.unit}`;
        const scaledQty = ing.qty * scale;
        const existing = totals.get(key);
        if (existing) {
          existing.quantity = roundQty(existing.quantity + scaledQty);
        } else {
          totals.set(key, { name: ing.name, unit: ing.unit, quantity: roundQty(scaledQty), category: categorizeIngredient(ing.name) });
        }
      }
    }
  }

  return Array.from(totals.values()).sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
}

export interface DayMeals {
  breakfast: (typeof MEAL_LIBRARY)[MealStyle]["breakfast"][number] | null;
  lunch: (typeof MEAL_LIBRARY)[MealStyle]["lunch"][number] | null;
  dinner: (typeof MEAL_LIBRARY)[MealStyle]["dinner"][number] | null;
  snack: (typeof MEAL_LIBRARY)[MealStyle]["snack"][number] | null;
}

function scaleOption<T extends { calories: number; protein: number; carbs: number; fat: number }>(option: T | undefined, scale: number): T | null {
  if (!option) return null;
  return {
    ...option,
    calories: Math.round(option.calories * scale),
    protein: Math.round(option.protein * scale),
    carbs: Math.round(option.carbs * scale),
    fat: Math.round(option.fat * scale),
  };
}

/** Picks and scales one day's meals for a given style/day-of-week/calorie scale. */
export function buildDayMeals(style: MealStyle, dayIndex: number, scale: number): DayMeals {
  const lib = MEAL_LIBRARY[style];
  return {
    breakfast: scaleOption(lib.breakfast[dayIndex % (lib.breakfast.length || 1)], scale),
    lunch: scaleOption(lib.lunch[dayIndex % (lib.lunch.length || 1)], scale),
    dinner: scaleOption(lib.dinner[dayIndex % (lib.dinner.length || 1)], scale),
    snack: scaleOption(lib.snack[dayIndex % (lib.snack.length || 1)], scale),
  };
}
