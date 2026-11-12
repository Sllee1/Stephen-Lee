import type { FastifyInstance } from "fastify";

/**
 * Served directly by the backend (not a separate static site) so there's
 * always a stable, working URL to put in the App Store Connect / Play
 * Console listing and the in-app "Premium"/paywall screens the moment the
 * backend is deployed — no separate hosting to set up just for these two
 * pages. Content reflects what this app actually does (see README) as of
 * this writing; update it (and bump EFFECTIVE_DATE) if the data it
 * collects or the services it talks to change.
 */

const PRODUCT_NAME = "OTAS Health & Fitness Planner";
const CONTACT_EMAIL = "InfoSupport.OTAS@gmail.com";
const EFFECTIVE_DATE = "November 12, 2026";

function page(title: string, bodyHtml: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${title} — ${PRODUCT_NAME}</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; max-width: 720px; margin: 0 auto; padding: 32px 20px 80px; color: #17170F; background: #FBF9F4; line-height: 1.55; }
  h1 { font-size: 28px; margin-bottom: 4px; }
  h2 { font-size: 19px; margin-top: 36px; }
  .meta { color: #77766B; margin-bottom: 32px; }
  a { color: #B5502D; }
  ul { padding-left: 20px; }
</style>
</head>
<body>
${bodyHtml}
</body>
</html>`;
}

const PRIVACY_BODY = `
<h1>Privacy Policy</h1>
<p class="meta">Effective ${EFFECTIVE_DATE}</p>

<p>This policy explains what ${PRODUCT_NAME} collects, why, and how to delete it. ${PRODUCT_NAME} is a nutrition and fitness tracking app.</p>

<h2>Information we collect</h2>
<ul>
  <li><strong>Account:</strong> email address and password (stored as a salted hash, never in plain text).</li>
  <li><strong>Profile:</strong> sex, age, height, weight, activity level, and fitness goal, used to calculate calorie/macro targets.</li>
  <li><strong>Food &amp; meal logs:</strong> meals you log (manually, by photo, or by search), including any photo you choose to submit for AI analysis.</li>
  <li><strong>Photos &amp; video:</strong> a meal photo, an optional "build photo" for a visual BMI estimate, and technique-check workout videos you choose to submit — sent to our AI provider (Anthropic) for one-time analysis and not used to train their models on our behalf.</li>
  <li><strong>Workout &amp; calendar data:</strong> workout results, and the eating/workout schedule you set up.</li>
  <li><strong>Weight history:</strong> entries you log over time.</li>
  <li><strong>Push notification token:</strong> only if you enable reminders, used solely to deliver them to your device.</li>
  <li><strong>Purchase data:</strong> subscription status (free/premium) from our in-app purchase provider, RevenueCat — we do not receive or store your payment card details; those are handled entirely by Apple/Google.</li>
  <li><strong>Advertising identifiers:</strong> if you're on the free tier, Google AdMob may use your device's advertising identifier to show ads, subject to the consent/App Tracking Transparency choice you make when prompted.</li>
</ul>

<h2>Who we share it with</h2>
<ul>
  <li><strong>Anthropic</strong> — processes photos/video you submit for AI analysis (food recognition, build estimate, technique feedback).</li>
  <li><strong>USDA FoodData Central</strong> — a public nutrition database we query by food name when you search; we don't send it any of your personal data.</li>
  <li><strong>RevenueCat</strong> — manages subscription status; receives your purchase receipt data from Apple/Google.</li>
  <li><strong>Google AdMob</strong> — serves ads to free-tier users, per the consent choice described above.</li>
  <li><strong>Expo</strong> — delivers push notifications to your device, if enabled.</li>
</ul>
<p>We do not sell your personal information.</p>

<h2>Your choices</h2>
<ul>
  <li><strong>Delete your account</strong> any time from Profile → Delete account. This permanently removes your profile, logged meals/photos, workout and weight history, and calendar — immediately, not after a delay. It does not cancel an active subscription; manage that from Profile → Manage subscription, or directly in the App Store/Play Store.</li>
  <li><strong>Ad personalization:</strong> you control this through the consent/tracking prompt shown on first launch, and can change it later in your device's privacy settings.</li>
  <li><strong>Notifications:</strong> can be disabled any time in your device's notification settings.</li>
</ul>

<h2>Data retention</h2>
<p>We keep your data for as long as your account exists. Deleting your account deletes it immediately from our database.</p>

<h2>Children</h2>
<p>${PRODUCT_NAME} is not directed at children under 13, and we do not knowingly collect information from them.</p>

<h2>Changes to this policy</h2>
<p>If this policy changes materially, we'll update the effective date above.</p>

<h2>Contact</h2>
<p>Questions or deletion requests: <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a></p>
`;

const TERMS_BODY = `
<h1>Terms of Service</h1>
<p class="meta">Effective ${EFFECTIVE_DATE}</p>

<p>These terms govern your use of ${PRODUCT_NAME}. By creating an account, you agree to them.</p>

<h2>The service</h2>
<p>${PRODUCT_NAME} provides nutrition tracking, meal/workout planning, and AI-assisted food/photo/video analysis. <strong>It is not a medical device and does not provide medical advice.</strong> Calorie/macro targets, BMI estimates, and AI-generated feedback are informational only — consult a qualified professional before making health decisions, especially if you have a medical condition.</p>

<h2>Your account</h2>
<p>You're responsible for the accuracy of the information you provide and for keeping your login credentials secure. You must be at least 13 years old to use ${PRODUCT_NAME}.</p>

<h2>Subscriptions</h2>
<p>Premium is an auto-renewing subscription billed through the Apple App Store or Google Play, at the price shown at purchase. It renews automatically unless cancelled at least 24 hours before the end of the current period, via your Apple ID or Google Play account settings. Refunds are handled by Apple/Google per their respective policies, not by us directly.</p>

<h2>Acceptable use</h2>
<p>Don't use ${PRODUCT_NAME} to submit content that is illegal, infringing, or that depicts anyone other than yourself without their consent (e.g., meal/build photos, technique-check videos).</p>

<h2>Disclaimer &amp; limitation of liability</h2>
<p>${PRODUCT_NAME} is provided "as is," without warranties of any kind. To the maximum extent permitted by law, we are not liable for any indirect, incidental, or consequential damages arising from your use of the app, including decisions made based on AI-generated nutrition or fitness content.</p>

<h2>Changes</h2>
<p>We may update these terms from time to time; continued use after a change means you accept the updated terms.</p>

<h2>Contact</h2>
<p><a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a></p>
`;

export default async function legalRoutes(app: FastifyInstance) {
  app.get("/privacy", async (_request, reply) => {
    reply.type("text/html").send(page("Privacy Policy", PRIVACY_BODY));
  });

  app.get("/terms", async (_request, reply) => {
    reply.type("text/html").send(page("Terms of Service", TERMS_BODY));
  });
}
