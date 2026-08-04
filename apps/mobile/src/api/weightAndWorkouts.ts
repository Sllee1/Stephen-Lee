import type { WeightEntry, WorkoutResult } from "@nutrition-app/shared";
import { api } from "./client";

export function getWeightLog() {
  return api<WeightEntry[]>("/weight");
}

export function logWeight(date: string, weightKg: number) {
  return api<WeightEntry>("/weight", { method: "POST", body: JSON.stringify({ date, weightKg }) });
}

export function getWorkoutHistory() {
  return api<WorkoutResult[]>("/workouts/history");
}

export function logWorkoutResult(label: string, date: string, value: string) {
  return api<WorkoutResult>("/workouts/history", { method: "POST", body: JSON.stringify({ label, date, value }) });
}
