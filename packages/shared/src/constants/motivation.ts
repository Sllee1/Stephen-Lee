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
  | "dayPlan"
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
 *
 * "dayPlan" is the richest category — it names both today's workout and the
 * fact an eating window's on the schedule, so the message actually reflects
 * what the user has coming up rather than only ever talking about whichever
 * one condition happened to match first (see coachBubbleMessage).
 */
export const MOTIVATION_MESSAGES: Record<"moderate" | "extreme", Record<MotivationCategory, string[]>> = {
  moderate: {
    dayPlan: [
      "Today's lined up: {workout}, plus staying on {diet}. One thing at a time — you've got this 💪",
      "{workout} today, and keep it {diet} at meals — that combo is how progress actually happens.",
      "You've got {workout} on deck today. Stick with {diet} and you're set up for a great day.",
      "Busy day ahead: {workout} plus your eating window. Knock out the workout, then fuel up right.",
      "{workout} today — show up for that, stay {diet} at your meals, and call it a win.",
      "Two things on today's plan: {workout}, and sticking to {diet}. Both matter, both doable.",
    ],
    workoutStart: [
      "You can do this! Time to get moving 💪",
      "Let's go! Every workout gets you closer to your goal.",
      "One more step toward your goal — let's crush this workout!",
      "Time to move — future you will thank you for this one.",
      "Lace up — this is exactly the kind of day that adds up over time.",
      "Here we go — show up, put in the work, feel great after.",
    ],
    workoutStartWithPrev: [
      "You can do this! Last time: {prev} — let's beat it today! 💪",
      "One day closer to your goal! Try to top your last result: {prev}.",
      "Last time you hit {prev} — think you can beat it today? You've got this!",
      "{prev} was your last mark. See if today's the day you top it.",
      "You've beaten tougher days than this — {prev} is just a number to chase down today.",
    ],
    workoutReminder: [
      "You've got a workout today — let's get it done! 💪",
      "Don't forget today's workout — you'll feel amazing after!",
      "Workout day! One more step toward your goal.",
      "Today's on the schedule — a session waiting for you whenever you're ready.",
      "Heads up — you've got a workout today. Future you is counting on present you.",
      "It's a training day. Even a solid effort counts for a lot.",
    ],
    workoutEnd: [
      "Awesome work! One day closer to your goal 🎉",
      "You crushed that! So proud of you.",
      "Nice job finishing strong — keep it up!",
      "That's done — and that's one more rep towards the bigger goal.",
      "Session complete. However it felt, you showed up — that's what counts.",
    ],
    eatingOpen: [
      "Window's open — fuel up! Remember, {diet} today 💪",
      "Time to eat! Stick with {diet} — you're doing great.",
      "Eating window's open — one more step toward your goal!",
      "You're clear to eat — keep it {diet} and enjoy the meal.",
      "Window's open. Good food, good choices, {diet} style.",
    ],
    eatingClose: [
      "Window's closed — nice job staying on track today! 🎉",
      "That's a wrap! You're one day closer to your goal.",
      "Great job today — remember, {diet} tomorrow too. Keep going!",
      "Eating window's done for the day — hope it treated you well.",
      "That's today's window closed. However it went, tomorrow's a fresh one.",
    ],
    dietReminder: [
      "Remember to stay on track — {diet}! You've got this 💪",
      "Stick with {diet} today — you're doing amazing!",
      "Keep it up! {diet}, one meal at a time.",
      "Today's a good day to keep that {diet} streak alive.",
      "Small {diet} choices today add up more than you'd think.",
      "Stay the course on {diet} — consistency beats perfection every time.",
    ],
    noMealsYet: [
      "Haven't logged anything yet — you're one photo away from staying on track!",
      "No meals logged yet today — let's keep that streak going!",
      "Nothing logged so far — whenever you eat, snap a photo and I'll be here.",
      "Quiet on the food log today — no rush, just don't forget once you do eat.",
    ],
    overTarget: [
      "A little over today — no worries, tomorrow's a fresh start! You've got this.",
      "Over target today, but that's okay — keep going, you're doing great overall!",
      "Today ran a bit high — one day doesn't undo your progress. Keep moving forward.",
      "Over for today — noted, not a disaster. Back on track tomorrow.",
    ],
    almostThere: [
      "So close to your target — you're doing amazing!",
      "Almost there — finish strong today!",
      "You're nearly at target — a great spot to land for today.",
    ],
    general: [
      "You can do this! One day closer to your goal!",
      "Small steps every day — you're doing great!",
      "Keep going — you're closer than you think!",
      "Showing up consistently is the whole game — and you're doing it.",
      "Today's just today — handle it well and the rest takes care of itself.",
      "Progress isn't always loud. Keep stacking good days.",
    ],
  },
  extreme: {
    dayPlan: [
      "Today: {workout}, and don't even think about ditching {diet}. Bet you fold on one of them.",
      "{workout} on the schedule, {diet} at meals. Two chances to prove you're serious today.",
      "Full day ahead — {workout} plus staying {diet}. Most people only manage one. Which are you?",
      "{workout} today. Stay {diet} at meals. Doubt you nail both, but go ahead and surprise me.",
      "Workout AND diet day: {workout}, {diet} eating. Don't half-ass either one.",
    ],
    workoutStart: [
      "Bet you can't even finish today's workout. Prove me wrong.",
      "Workout time. Or are you going to wimp out again?",
      "Let's see if you actually show up today.",
      "Today's the day you either show up or make excuses. Pick one.",
      "Workout's waiting. So is your track record of skipping these.",
      "Go on — give me a reason this one gets skipped too.",
    ],
    workoutStartWithPrev: [
      "Last time: {prev}. Bet you can't beat it.",
      "{prev} was your last time — doubt you can top that today.",
      "Think you can beat {prev}? Prove it.",
      "{prev}. That's the bar. Scared to even try clearing it?",
      "Last result was {prev} — or did you forget already?",
    ],
    workoutReminder: [
      "You've got a workout today. Betting you skip it.",
      "Workout's on the schedule. We'll see if you actually show up.",
      "Today's a training day. Don't wimp out.",
      "It's on the calendar. Doesn't mean it'll happen, knowing you.",
      "Workout day. Let's see if today's different from the last time you bailed.",
      "There's a session waiting. Go prove today isn't a skip day.",
    ],
    workoutEnd: [
      "Session's over. Did you actually push, or coast through it?",
      "Done? We'll see if that was real effort.",
      "Time's up. Better have given it everything.",
      "That's over. Was that effort, or just going through the motions?",
      "Finished. Don't tell me that was a soft one.",
    ],
    eatingOpen: [
      "Window's open. Bet you cave and go off-plan.",
      "{diet} today. Or will you 'forget' again?",
      "Window's open. Stick to plan — or don't bother.",
      "Eating time. Let's see if {diet} survives contact with your cravings.",
      "Window's open — this is where most people quietly give up. You too?",
    ],
    eatingClose: [
      "Window's shut. Did you actually stay on plan, or cheat?",
      "No more food. We both know you wanted to sneak something.",
      "Window closed. Prove you've got the discipline for {diet}.",
      "Done eating for the day. Honest answer — did you stay {diet}, or not really?",
      "Window's closed. Be honest with yourself about how that went.",
    ],
    dietReminder: [
      "Stay on {diet}. Bet you can't make it through the day without cheating.",
      "{diet}. No exceptions. Think you can handle it?",
      "Stick to {diet} — or are you already thinking about cheating?",
      "{diet} today. Simple instructions. Doubt you'll follow them though.",
      "Today's a {diet} day. Let's see if that lasts past lunch.",
      "Discipline check: {diet}, all day. No excuses lined up yet, are they?",
    ],
    noMealsYet: [
      "Nothing logged yet. Too scared to see the numbers?",
      "Zero meals logged — avoiding accountability again?",
      "No food logged. Hiding from the log, or just not eating right?",
      "Still nothing logged. We both know why you're avoiding it.",
    ],
    overTarget: [
      "Over target. Told you discipline was hard.",
      "Over target — bet you'll do it again tomorrow too.",
      "Over today. Shocking exactly no one.",
      "Over target. At least own it instead of pretending it didn't happen.",
    ],
    almostThere: [
      "Almost there. Don't blow it now like you always do.",
      "So close — bet you cave anyway.",
      "Right at the edge. This is usually where you slip.",
    ],
    general: [
      "Bet you skip today. Prove me wrong.",
      "Everyone doubts you can stick with it. Show them.",
      "Think you can't do this? That's exactly why you need to.",
      "Today's another chance to prove the doubters right. Or wrong — your call.",
      "Easy to talk about goals. Harder to actually show up. Which one are you today?",
      "Nobody's forcing you to try today. Do it anyway.",
    ],
  },
};
