export interface MealLibraryIngredient {
  name: string;
  qty: number;
  unit: string;
}

export interface MealLibraryOption {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: MealLibraryIngredient[];
}

export interface MealLibraryEntry {
  baseCalories: number;
  breakfast: MealLibraryOption[];
  lunch: MealLibraryOption[];
  dinner: MealLibraryOption[];
  snack: MealLibraryOption[];
}

export const MEAL_STYLES = ["balanced", "vegetarian", "vegan", "keto", "carnivore", "mediterranean"] as const;
export type MealStyle = (typeof MEAL_STYLES)[number];

/**
 * `breakfast`/`lunch`/`dinner`/`snack` options 1-2 per style are ported
 * verbatim from the prototype's MEAL_LIBRARY. Options 3+ are new content
 * authored for this rebuild (not from the prototype, which only had two
 * rotation options per meal slot) to reduce repeats across a multi-day
 * meal plan — same shape, same rough calorie/macro-estimation approach as
 * the original entries (hand-estimated per recipe, not looked up per
 * ingredient the way FOOD_DATABASE is).
 */
export const MEAL_LIBRARY: Record<MealStyle, MealLibraryEntry> = {
  balanced: {
    baseCalories: 2000,
    breakfast: [
      { name: "Greek yogurt, berries & granola", calories: 350, protein: 22, carbs: 45, fat: 9, ingredients: [{ name: "Greek yogurt", qty: 1, unit: "cup" }, { name: "Mixed berries", qty: 0.5, unit: "cup" }, { name: "Granola", qty: 0.25, unit: "cup" }] },
      { name: "Veggie omelet & toast", calories: 380, protein: 24, carbs: 30, fat: 18, ingredients: [{ name: "Eggs", qty: 3, unit: "whole" }, { name: "Bell pepper", qty: 0.5, unit: "whole" }, { name: "Whole-grain bread", qty: 1, unit: "slice" }] },
      { name: "Oatmeal with banana & peanut butter", calories: 400, protein: 14, carbs: 58, fat: 14, ingredients: [{ name: "Rolled oats", qty: 0.75, unit: "cup" }, { name: "Banana", qty: 1, unit: "whole" }, { name: "Peanut butter", qty: 1, unit: "tbsp" }] },
      { name: "Egg & avocado toast", calories: 410, protein: 20, carbs: 32, fat: 22, ingredients: [{ name: "Whole-grain bread", qty: 2, unit: "slice" }, { name: "Eggs", qty: 2, unit: "whole" }, { name: "Avocado", qty: 0.5, unit: "whole" }] },
    ],
    lunch: [
      { name: "Grilled chicken & quinoa bowl", calories: 520, protein: 40, carbs: 50, fat: 16, ingredients: [{ name: "Chicken breast", qty: 5, unit: "oz" }, { name: "Quinoa", qty: 0.75, unit: "cup cooked" }, { name: "Mixed greens", qty: 2, unit: "cup" }] },
      { name: "Turkey & avocado wrap", calories: 480, protein: 32, carbs: 42, fat: 20, ingredients: [{ name: "Turkey breast", qty: 4, unit: "oz" }, { name: "Whole-wheat tortilla", qty: 1, unit: "whole" }, { name: "Avocado", qty: 0.5, unit: "whole" }] },
      { name: "Salmon & sweet potato salad", calories: 540, protein: 36, carbs: 46, fat: 20, ingredients: [{ name: "Salmon fillet", qty: 5, unit: "oz" }, { name: "Sweet potato", qty: 1, unit: "whole" }, { name: "Mixed greens", qty: 2, unit: "cup" }] },
      { name: "Turkey chili", calories: 520, protein: 34, carbs: 54, fat: 16, ingredients: [{ name: "Ground turkey (93/7)", qty: 6, unit: "oz" }, { name: "Kidney beans", qty: 0.75, unit: "cup" }, { name: "Diced tomatoes", qty: 0.5, unit: "cup" }] },
    ],
    dinner: [
      { name: "Baked salmon, rice & broccoli", calories: 560, protein: 38, carbs: 48, fat: 22, ingredients: [{ name: "Salmon fillet", qty: 6, unit: "oz" }, { name: "Brown rice", qty: 0.75, unit: "cup cooked" }, { name: "Broccoli", qty: 1.5, unit: "cup" }] },
      { name: "Lean beef stir-fry", calories: 540, protein: 36, carbs: 44, fat: 20, ingredients: [{ name: "Lean beef strips", qty: 5, unit: "oz" }, { name: "Stir-fry vegetables", qty: 2, unit: "cup" }, { name: "Brown rice", qty: 0.5, unit: "cup cooked" }] },
      { name: "Roast chicken, potatoes & green beans", calories: 570, protein: 42, carbs: 44, fat: 20, ingredients: [{ name: "Chicken breast", qty: 6, unit: "oz" }, { name: "Potato", qty: 1, unit: "whole" }, { name: "Green beans", qty: 1.5, unit: "cup" }] },
      { name: "Shrimp & vegetable pasta", calories: 560, protein: 32, carbs: 62, fat: 16, ingredients: [{ name: "Shrimp", qty: 5, unit: "oz" }, { name: "Pasta", qty: 1, unit: "cup cooked" }, { name: "Mixed vegetables", qty: 1.5, unit: "cup" }] },
    ],
    snack: [
      { name: "Apple & almond butter", calories: 210, protein: 5, carbs: 24, fat: 11, ingredients: [{ name: "Apple", qty: 1, unit: "whole" }, { name: "Almond butter", qty: 1, unit: "tbsp" }] },
      { name: "Greek yogurt with honey", calories: 180, protein: 18, carbs: 20, fat: 3, ingredients: [{ name: "Greek yogurt", qty: 1, unit: "cup" }, { name: "Honey", qty: 1, unit: "tbsp" }] },
      { name: "Protein shake", calories: 160, protein: 25, carbs: 8, fat: 3, ingredients: [{ name: "Protein powder", qty: 1, unit: "scoop" }, { name: "Milk", qty: 1, unit: "cup" }] },
    ],
  },
  vegetarian: {
    baseCalories: 1950,
    breakfast: [
      { name: "Cottage cheese & fruit bowl", calories: 340, protein: 26, carbs: 38, fat: 8, ingredients: [{ name: "Cottage cheese", qty: 1, unit: "cup" }, { name: "Pineapple", qty: 0.5, unit: "cup" }, { name: "Walnuts", qty: 1, unit: "tbsp" }] },
      { name: "Spinach & feta omelet", calories: 360, protein: 22, carbs: 20, fat: 22, ingredients: [{ name: "Eggs", qty: 3, unit: "whole" }, { name: "Spinach", qty: 1, unit: "cup" }, { name: "Feta cheese", qty: 2, unit: "tbsp" }] },
      { name: "Peanut butter banana oatmeal", calories: 380, protein: 14, carbs: 56, fat: 12, ingredients: [{ name: "Rolled oats", qty: 0.75, unit: "cup" }, { name: "Banana", qty: 1, unit: "whole" }, { name: "Peanut butter", qty: 1, unit: "tbsp" }] },
      { name: "Egg & avocado toast", calories: 370, protein: 16, carbs: 32, fat: 20, ingredients: [{ name: "Whole-grain bread", qty: 2, unit: "slice" }, { name: "Egg", qty: 1, unit: "whole" }, { name: "Avocado", qty: 0.5, unit: "whole" }] },
    ],
    lunch: [
      { name: "Chickpea & halloumi salad", calories: 500, protein: 26, carbs: 48, fat: 22, ingredients: [{ name: "Chickpeas", qty: 1, unit: "cup" }, { name: "Halloumi cheese", qty: 3, unit: "oz" }, { name: "Mixed greens", qty: 2, unit: "cup" }] },
      { name: "Black bean & rice bowl", calories: 480, protein: 20, carbs: 68, fat: 12, ingredients: [{ name: "Black beans", qty: 1, unit: "cup" }, { name: "Brown rice", qty: 0.75, unit: "cup cooked" }, { name: "Salsa", qty: 0.25, unit: "cup" }] },
      { name: "Veggie burger & sweet potato fries", calories: 520, protein: 22, carbs: 62, fat: 18, ingredients: [{ name: "Veggie burger patty", qty: 1, unit: "whole" }, { name: "Sweet potato", qty: 1, unit: "whole" }, { name: "Whole-grain bun", qty: 1, unit: "whole" }] },
      { name: "Caprese quinoa salad", calories: 480, protein: 18, carbs: 48, fat: 22, ingredients: [{ name: "Quinoa", qty: 0.75, unit: "cup cooked" }, { name: "Mozzarella cheese", qty: 2, unit: "oz" }, { name: "Tomato", qty: 1, unit: "whole" }] },
    ],
    dinner: [
      { name: "Paneer tikka & vegetables", calories: 540, protein: 28, carbs: 40, fat: 28, ingredients: [{ name: "Paneer", qty: 5, unit: "oz" }, { name: "Bell peppers", qty: 1, unit: "cup" }, { name: "Basmati rice", qty: 0.5, unit: "cup cooked" }] },
      { name: "Lentil & vegetable curry", calories: 500, protein: 24, carbs: 62, fat: 14, ingredients: [{ name: "Lentils", qty: 1, unit: "cup cooked" }, { name: "Mixed vegetables", qty: 1.5, unit: "cup" }, { name: "Basmati rice", qty: 0.5, unit: "cup cooked" }] },
      { name: "Eggplant parmesan & pasta", calories: 560, protein: 24, carbs: 58, fat: 22, ingredients: [{ name: "Eggplant", qty: 1.5, unit: "cup" }, { name: "Mozzarella cheese", qty: 2, unit: "oz" }, { name: "Pasta", qty: 0.75, unit: "cup cooked" }] },
      { name: "Tofu & vegetable stir-fry", calories: 500, protein: 22, carbs: 52, fat: 20, ingredients: [{ name: "Firm tofu", qty: 6, unit: "oz" }, { name: "Stir-fry vegetables", qty: 2, unit: "cup" }, { name: "Brown rice", qty: 0.5, unit: "cup cooked" }] },
    ],
    snack: [
      { name: "Hummus & veggies", calories: 200, protein: 7, carbs: 22, fat: 10, ingredients: [{ name: "Hummus", qty: 0.25, unit: "cup" }, { name: "Carrots", qty: 1, unit: "cup" }] },
      { name: "Cottage cheese & pineapple", calories: 180, protein: 20, carbs: 16, fat: 4, ingredients: [{ name: "Cottage cheese", qty: 0.75, unit: "cup" }, { name: "Pineapple", qty: 0.5, unit: "cup" }] },
      { name: "String cheese & grapes", calories: 190, protein: 8, carbs: 22, fat: 7, ingredients: [{ name: "String cheese", qty: 1, unit: "stick" }, { name: "Grapes", qty: 1, unit: "cup" }] },
    ],
  },
  vegan: {
    baseCalories: 1900,
    breakfast: [
      { name: "Overnight oats & almond milk", calories: 340, protein: 12, carbs: 54, fat: 10, ingredients: [{ name: "Rolled oats", qty: 0.5, unit: "cup" }, { name: "Almond milk", qty: 1, unit: "cup" }, { name: "Chia seeds", qty: 1, unit: "tbsp" }] },
      { name: "Tofu scramble & toast", calories: 360, protein: 20, carbs: 32, fat: 16, ingredients: [{ name: "Firm tofu", qty: 6, unit: "oz" }, { name: "Whole-grain bread", qty: 1, unit: "slice" }, { name: "Turmeric", qty: 0.5, unit: "tsp" }] },
      { name: "Chia pudding with berries", calories: 320, protein: 10, carbs: 44, fat: 12, ingredients: [{ name: "Chia seeds", qty: 3, unit: "tbsp" }, { name: "Almond milk", qty: 1, unit: "cup" }, { name: "Mixed berries", qty: 0.5, unit: "cup" }] },
      { name: "Peanut butter banana smoothie", calories: 360, protein: 14, carbs: 52, fat: 12, ingredients: [{ name: "Banana", qty: 1, unit: "whole" }, { name: "Peanut butter", qty: 1.5, unit: "tbsp" }, { name: "Soy milk", qty: 1.5, unit: "cup" }] },
    ],
    lunch: [
      { name: "Buddha bowl w/ tempeh", calories: 500, protein: 24, carbs: 58, fat: 18, ingredients: [{ name: "Tempeh", qty: 4, unit: "oz" }, { name: "Quinoa", qty: 0.75, unit: "cup cooked" }, { name: "Mixed vegetables", qty: 1.5, unit: "cup" }] },
      { name: "Lentil soup & bread", calories: 460, protein: 22, carbs: 64, fat: 10, ingredients: [{ name: "Lentils", qty: 1, unit: "cup cooked" }, { name: "Vegetable broth", qty: 2, unit: "cup" }, { name: "Whole-grain bread", qty: 1, unit: "slice" }] },
      { name: "Falafel & hummus wrap", calories: 480, protein: 18, carbs: 62, fat: 18, ingredients: [{ name: "Falafel", qty: 5, unit: "pieces" }, { name: "Hummus", qty: 3, unit: "tbsp" }, { name: "Whole-wheat tortilla", qty: 1, unit: "whole" }] },
      { name: "Black bean & corn salad", calories: 440, protein: 16, carbs: 64, fat: 12, ingredients: [{ name: "Black beans", qty: 1, unit: "cup" }, { name: "Corn", qty: 1, unit: "cup" }, { name: "Avocado", qty: 0.5, unit: "whole" }] },
    ],
    dinner: [
      { name: "Chickpea curry & rice", calories: 520, protein: 20, carbs: 70, fat: 16, ingredients: [{ name: "Chickpeas", qty: 1, unit: "cup" }, { name: "Coconut milk", qty: 0.5, unit: "cup" }, { name: "Basmati rice", qty: 0.75, unit: "cup cooked" }] },
      { name: "Black bean tacos", calories: 500, protein: 18, carbs: 66, fat: 16, ingredients: [{ name: "Black beans", qty: 1, unit: "cup" }, { name: "Corn tortillas", qty: 3, unit: "whole" }, { name: "Avocado", qty: 0.5, unit: "whole" }] },
      { name: "Tempeh stir-fry & rice", calories: 520, protein: 26, carbs: 60, fat: 16, ingredients: [{ name: "Tempeh", qty: 5, unit: "oz" }, { name: "Stir-fry vegetables", qty: 2, unit: "cup" }, { name: "Brown rice", qty: 0.75, unit: "cup cooked" }] },
      { name: "Lentil shepherd's pie", calories: 500, protein: 22, carbs: 66, fat: 14, ingredients: [{ name: "Lentils", qty: 1, unit: "cup cooked" }, { name: "Potato", qty: 2, unit: "whole" }, { name: "Mixed vegetables", qty: 1, unit: "cup" }] },
    ],
    snack: [
      { name: "Trail mix", calories: 210, protein: 6, carbs: 20, fat: 13, ingredients: [{ name: "Mixed nuts", qty: 0.25, unit: "cup" }, { name: "Dried cranberries", qty: 2, unit: "tbsp" }] },
      { name: "Apple & peanut butter", calories: 220, protein: 6, carbs: 26, fat: 11, ingredients: [{ name: "Apple", qty: 1, unit: "whole" }, { name: "Peanut butter", qty: 1.5, unit: "tbsp" }] },
      { name: "Edamame", calories: 190, protein: 17, carbs: 15, fat: 8, ingredients: [{ name: "Edamame", qty: 1, unit: "cup" }] },
    ],
  },
  keto: {
    baseCalories: 1900,
    breakfast: [
      { name: "Bacon & eggs", calories: 420, protein: 26, carbs: 3, fat: 34, ingredients: [{ name: "Eggs", qty: 3, unit: "whole" }, { name: "Bacon", qty: 3, unit: "slice" }] },
      { name: "Avocado & sausage skillet", calories: 440, protein: 22, carbs: 6, fat: 36, ingredients: [{ name: "Breakfast sausage", qty: 4, unit: "oz" }, { name: "Avocado", qty: 1, unit: "whole" }, { name: "Eggs", qty: 2, unit: "whole" }] },
      { name: "Cheese & spinach omelet", calories: 440, protein: 28, carbs: 4, fat: 36, ingredients: [{ name: "Eggs", qty: 3, unit: "whole" }, { name: "Cheddar cheese", qty: 1.5, unit: "oz" }, { name: "Spinach", qty: 1, unit: "cup" }] },
      { name: "Keto smoothie", calories: 400, protein: 20, carbs: 6, fat: 34, ingredients: [{ name: "Coconut milk", qty: 1, unit: "cup" }, { name: "Protein powder", qty: 1, unit: "scoop" }, { name: "Almond butter", qty: 1, unit: "tbsp" }] },
    ],
    lunch: [
      { name: "Cobb salad", calories: 520, protein: 34, carbs: 8, fat: 40, ingredients: [{ name: "Grilled chicken", qty: 4, unit: "oz" }, { name: "Bacon", qty: 2, unit: "slice" }, { name: "Blue cheese", qty: 2, unit: "tbsp" }] },
      { name: "Tuna & olive oil salad", calories: 480, protein: 32, carbs: 5, fat: 38, ingredients: [{ name: "Canned tuna", qty: 5, unit: "oz" }, { name: "Olive oil", qty: 2, unit: "tbsp" }, { name: "Mixed greens", qty: 2, unit: "cup" }] },
      { name: "Bunless bacon cheeseburger", calories: 560, protein: 36, carbs: 4, fat: 44, ingredients: [{ name: "Ground beef (85/15)", qty: 6, unit: "oz" }, { name: "Cheddar cheese", qty: 1.5, unit: "oz" }, { name: "Bacon", qty: 2, unit: "slice" }] },
      { name: "Chicken caesar salad, no croutons", calories: 500, protein: 38, carbs: 6, fat: 36, ingredients: [{ name: "Grilled chicken", qty: 5, unit: "oz" }, { name: "Parmesan cheese", qty: 3, unit: "tbsp" }, { name: "Romaine lettuce", qty: 2, unit: "cup" }] },
    ],
    dinner: [
      { name: "Ribeye & buttered greens", calories: 620, protein: 40, carbs: 6, fat: 48, ingredients: [{ name: "Ribeye steak", qty: 8, unit: "oz" }, { name: "Butter", qty: 1, unit: "tbsp" }, { name: "Green beans", qty: 1.5, unit: "cup" }] },
      { name: "Salmon & asparagus", calories: 580, protein: 36, carbs: 6, fat: 44, ingredients: [{ name: "Salmon fillet", qty: 7, unit: "oz" }, { name: "Asparagus", qty: 1.5, unit: "cup" }, { name: "Olive oil", qty: 1, unit: "tbsp" }] },
      { name: "Pork chops & cauliflower mash", calories: 580, protein: 40, carbs: 8, fat: 42, ingredients: [{ name: "Pork chop", qty: 8, unit: "oz" }, { name: "Cauliflower", qty: 1.5, unit: "cup" }, { name: "Butter", qty: 1, unit: "tbsp" }] },
      { name: "Lamb chops & sautéed spinach", calories: 600, protein: 38, carbs: 6, fat: 46, ingredients: [{ name: "Lamb chops", qty: 7, unit: "oz" }, { name: "Spinach", qty: 1.5, unit: "cup" }, { name: "Olive oil", qty: 1, unit: "tbsp" }] },
    ],
    snack: [
      { name: "Cheese & macadamias", calories: 260, protein: 9, carbs: 3, fat: 24, ingredients: [{ name: "Cheddar cheese", qty: 1.5, unit: "oz" }, { name: "Macadamia nuts", qty: 0.25, unit: "cup" }] },
      { name: "Hard-boiled eggs & avocado", calories: 240, protein: 14, carbs: 4, fat: 20, ingredients: [{ name: "Eggs", qty: 2, unit: "whole" }, { name: "Avocado", qty: 0.5, unit: "whole" }] },
      { name: "Beef jerky & almonds", calories: 230, protein: 18, carbs: 5, fat: 15, ingredients: [{ name: "Beef jerky", qty: 1, unit: "oz" }, { name: "Almonds", qty: 0.2, unit: "cup" }] },
    ],
  },
  carnivore: {
    baseCalories: 2000,
    breakfast: [
      { name: "Eggs & bacon", calories: 460, protein: 30, carbs: 1, fat: 36, ingredients: [{ name: "Eggs", qty: 4, unit: "whole" }, { name: "Bacon", qty: 4, unit: "slice" }] },
      { name: "Steak & eggs", calories: 520, protein: 40, carbs: 0, fat: 38, ingredients: [{ name: "Sirloin steak", qty: 5, unit: "oz" }, { name: "Eggs", qty: 2, unit: "whole" }] },
      { name: "Sausage & eggs", calories: 500, protein: 32, carbs: 2, fat: 40, ingredients: [{ name: "Breakfast sausage", qty: 5, unit: "oz" }, { name: "Eggs", qty: 3, unit: "whole" }] },
      { name: "Bone broth & eggs", calories: 380, protein: 30, carbs: 1, fat: 26, ingredients: [{ name: "Bone broth", qty: 2, unit: "cup" }, { name: "Eggs", qty: 3, unit: "whole" }] },
    ],
    lunch: [
      { name: "Ground beef patties", calories: 540, protein: 38, carbs: 0, fat: 42, ingredients: [{ name: "Ground beef (80/20)", qty: 8, unit: "oz" }, { name: "Butter", qty: 1, unit: "tbsp" }] },
      { name: "Chicken thighs", calories: 500, protein: 42, carbs: 0, fat: 34, ingredients: [{ name: "Chicken thighs", qty: 10, unit: "oz" }] },
      { name: "Pork chops", calories: 520, protein: 40, carbs: 0, fat: 38, ingredients: [{ name: "Pork chops", qty: 9, unit: "oz" }] },
      { name: "Lamb chops", calories: 560, protein: 42, carbs: 0, fat: 42, ingredients: [{ name: "Lamb chops", qty: 8, unit: "oz" }] },
    ],
    dinner: [
      { name: "Ribeye steak", calories: 620, protein: 44, carbs: 0, fat: 48, ingredients: [{ name: "Ribeye steak", qty: 9, unit: "oz" }, { name: "Butter", qty: 1, unit: "tbsp" }] },
      { name: "Pork chops & bone broth", calories: 560, protein: 46, carbs: 0, fat: 38, ingredients: [{ name: "Pork chops", qty: 9, unit: "oz" }, { name: "Bone broth", qty: 1, unit: "cup" }] },
      { name: "Bison steak & butter", calories: 580, protein: 46, carbs: 0, fat: 42, ingredients: [{ name: "Bison steak", qty: 9, unit: "oz" }, { name: "Butter", qty: 1, unit: "tbsp" }] },
      { name: "Duck breast", calories: 600, protein: 44, carbs: 0, fat: 44, ingredients: [{ name: "Duck breast", qty: 9, unit: "oz" }] },
    ],
    snack: [
      { name: "Beef jerky & hard cheese", calories: 240, protein: 22, carbs: 2, fat: 16, ingredients: [{ name: "Beef jerky", qty: 2, unit: "oz" }, { name: "Hard cheese", qty: 1, unit: "oz" }] },
      { name: "Hard-boiled eggs", calories: 155, protein: 13, carbs: 1, fat: 11, ingredients: [{ name: "Eggs", qty: 2, unit: "whole" }] },
      { name: "Pork rinds & cheese", calories: 220, protein: 18, carbs: 1, fat: 16, ingredients: [{ name: "Pork rinds", qty: 1, unit: "oz" }, { name: "Cheddar cheese", qty: 1, unit: "oz" }] },
    ],
  },
  mediterranean: {
    baseCalories: 1950,
    breakfast: [
      { name: "Greek yogurt, honey & walnuts", calories: 340, protein: 20, carbs: 36, fat: 12, ingredients: [{ name: "Greek yogurt", qty: 1, unit: "cup" }, { name: "Honey", qty: 1, unit: "tbsp" }, { name: "Walnuts", qty: 2, unit: "tbsp" }] },
      { name: "Tomato, feta & olive toast", calories: 360, protein: 14, carbs: 38, fat: 18, ingredients: [{ name: "Whole-grain bread", qty: 2, unit: "slice" }, { name: "Feta cheese", qty: 2, unit: "tbsp" }, { name: "Tomato", qty: 1, unit: "whole" }] },
      { name: "Shakshuka", calories: 380, protein: 20, carbs: 24, fat: 22, ingredients: [{ name: "Eggs", qty: 3, unit: "whole" }, { name: "Tomato", qty: 2, unit: "whole" }, { name: "Feta cheese", qty: 2, unit: "tbsp" }] },
      { name: "Fig & ricotta toast", calories: 360, protein: 14, carbs: 44, fat: 14, ingredients: [{ name: "Whole-grain bread", qty: 2, unit: "slice" }, { name: "Ricotta cheese", qty: 0.33, unit: "cup" }, { name: "Honey", qty: 1, unit: "tbsp" }] },
    ],
    lunch: [
      { name: "Grilled fish & farro salad", calories: 500, protein: 34, carbs: 46, fat: 18, ingredients: [{ name: "White fish fillet", qty: 5, unit: "oz" }, { name: "Farro", qty: 0.75, unit: "cup cooked" }, { name: "Cucumber", qty: 1, unit: "cup" }] },
      { name: "Falafel & tabbouleh bowl", calories: 480, protein: 18, carbs: 58, fat: 18, ingredients: [{ name: "Falafel", qty: 5, unit: "pieces" }, { name: "Tabbouleh", qty: 1, unit: "cup" }, { name: "Olive oil", qty: 1, unit: "tbsp" }] },
      { name: "Greek salad with grilled chicken", calories: 500, protein: 36, carbs: 24, fat: 28, ingredients: [{ name: "Chicken breast", qty: 5, unit: "oz" }, { name: "Feta cheese", qty: 2, unit: "tbsp" }, { name: "Olives", qty: 0.25, unit: "cup" }] },
      { name: "Lentil & vegetable soup", calories: 440, protein: 20, carbs: 60, fat: 12, ingredients: [{ name: "Lentils", qty: 1, unit: "cup cooked" }, { name: "Mixed vegetables", qty: 1.5, unit: "cup" }, { name: "Olive oil", qty: 1, unit: "tbsp" }] },
    ],
    dinner: [
      { name: "Baked cod, olive oil & vegetables", calories: 520, protein: 36, carbs: 34, fat: 22, ingredients: [{ name: "Cod fillet", qty: 7, unit: "oz" }, { name: "Olive oil", qty: 2, unit: "tbsp" }, { name: "Roasted vegetables", qty: 2, unit: "cup" }] },
      { name: "Chicken souvlaki & couscous", calories: 540, protein: 38, carbs: 46, fat: 18, ingredients: [{ name: "Chicken breast", qty: 6, unit: "oz" }, { name: "Couscous", qty: 0.75, unit: "cup cooked" }, { name: "Tzatziki", qty: 0.25, unit: "cup" }] },
      { name: "Shrimp & orzo", calories: 520, protein: 32, carbs: 52, fat: 18, ingredients: [{ name: "Shrimp", qty: 6, unit: "oz" }, { name: "Orzo", qty: 0.75, unit: "cup cooked" }, { name: "Cherry tomatoes", qty: 1, unit: "cup" }] },
      { name: "Stuffed bell peppers", calories: 500, protein: 26, carbs: 48, fat: 20, ingredients: [{ name: "Bell peppers", qty: 2, unit: "whole" }, { name: "Ground beef (93/7)", qty: 5, unit: "oz" }, { name: "Brown rice", qty: 0.5, unit: "cup cooked" }] },
    ],
    snack: [
      { name: "Olives & almonds", calories: 200, protein: 5, carbs: 10, fat: 16, ingredients: [{ name: "Olives", qty: 0.25, unit: "cup" }, { name: "Almonds", qty: 0.2, unit: "cup" }] },
      { name: "Hummus & pita", calories: 220, protein: 8, carbs: 28, fat: 9, ingredients: [{ name: "Hummus", qty: 0.25, unit: "cup" }, { name: "Pita bread", qty: 0.5, unit: "whole" }] },
      { name: "Greek yogurt with dates", calories: 190, protein: 15, carbs: 26, fat: 4, ingredients: [{ name: "Greek yogurt", qty: 1, unit: "cup" }, { name: "Dates", qty: 2, unit: "whole" }] },
    ],
  },
};

