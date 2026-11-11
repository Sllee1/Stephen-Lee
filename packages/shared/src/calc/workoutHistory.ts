import type { WorkoutResult } from "../types.js";
import { todayKey } from "./time.js";

export function normalizeLabel(label: string | null | undefined): string {
  return (label || "").trim().toLowerCase();
}

/** Most recent result for a normalized label, excluding today (used to show "beat your last time"). */
export function getPreviousResult(history: WorkoutResult[], label: string, today: string = todayKey()): string | null {
  const norm = normalizeLabel(label);
  if (!norm) return null;
  const matches = (history || [])
    .filter((h) => h.normalized === norm && h.date !== today)
    .sort((a, b) => b.date.localeCompare(a.date));
  return matches[0]?.value ?? null;
}
