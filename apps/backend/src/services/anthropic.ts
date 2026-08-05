import { env } from "../env.js";
import {
  NUTRIENT_KEYS,
  type AnalyzeBuildPhotoResponse,
  type AnalyzeFoodPhotoResponse,
  type AnalyzeTechniqueVideoRequest,
  type AnalyzeTechniqueVideoResponse,
  type LookupFoodResponse,
} from "@nutrition-app/shared";

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-5";

/** All 29 tracked nutrient fields as a `"key":number,...` JSON-shape fragment, built from NUTRIENT_KEYS so prompts and the data model can never drift apart. */
const NUTRIENT_SHAPE = NUTRIENT_KEYS.map((k) => `"${k}":number`).join(",");

/**
 * All four AI features ran directly against this endpoint from the browser
 * in the prototype, with no API key attached client-side. Moving them here
 * means: the real key stays server-side, requests can be rate-limited per
 * user, and responses can be cached/logged for debugging without a client
 * MITM. Callers in routes/ai.ts should sit behind requireAuth (and, if you
 * want AI usage to be a premium perk, requireEntitlement) — the AI calls
 * cost real money per request.
 */
async function callClaude(content: unknown[], maxTokens: number): Promise<string> {
  if (!env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY isn't configured on the server — photo analysis, food lookup, and technique check are unavailable until it's set.");
  }

  const response = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      // Sonnet 5 thinks by default (unlike 4.6), and max_tokens caps thinking
      // + response together — pin effort down for these bounded, latency-
      // sensitive extraction calls rather than paying for the "high" default
      // on every meal log.
      thinking: { type: "adaptive" },
      output_config: { effort: "medium" },
      messages: [{ role: "user", content }],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Anthropic API request failed (${response.status}): ${body}`);
  }

  const data = (await response.json()) as { content?: { type: string; text?: string }[] };
  const text = (data.content ?? [])
    .map((b) => (b.type === "text" ? b.text ?? "" : ""))
    .join("")
    .trim();
  return text.replace(/^```json\s*|^```\s*|```$/gm, "").trim();
}

function imageBlock(base64: string) {
  return { type: "image", source: { type: "base64", media_type: "image/jpeg", data: base64 } };
}

export async function analyzeFoodPhoto(imageBase64: string): Promise<AnalyzeFoodPhotoResponse> {
  const prompt = `You are a nutrition estimation assistant. Look at this photo of a meal and estimate its full nutrition, similar to what would appear on a packaged-food nutrition facts label.

Respond with ONLY valid JSON (no markdown fences, no commentary) matching exactly this shape, with every numeric field present (use 0 if genuinely negligible/unknown, never omit a field):
{"items":[{"name":string,"quantity":string,${NUTRIENT_SHAPE}}],"total":{${NUTRIENT_SHAPE}},"confidence":"low"|"medium"|"high","notes":string}

Use standard portion-size assumptions based on what's visible, and typical nutrient profiles for each identified food (e.g. citrus/peppers are higher vitamin C, leafy greens higher vitamin A/iron, dairy higher calcium, meat higher iron and B-vitamins, whole grains and legumes higher B1/B3/magnesium/zinc, fatty fish higher vitamin D/E, leafy/cruciferous greens higher vitamin K, nuts/seeds higher magnesium/zinc/vitamin E). "total" must equal the sum of "items". Keep "notes" to one short sentence about assumptions made. If the image doesn't clearly show food, set confidence to "low" and explain briefly in notes.`;

  const text = await callClaude([imageBlock(imageBase64), { type: "text", text: prompt }], 3000);
  return JSON.parse(text) as AnalyzeFoodPhotoResponse;
}

