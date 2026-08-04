import { NUTRIENT_KEYS, type NutrientKey, type NutrientTotals } from "@nutrition-app/shared";
import { env } from "../env.js";

const SEARCH_URL = "https://api.nal.usda.gov/fdc/v1/foods/search";

/**
 * Standard USDA nutrient numbers (stable across their whole database,
 * unlike the internal nutrientId) mapped to our NutrientKey schema. Values
 * from FDC's search endpoint are on a per-100g basis for every data type
 * (Foundation, SR Legacy, Survey, and Branded alike) — Branded foods also
 * carry a per-serving `labelNutrients` block, but we deliberately stick to
 * the per-100g `foodNutrients` figures here so every result behaves the
 * same way in the picker's servings stepper (see FoodPicker.tsx), at the
 * cost of "100g" being a less intuitive serving size than a branded
 * product's actual label serving.
 */
const NUTRIENT_NUMBER_MAP: Record<string, NutrientKey> = {
  "208": "calories",
  "203": "protein_g",
  "205": "carbs_g",
  "204": "fat_g",
  "606": "satFat_g",
  "291": "fiber_g",
  "269": "sugar_g",
  "307": "sodium_mg",
  "601": "cholesterol_mg",
  "328": "vitD_mcg",
  "301": "calcium_mg",
  "303": "iron_mg",
  "306": "potassium_mg",
  "320": "vitA_mcg",
  "401": "vitC_mg",
};

interface FdcFoodNutrient {
  nutrientNumber?: string;
  value?: number;
}

interface FdcFood {
  fdcId: number;
  description: string;
  foodNutrients?: FdcFoodNutrient[];
}

interface FdcSearchResponse {
  foods?: FdcFood[];
}

export interface UsdaFood extends NutrientTotals {
  fdcId: number;
  name: string;
  serving: string;
}

function emptyTotals(): NutrientTotals {
  return Object.fromEntries(NUTRIENT_KEYS.map((k) => [k, 0])) as NutrientTotals;
}

function mapNutrients(foodNutrients: FdcFoodNutrient[] | undefined): NutrientTotals {
  const totals = emptyTotals();
  for (const n of foodNutrients ?? []) {
    const key = n.nutrientNumber ? NUTRIENT_NUMBER_MAP[n.nutrientNumber] : undefined;
    if (key && typeof n.value === "number") totals[key] = n.value;
  }
  return totals;
}

/**
 * USDA issues a free API key at https://fdc.nal.usda.gov/api-key-signup.html
 * (1,000 requests/hour). Without one, this falls back to their shared
 * "DEMO_KEY" — works out of the box for trying the scaffold, but is capped
 * much lower (30 requests/hour) and shared across every DEMO_KEY user on
 * the internet, so set a real key before shipping.
 */
export async function searchUsdaFoods(query: string, pageSize = 10): Promise<UsdaFood[]> {
  const apiKey = env.USDA_FDC_API_KEY || "DEMO_KEY";
  const url = new URL(SEARCH_URL);
  url.searchParams.set("query", query);
  url.searchParams.set("pageSize", String(pageSize));
  url.searchParams.set("api_key", apiKey);

  const response = await fetch(url.toString());
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`USDA FoodData Central search failed (${response.status}): ${body}`);
  }

  const data = (await response.json()) as FdcSearchResponse;
  return (data.foods ?? []).map((food) => ({
    fdcId: food.fdcId,
    name: food.description,
    serving: "100g",
    ...mapNutrients(food.foodNutrients),
  }));
}
