export interface ActivityLevel {
  id: string;
  label: string;
  sub: string;
  mult: number;
}

export const ACTIVITY_LEVELS: ActivityLevel[] = [
  { id: "sedentary", label: "Sedentary", sub: "Little to no exercise", mult: 1.2 },
  { id: "light", label: "Lightly active", sub: "1–3 days/week", mult: 1.375 },
  { id: "moderate", label: "Moderately active", sub: "3–5 days/week", mult: 1.55 },
  { id: "active", label: "Very active", sub: "6–7 days/week", mult: 1.725 },
  { id: "athlete", label: "Athlete", sub: "Physical job or 2x/day", mult: 1.9 },
];

export interface GoalOption {
  id: "lose" | "maintain" | "gain";
  label: string;
  sub: string;
}

export const GOALS: GoalOption[] = [
  { id: "lose", label: "Lose weight", sub: "Moderate calorie deficit" },
  { id: "maintain", label: "Maintain", sub: "Stay at current weight" },
  { id: "gain", label: "Build muscle", sub: "Calorie surplus + strength" },
];
