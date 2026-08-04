import type { NutrientTotals } from "../types";

export interface FoodDatabaseEntry extends NutrientTotals {
  name: string;
  serving: string;
}

/**
 * Fast, no-wait shortlist for the quick-add food picker. The prototype ships
 * ~230 static entries here; this is a small representative seed to unblock
 * scaffolding. In production, back this with a real nutrition database
 * (e.g. USDA FoodData Central import) rather than hand-maintaining a static
 * array — `lookupFoodByName` (server-side AI proxy) already covers anything
 * not in this shortlist, so this table only needs to stay "fast", not
 * "complete".
 */
export const FOOD_DATABASE: FoodDatabaseEntry[] = [
  {
    name: "Chicken breast, grilled",
    serving: "3.5 oz (100g)",
    calories: 165,
    protein_g: 31,
    carbs_g: 0,
    fat_g: 3.6,
    satFat_g: 1,
    fiber_g: 0,
    sugar_g: 0,
    sodium_mg: 74,
    cholesterol_mg: 85,
    vitD_mcg: 0.1,
    calcium_mg: 15,
    iron_mg: 1,
    potassium_mg: 256,
    vitA_mcg: 6,
    vitC_mg: 0,
  },
  {
    name: "Banana",
    serving: "1 medium",
    calories: 105,
    protein_g: 1.3,
    carbs_g: 27,
    fat_g: 0.4,
    satFat_g: 0.1,
    fiber_g: 3.1,
    sugar_g: 14,
    sodium_mg: 1,
    cholesterol_mg: 0,
    vitD_mcg: 0,
    calcium_mg: 6,
    iron_mg: 0.3,
    potassium_mg: 422,
    vitA_mcg: 4,
    vitC_mg: 10.3,
  },
  {
    name: "Large egg, boiled",
    serving: "1 each",
    calories: 78,
    protein_g: 6.3,
    carbs_g: 0.6,
    fat_g: 5.3,
    satFat_g: 1.6,
    fiber_g: 0,
    sugar_g: 0.6,
    sodium_mg: 62,
    cholesterol_mg: 186,
    vitD_mcg: 1.1,
    calcium_mg: 25,
    iron_mg: 0.6,
    potassium_mg: 63,
    vitA_mcg: 75,
    vitC_mg: 0,
  },
  {
    name: "Brown rice, cooked",
    serving: "1 cup",
    calories: 216,
    protein_g: 5,
    carbs_g: 45,
    fat_g: 1.8,
    satFat_g: 0.4,
    fiber_g: 3.5,
    sugar_g: 0.7,
    sodium_mg: 10,
    cholesterol_mg: 0,
    vitD_mcg: 0,
    calcium_mg: 20,
    iron_mg: 0.8,
    potassium_mg: 84,
    vitA_mcg: 0,
    vitC_mg: 0,
  },
  {
    name: "Broccoli, steamed",
    serving: "1 cup",
    calories: 55,
    protein_g: 3.7,
    carbs_g: 11.2,
    fat_g: 0.6,
    satFat_g: 0.1,
    fiber_g: 5.1,
    sugar_g: 2.2,
    sodium_mg: 33,
    cholesterol_mg: 0,
    vitD_mcg: 0,
    calcium_mg: 62,
    iron_mg: 1.1,
    potassium_mg: 457,
    vitA_mcg: 120,
    vitC_mg: 101,
  },
];
