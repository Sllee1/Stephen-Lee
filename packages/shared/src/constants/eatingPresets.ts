export interface EatingPreset {
  id: string;
  label: string;
  sub: string;
  hours: number | null; // null = custom, user sets start/end directly
}

export const EATING_PRESETS: EatingPreset[] = [
  { id: "omad", label: "OMAD", sub: "1:23 — one meal a day", hours: 1 },
  { id: "16-8", label: "8:16", sub: "8h eating window", hours: 8 },
  { id: "14-10", label: "10:14", sub: "10h eating window", hours: 10 },
  { id: "12-12", label: "12:12", sub: "12h eating window", hours: 12 },
  { id: "custom", label: "Custom", sub: "Set your own start & end time", hours: null },
];

export const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const STRENGTH_DAYS_BY_GOAL: Record<"lose" | "maintain" | "gain", number> = {
  lose: 3,
  maintain: 3,
  gain: 4,
};

export const STRENGTH_SLOTS: Record<number, number[]> = {
  // day-of-week indices (0=Sun) that strength days land on for a given weekly count
  3: [1, 3, 5], // Mon, Wed, Fri
  4: [1, 2, 4, 5], // Mon, Tue, Thu, Fri
};
