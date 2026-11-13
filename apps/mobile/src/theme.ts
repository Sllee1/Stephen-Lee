/** Design tokens ported from the prototype's nutrition-label-inspired palette. */
export const colors = {
  ink: "#17170F",
  paper: "#FAF3E6", // warmed slightly toward the app icon's cream plate
  card: "#FFFFFF",
  line: "#17170F",
  muted: "#77766B",
  green: "#3F6B4F", // protein
  rust: "#B5502D", // destructive actions / warnings / calorie-overage — NOT the brand accent
  amber: "#B8842E", // carbs
  plum: "#6C4A63", // fat
  primary: "#1F5C4D", // brand accent — matches the app icon's green (#024436), lightened for contrast against colors.paper
};

export const colorForBmiCategory: Record<"amber" | "green" | "rust", string> = {
  amber: colors.amber,
  green: colors.green,
  rust: colors.rust,
};
