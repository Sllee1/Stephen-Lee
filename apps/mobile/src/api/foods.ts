import type { UsdaFoodResult } from "@nutrition-app/shared";
import { api } from "./client";

export function searchUsdaFoods(query: string) {
  return api<UsdaFoodResult[]>(`/foods/search?q=${encodeURIComponent(query)}`);
}
