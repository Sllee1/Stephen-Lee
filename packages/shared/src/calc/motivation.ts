import { DIET_HINTS, MOTIVATION_MESSAGES, type MotivationCategory } from "../constants/motivation";
import type { MotivationMode } from "../types";

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
  prevResult: string | null;
  /** Injectable for tests; defaults to the current hour. */
  hour?: number;
}

export function coachBubbleMessage(mode: MotivationMode, input: CoachBubbleInput): string | null {
  if (!mode || mode === "none") return null;
  const pool = MOTIVATION_MESSAGES[mode];
  if (!pool) return null;
  const vars = { diet: DIET_HINTS[input.dietStyle] || "your plan", prev: input.prevResult || "" };
  const hour = input.hour ?? new Date().getHours();

  if (input.overTarget) return renderTemplate(pickFrom(pool.overTarget, null), vars);
  if (input.hasWorkoutToday && input.prevResult) return renderTemplate(pickFrom(pool.workoutStartWithPrev, null), vars);
  if (input.mealsLogged === 0 && hour >= 11) return renderTemplate(pickFrom(pool.noMealsYet, null), vars);
  if (input.hasWorkoutToday) return renderTemplate(pickFrom(pool.workoutReminder, null), vars);
  if (Math.random() < 0.5) return renderTemplate(pickFrom(pool.dietReminder, null), vars);
  if (input.remaining >= 0 && input.remaining < 200) return renderTemplate(pickFrom(pool.almostThere, null), vars);
  return renderTemplate(pickFrom(pool.general, null), vars);
}
