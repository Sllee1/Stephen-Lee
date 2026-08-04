/** Design tokens ported from the prototype's nutrition-label-inspired palette. */
export const colors = {
  ink: "#17170F",
  paper: "#FBF9F4",
  card: "#FFFFFF",
  line: "#17170F",
  muted: "#77766B",
  green: "#3F6B4F", // protein
  rust: "#B5502D", // calories / energy
  amber: "#B8842E", // carbs
  plum: "#6C4A63", // fat
};

export const colorForBmiCategory: Record<"amber" | "green" | "rust", string> = {
  amber: colors.amber,
  green: colors.green,
  rust: colors.rust,
};
