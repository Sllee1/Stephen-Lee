import type { Meal, MealItem } from "@nutrition-app/shared";
import { api } from "./client";

export function getMeals(date?: string) {
  return api<Meal[]>(`/meals${date ? `?date=${date}` : ""}`);
}

export interface CreateMealInput {
  date: string;
  name: string;
  thumbUrl: string | null;
  time: string;
  items: MealItem[];
}

export function createMeal(input: CreateMealInput) {
  return api<Meal>("/meals", { method: "POST", body: JSON.stringify(input) });
}

export function deleteMeal(id: string) {
  return api<void>(`/meals/${id}`, { method: "DELETE" });
}