export interface CategoryRule {
  category: "Produce" | "Meat & Fish" | "Dairy & Eggs" | "Pantry & Grains" | "Other";
  keywords: string[];
}

/** Ported verbatim from the prototype's CATEGORY_RULES (substring match, case-insensitive, in this order — "Other" is the fallback). */
export const CATEGORY_RULES: CategoryRule[] = [
  { category: "Produce", keywords: ["berr", "pepper", "avocado", "greens", "broccoli", "spinach", "tomato", "cucumber", "carrot", "apple", "pineapple", "asparagus", "vegetable", "salsa", "onion", "garlic"] },
  { category: "Meat & Fish", keywords: ["chicken", "beef", "salmon", "turkey", "bacon", "steak", "pork", "fish", "cod", "tuna", "sausage", "jerky", "ribeye", "sirloin"] },
  { category: "Dairy & Eggs", keywords: ["egg", "yogurt", "cheese", "feta", "butter", "halloumi", "paneer", "milk"] },
  {
    category: "Pantry & Grains",
    keywords: ["rice", "quinoa", "oat", "bread", "tortilla", "granola", "farro", "couscous", "lentil", "bean", "chickpea", "tofu", "tempeh", "broth", "honey", "olive oil", "nut", "almond", "walnut", "macadamia", "seed", "falafel", "tabbouleh", "tzatziki", "cranberr", "coconut"],
  },
];

export function categorizeIngredient(name: string): CategoryRule["category"] {
  const lower = name.toLowerCase();
  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.some((kw) => lower.includes(kw))) return rule.category;
  }
  return "Other";
}
