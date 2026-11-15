import { DIET_HINTS, MOTIVATION_MESSAGES, type MotivationCategory } from "../constants/motivation.js";
import type { MotivationMode } from "../types.js";

export function pickFrom<T>(list: T[] | undefined, fallback: T | null): T | null {
  if (!list || list.length === 0) return fallback;
  return list[Math.floor(Math.random() * list.length)];
}

export function renderTemplate(str: string | null, vars: Record<string, string | undefined>): string | null {
  if (!str) return str;
  return str.replace(/\{(\w+)\}/g, (_, k: string) => (vars && vars[k] != null ? String(vars[k]) : ""));
}

export function motivationMessage(
  mode: MotivationMode,
  category: MotivationCategory,
  fallback: string,
  vars: Record<string, string | undefined> = {}
): string {
  if (!mode || mode === "none") return fallback;
  const raw = pickFrom(MOTIVATION_MESSAGES[mode]?.[category], null);
  const rendered = raw ? renderTemplate(raw, vars) : null;
  return rendered ?? fallback;
}

export interface CoachBubbleInput {
  mealsLogged: number;
  remaining: number;
  overTarget: boolean;
  dietStyle: string;
  hasWorkoutToday: boolean;
  hasEatingToday: boolean;
  /** First workout's label, if any today — used by the "dayPlan" category's {workout} var. */
  workoutLabel?: string | null;
  prevResult: string | null;
  /** Injectable for tests; defaults to the current hour. */
  hour?: number;
}

/**
 * Picks ONE message from whichever categories actually apply right now,
 * instead of a fixed if/else chain that always returns the first match —
 * that meant a day with both a workout and an eating window only ever
 * talked about one of them (whichever check came first), and the same
 * handful of categories dominated every day. Collecting every applicable
 * category and choosing randomly among them (plus a much bigger pool per
 * category) is what actually produces day-to-day variety.
 */
export function coachBubbleMessage(mode: MotivationMode, input: CoachBubbleInput): string | null {
  if (!mode || mode === "none") return null;
  const pool = MOTIVATION_MESSAGES[mode];
  if (!pool) return null;
  const vars = {
    diet: DIET_HINTS[input.dietStyle] || "your plan",
    prev: input.prevResult || "",
    workout: input.workoutLabel || "today's workout",
  };
  const hour = input.hour ?? new Date().getHours();

  // Over target is corrective feedback, not just flavor — always show it
  // when true rather than leaving it to chance alongside everything else.
  if (input.overTarget) return renderTemplate(pickFrom(pool.overTarget, null), vars);

  const candidates: MotivationCategory[] = [];
  if (input.hasWorkoutToday && input.hasEatingToday) candidates.push("dayPlan", "dayPlan"); // weighted — richest message
  if (input.hasWorkoutToday && input.prevResult) candidates.push("workoutStartWithPrev");
  else if (input.hasWorkoutToday) candidates.push("workoutReminder");
  if (input.hasEatingToday) candidates.push("eatingOpen");
  if (input.mealsLogged === 0 && hour >= 11) candidates.push("noMealsYet");
  if (input.remaining >= 0 && input.remaining < 200) candidates.push("almostThere");
  candidates.push("dietReminder", "general");

  const category = candidates[Math.floor(Math.random() * candidates.length)];
  return renderTemplate(pickFrom(pool[category], null), vars);
}
