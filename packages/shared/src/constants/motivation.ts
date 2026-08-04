export interface MotivationModeOption {
  id: "none" | "moderate" | "extreme";
  label: string;
  sub: string;
}

export const MOTIVATION_MODES: MotivationModeOption[] = [
  { id: "none", label: "No motivation", sub: "Just the plan — no extra messages" },
  { id: "moderate", label: "Moderate", sub: "Encouraging nudges to stay on track" },
  { id: "extreme", label: "Extreme", sub: "Blunt, high-intensity tone — no sugarcoating" },
];

export const DIET_HINTS: Record<string, string> = {
  balanced: "balanced eating",
  vegetarian: "vegetarian",
  vegan: "vegan",
  keto: "low-carb",
  carnivore: "meat only",
  mediterranean: "Mediterranean-style eating",
};

export type MotivationCategory =
  | "workoutStart"
  | "workoutStartWithPrev"
  | "workoutReminder"
  | "workoutEnd"
  | "eatingOpen"
  | "eatingClose"
  | "dietReminder"
  | "noMealsYet"
  | "overTarget"
  | "almostThere"
  | "general";

/**
 * Message pools by mode and situation. "extreme" leans into sarcasm and doubt
 * as a motivating device ("bet you can't...") but stays aimed at today's
 * actions/follow-through — never at the person's body, worth, or character.
 * It's an opt-in tone, switchable back anytime.
 */
export const MOTIVATION_MESSAGES: Record<"moderate" | "extreme", Record<MotivationCategory, string[]>> = {
  moderate: {
    workoutStart: [
      "You can do this! Time to get moving 💪",
      "Let's go! Every workout gets you closer to your goal.",
      "One more step toward your goal — let's crush this workout!",
    ],
    workoutStartWithPrev: [
      "You can do this! Last time: {prev} — let's beat it today! 💪",
      "One day closer to your goal! Try to top your last result: {prev}.",
      "Last time you hit {prev} — think you can beat it today? You've got this!",
    ],
    workoutReminder: [
      "You've got a workout today — let's get it done! 💪",
      "Don't forget today's workout — you'll feel amazing after!",
      "Workout day! One more step toward your goal.",
    ],
    workoutEnd: ["Awesome work! One day closer to your goal 🎉", "You crushed that! So proud of you.", "Nice job finishing strong — keep it up!"],
    eatingOpen: [
      "Window's open — fuel up! Remember, {diet} today 💪",
      "Time to eat! Stick with {diet} — you're doing great.",
      "Eating window's open — one more step toward your goal!",
    ],
    eatingClose: [
      "Window's closed — nice job staying on track today! 🎉",
      "That's a wrap! You're one day closer to your goal.",
      "Great job today — remember, {diet} tomorrow too. Keep going!",
    ],
    dietReminder: ["Remember to stay on track — {diet}! You've got this 💪", "Stick with {diet} today — you're doing amazing!", "Keep it up! {diet}, one meal at a time."],
    noMealsYet: ["Haven't logged anything yet — you're one photo away from staying on track!", "No meals logged yet today — let's keep that streak going!"],
    overTarget: ["A little over today — no worries, tomorrow's a fresh start! You've got this.", "Over target today, but that's okay — keep going, you're doing great overall!"],
    almostThere: ["So close to your target — you're doing amazing!", "Almost there — finish strong today!"],
    general: ["You can do this! One day closer to your goal!", "Small steps every day — you're doing great!", "Keep going — you're closer than you think!"],
  },
  extreme: {
    workoutStart: ["Bet you can't even finish today's workout. Prove me wrong.", "Workout time. Or are you going to wimp out again?", "Let's see if you actually show up today."],
    workoutStartWithPrev: ["Last time: {prev}. Bet you can't beat it.", "{prev} was your last time — doubt you can top that today.", "Think you can beat {prev}? Prove it."],
    workoutReminder: ["You've got a workout today. Betting you skip it.", "Workout's on the schedule. We'll see if you actually show up.", "Today's a training day. Don't wimp out."],
    workoutEnd: ["Session's over. Did you actually push, or coast through it?", "Done? We'll see if that was real effort.", "Time's up. Better have given it everything."],
    eatingOpen: ["Window's open. Bet you cave and go off-plan.", "{diet} today. Or will you 'forget' again?", "Window's open. Stick to plan — or don't bother."],
    eatingClose: ["Window's shut. Did you actually stay on plan, or cheat?", "No more food. We both know you wanted to sneak something.", "Window closed. Prove you've got the discipline for {diet}."],
    dietReminder: ["Stay on {diet}. Bet you can't make it through the day without cheating.", "{diet}. No exceptions. Think you can handle it?", "Stick to {diet} — or are you already thinking about cheating?"],
    noMealsYet: ["Nothing logged yet. Too scared to see the numbers?", "Zero meals logged — avoiding accountability again?"],
    overTarget: ["Over target. Told you discipline was hard.", "Over target — bet you'll do it again tomorrow too."],
    almostThere: ["Almost there. Don't blow it now like you always do.", "So close — bet you cave anyway."],
    general: ["Bet you skip today. Prove me wrong.", "Everyone doubts you can stick with it. Show them.", "Think you can't do this? That's exactly why you need to."],
  },
};
