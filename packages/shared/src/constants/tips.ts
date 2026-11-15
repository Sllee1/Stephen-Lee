/**
 * Practical, neutral tips for the Trainer tab's "Today's plan" summary —
 * deliberately separate from the Motivation-mode pep talk (motivation.ts):
 * these aren't tone-dependent encouragement, they're informational, so they
 * show the same regardless of whether Motivation mode is off.
 */
export const WORKOUT_DAY_TIPS: string[] = [
  "Warm up for 5-10 minutes before you start — it cuts injury risk and you'll lift/move better once you're warm.",
  "Hydrate well in the hours before training, not just during — most of the benefit happens before you start.",
  "Protein within a couple hours after training helps recovery — don't let today's workout go unfed.",
  "A short walk or light cardio the day after a hard session can speed recovery more than total rest.",
  "If today's session feels heavy, it's fine to drop the weight/intensity slightly and still get the benefit — showing up matters more than hitting a number.",
  "Sleep the night before training matters almost as much as the session itself — if you're running short, consider an easier day.",
];

export const EATING_WINDOW_TIPS: string[] = [
  "Front-load protein early in your eating window — it's easy to run out of room for it later in the day.",
  "Water (or anything calorie-free) counted first can take the edge off hunger before your window opens.",
  "Planning your biggest meal around training days tends to feel better than eating the same every day.",
  "A little fiber and protein at the start of your window helps keep things steady until the next one.",
  "If you're close to your calorie target, leftover room is a good spot for something you'll actually enjoy, not just whatever's easiest.",
];

export const REST_DAY_TIPS: string[] = [
  "No workout today — a good day to focus on sleep and recovery instead.",
  "Rest days are part of the plan, not a day off from it — light movement (a walk, stretching) still helps.",
  "No training today means hitting your protein target matters just as much, if not more, for recovery.",
];

export function pickTip(hasWorkoutToday: boolean, hasEatingToday: boolean): string {
  const pool: string[] = [];
  if (hasWorkoutToday) pool.push(...WORKOUT_DAY_TIPS);
  if (hasEatingToday) pool.push(...EATING_WINDOW_TIPS);
  if (!hasWorkoutToday) pool.push(...REST_DAY_TIPS);
  if (pool.length === 0) pool.push(...WORKOUT_DAY_TIPS, ...EATING_WINDOW_TIPS);
  return pool[Math.floor(Math.random() * pool.length)];
}
