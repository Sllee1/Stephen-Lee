import { NUTRIENT_KEYS, type NutrientTotals } from "../types.js";

export function emptyNutrientTotals(): NutrientTotals {
  return Object.fromEntries(NUTRIENT_KEYS.map((k) => [k, 0])) as NutrientTotals;
}

export function sumNutrients(items: NutrientTotals[]): NutrientTotals {
  const totals = emptyNutrientTotals();
  for (const item of items) {
    for (const key of NUTRIENT_KEYS) {
      totals[key] += Number(item[key]) || 0;
    }
  }
  return totals;
}