export async function analyzeBuildPhoto(imageBase64: string): Promise<AnalyzeBuildPhotoResponse> {
  const prompt = `This is a voluntary self-upload to a personal fitness app, used only to add context to a BMI number — BMI is known to misjudge body composition for people who carry unusually high muscle mass or unusually low muscle tone. Assess general visible build for that specific purpose, using respectful, clinical, non-judgmental language, as if writing a brief clinical note.

Respond with ONLY valid JSON (no markdown fences, no commentary) matching exactly this shape:
{"build":"very_muscular"|"athletic"|"average"|"lower_muscle_tone"|"unclear","bmiOffset":number,"confidence":"low"|"medium"|"high","note":string}

Rules:
- Use "very_muscular" only if visibly high muscle mass/definition is clearly evident (e.g. competitive lifter/bodybuilder level).
- Use "athletic" for a visibly toned, fit build without extreme muscularity.
- Use "average" if the photo doesn't show pronounced muscle or fat signals either way.
- Use "lower_muscle_tone" only if visible muscle definition is clearly limited relative to typical.
- Use "unclear" if the photo doesn't clearly show enough of the body, isn't a person, or you're not confident — do not guess, and set bmiOffset to 0.
- "bmiOffset" is your own best-effort numeric estimate of how many BMI points standard BMI is likely over- or under-stating body fat for this specific person, given their visible build — negative for muscular builds where BMI overstates fatness, positive for lower-muscle-tone builds where BMI may understate it. Give your genuine best estimate for this individual rather than a generic bucketed value — an extremely muscular physique can reasonably warrant a large adjustment. Use 0 for an average build.
- "note" must be one short, neutral sentence (max 20 words) describing only what's relevant to the BMI context, including a brief basis for the offset. Never comment on attractiveness, weight judgment, or anything beyond muscle/build context.`;

  const text = await callClaude([imageBlock(imageBase64), { type: "text", text: prompt }], 2000);
  return JSON.parse(text) as AnalyzeBuildPhotoResponse;
}

export async function lookupFoodByName(name: string, servingHint?: string): Promise<LookupFoodResponse> {
  const prompt = `Give nutrition facts for this food: "${name}"${servingHint ? ` — requested serving: "${servingHint}"` : ""}.

If no serving was given, pick one standard, realistic serving size (e.g. "1 medium", "1 cup", "100g", "1 slice") and report exactly what you used in "serving". If the requested serving is unclear or unusual, use your best interpretation and still report what you assumed.

Respond with ONLY valid JSON (no markdown fences, no commentary) matching exactly this shape, with every numeric field present (use 0 if genuinely negligible, never omit a field):
{"serving":string,${NUTRIENT_SHAPE},"found":boolean}

Base values on standard reference nutrition data for that food. Set "found" to false only if this doesn't resemble a real food at all (in which case still fill numeric fields with 0).`;

  const text = await callClaude([{ type: "text", text: prompt }], 2000);
  return JSON.parse(text) as LookupFoodResponse;
}

export async function analyzeTechniqueVideo(req: AnalyzeTechniqueVideoRequest): Promise<AnalyzeTechniqueVideoResponse> {
  const instructions = `You are a movement-technique coach. You'll see a chronological sequence of frames extracted from a short exercise video${req.movementLabel ? ` (labeled by the user as: "${req.movementLabel}")` : ""}. Give brief, actionable form feedback.

Respond with ONLY valid JSON (no markdown fences, no commentary) matching exactly this shape:
{"movement":string,"summary":string,"strengths":[string],"improvements":[string],"safetyNotes":[string],"confidence":"low"|"medium"|"high"}

Keep each list short (max 4 items) and specific to what's visible across the frames. Use "safetyNotes" only for genuine injury-risk concerns (e.g. knee valgus, rounded lower back under load) — leave it empty if nothing stands out. Set confidence to "low" if the frames don't clearly show the movement.`;

  const content: unknown[] = [{ type: "text", text: instructions }];
  req.frames.forEach((frame, i) => {
    content.push({ type: "text", text: `Frame ${i + 1} of ${req.frames.length} — about ${frame.time.toFixed(1)}s into the clip` });
    content.push(imageBlock(frame.imageBase64));
  });

  const text = await callClaude(content, 3000);
  return JSON.parse(text) as AnalyzeTechniqueVideoResponse;
}
