export interface PhysiqueFigure {
  shoulder: number;
  waist: number;
  hip: number;
  arm: number;
  leg: number;
  definition: number; // 0-1, how much muscle-line detail to draw
}

export interface PhysiqueWorkoutDefaults {
  location: "home" | "gym" | "outside";
  equipment: "bodyweight" | "weights" | "mixed";
  cardioLevel: "low" | "moderate" | "high";
  sport: string;
}

export interface Physique {
  id: string;
  label: string;
  /** Reference ranges only (e.g. ACE general categories) — not a personalized measurement. */
  bodyFat: { male: [number, number]; female: [number, number] };
  proteinPerKg: number;
  suggestedMealStyle: string;
  workoutDefaults: PhysiqueWorkoutDefaults;
  figure: PhysiqueFigure;
}

export const PHYSIQUES: Physique[] = [
  {
    id: "athletic",
    label: "General athletic",
    bodyFat: { male: [14, 20], female: [21, 27] },
    proteinPerKg: 1.8,
    suggestedMealStyle: "balanced",
    workoutDefaults: { location: "gym", equipment: "mixed", cardioLevel: "moderate", sport: "none" },
    figure: { shoulder: 33, waist: 21, hip: 23, arm: 8, leg: 11, definition: 0.35 },
  },
  {
    id: "toned",
    label: "Toned",
    bodyFat: { male: [14, 18], female: [21, 25] },
    proteinPerKg: 1.9,
    suggestedMealStyle: "mediterranean",
    workoutDefaults: { location: "home", equipment: "mixed", cardioLevel: "moderate", sport: "none" },
    figure: { shoulder: 30, waist: 20, hip: 22, arm: 7, leg: 10, definition: 0.4 },
  },
  {
    id: "lean",
    label: "Lean / thin",
    bodyFat: { male: [10, 15], female: [18, 23] },
    proteinPerKg: 1.7,
    suggestedMealStyle: "mediterranean",
    workoutDefaults: { location: "home", equipment: "bodyweight", cardioLevel: "moderate", sport: "none" },
    figure: { shoulder: 25, waist: 16, hip: 17, arm: 5.5, leg: 8.5, definition: 0.15 },
  },
  {
    id: "muscular",
    label: "Muscular",
    bodyFat: { male: [12, 18], female: [18, 24] },
    proteinPerKg: 2.0,
    suggestedMealStyle: "balanced",
    workoutDefaults: { location: "gym", equipment: "weights", cardioLevel: "low", sport: "none" },
    figure: { shoulder: 40, waist: 24, hip: 25, arm: 11, leg: 13, definition: 0.55 },
  },
  {
    id: "bodybuilder",
    label: "Bodybuilder",
    bodyFat: { male: [6, 12], female: [14, 20] },
    proteinPerKg: 2.2,
    suggestedMealStyle: "balanced",
    workoutDefaults: { location: "gym", equipment: "weights", cardioLevel: "low", sport: "none" },
    figure: { shoulder: 46, waist: 25, hip: 26, arm: 13.5, leg: 15, definition: 0.85 },
  },
  {
    id: "ripped",
    label: "Ripped / shredded",
    bodyFat: { male: [6, 10], female: [14, 18] },
    proteinPerKg: 2.1,
    suggestedMealStyle: "keto",
    workoutDefaults: { location: "gym", equipment: "weights", cardioLevel: "high", sport: "none" },
    figure: { shoulder: 39, waist: 19, hip: 22, arm: 10, leg: 12, definition: 0.95 },
  },
  {
    id: "swimmer",
    label: "Swimmer build",
    bodyFat: { male: [10, 15], female: [18, 24] },
    proteinPerKg: 1.8,
    suggestedMealStyle: "balanced",
    workoutDefaults: { location: "gym", equipment: "mixed", cardioLevel: "high", sport: "swimming" },
    figure: { shoulder: 42, waist: 20, hip: 20, arm: 9, leg: 11, definition: 0.5 },
  },
  {
    id: "runner",
    label: "Runner build",
    bodyFat: { male: [8, 14], female: [16, 22] },
    proteinPerKg: 1.6,
    suggestedMealStyle: "balanced",
    workoutDefaults: { location: "outside", equipment: "bodyweight", cardioLevel: "high", sport: "running" },
    figure: { shoulder: 26, waist: 17, hip: 18, arm: 5.5, leg: 12.5, definition: 0.3 },
  },
];

export function bodyFatRangeFor(physiqueId: string, sex: "male" | "female"): [number, number] | null {
  const p = PHYSIQUES.find((x) => x.id === physiqueId);
  if (!p) return null;
  return p.bodyFat[sex] || p.bodyFat.male;
}

/** Labels for the visible-build category a photo analysis returns (see BuildLabel type). */
export const BUILD_LABELS: Record<string, string> = {
  very_muscular: "Very muscular build",
  athletic: "Athletic / toned build",
  average: "Average build",
  lower_muscle_tone: "Lower visible muscle tone",
  unclear: "Unclear from photo",
};
