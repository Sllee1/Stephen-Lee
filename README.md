# Nutrition Tracker — production monorepo

Production rebuild of the `NutritionTracker.jsx` React artifact prototype as
a React Native app with a real backend, ad-supported free tier, and a
premium subscription.

## Structure

```
apps/
  mobile/    Expo React Native app (iOS + Android)
  backend/   Fastify + Prisma + Postgres API
packages/
  shared/    Data model, constants, and pure calculation logic used by both
```

`packages/shared` exists because almost everything interesting in the
prototype was pure, storage-agnostic logic (BMR/TDEE/macro targets, BMI +
photo-offset blending, motivation-message templating, calendar auto-fill,
workout-schedule generation, shopping-list aggregation) sitting next to a
thin React UI. Porting that logic once and importing it from both the
backend (for validation/notifications) and the mobile app (for instant
client-side previews before a save round-trips) avoids re-implementing it
twice and drifting.

## What changed from the prototype, and why

The prototype was a single browser tab with no backend: every AI call went
straight from the client to `api.anthropic.com` with no key attached, all
data lived in a custom `window.storage` (effectively per-browser
localStorage), and "notifications" were a `setInterval` that only fired
while the tab was open.

| Prototype | Here |
|---|---|
| Client calls `api.anthropic.com` directly, no auth header | `apps/backend/src/services/anthropic.ts` — same 4 prompts, called server-side behind auth (`apps/backend/src/routes/ai.ts`). The key never reaches the client. |
| `window.storage` (per-browser) | Postgres via Prisma, scoped by `userId` (`apps/backend/prisma/schema.prisma`) |
| `setInterval(check, 30000)` + browser `Notification` API, tab must stay open | A once-a-minute cron server-side (`apps/backend/src/services/notifications.ts`) sends real push via Expo's push service to a registered device token |
| No auth (single implicit user) | Email/password + JWT (`apps/backend/src/routes/auth.ts`) — swap for OAuth/social login later without touching anything else, since every other route just trusts `request.userId` |
| No monetization | Free tier is ad-supported (`AdBanner` component, gated on `GET /entitlement`); Premium is a RevenueCat subscription whose webhook flips the same entitlement row (`apps/backend/src/routes/subscriptions.ts`) |

## Getting started

```bash
npm install
cp apps/backend/.env.example apps/backend/.env   # fill in ANTHROPIC_API_KEY, JWT_SECRET (USDA_FDC_API_KEY is optional — falls back to a shared demo key)
cp apps/mobile/.env.example apps/mobile/.env.local

docker compose up -d                              # local Postgres
npm run db:migrate                                # apply the Prisma schema
npm run dev:backend                                # http://localhost:4000

# in another terminal
npm run dev:mobile                                 # Expo dev server — scan the QR with Expo Go,
                                                     # or press i/a for a simulator
```

`packages/shared` is consumed as its **compiled** `dist/` output (not raw TS) —
`main`/`types` point there so a plain `node dist/server.js` production build
can actually resolve it (Node can't execute `.ts` directly; `tsx`/Metro/`tsc`
can, which is why this wasn't caught for a while). `npm install` always
rebuilds it via a root `prepare` script, but if you edit anything in
`packages/shared/src` while `dev:backend`/`dev:mobile` is already running,
re-run `npm run build:shared` for the change to show up.

## What's fully wired vs. scaffolded

**Fully wired end-to-end** (mobile screen → API route → Postgres, or → the
Anthropic proxy):
- Auth + onboarding
- Today tab: daily totals, coach message, today's workout + previous-result lookup
- Photo-based meal logging (camera/library → `/ai/analyze-food-photo` → review → save)
- Quick-add food picker (`FOOD_DATABASE`, ported verbatim from the prototype — all ~170 entries, plus a live debounced search against USDA FoodData Central — see below), free-text AI food lookup (`/ai/lookup-food`), and manual entry — all four ways to add a food without a photo, in the Log tab
- Meal plan builder (Trainer tab): diet-style chips, physique-based suggestion banner, today's scaled meal preview, 3/5/7-day shopping list with copy-to-clipboard — all 6 diet styles' recipes ported verbatim (`MEAL_LIBRARY`), plus newly authored extra rotation options (each style now has 4 breakfast/lunch/dinner options and 3 snacks, up from the prototype's 2/2/2/1) so a multi-day plan repeats less often
- Workout plan builder (Trainer tab): location/equipment/cardio pickers (labels ported verbatim), the real 8-sport list, physique auto-fill, 7-day schedule preview with exact prototype wording, "Add week to planner" (replaces the workout half of the calendar template)
- Technique-check video: record/pick a clip, extract frames natively (`expo-video-thumbnails` — see below), send to `/ai/analyze-technique-video`, render strengths/improvements/safety notes
- Month Calendar view + "fill from template" auto-fill, plus per-date add/delete events
- Week Template editor: day-of-week event list with add/delete, and eating/workout "apply to all 7 days" quick-add presets
- Clear-entire-calendar (tap-twice-to-confirm)
- BMI + photo-adjusted estimate, motivation-mode picker, push-notification registration, and the ads/entitlement gate

**Still scaffolded / not built:** nothing at the data-porting level anymore —
`FOOD_DATABASE`, all 6 `MEAL_LIBRARY` styles' original recipes,
`CATEGORY_RULES`, and the workout builder's location/equipment/cardio/sport
option lists are all ported verbatim from the original source file (re-read
directly, not re-derived). The two follow-up items from that pass — a real
nutrition-DB backing and richer recipe variety — are both now in too (see
below); what's left is ongoing content work (more recipes, deeper USDA
result handling for branded/packaged foods) rather than missing pieces.

### USDA FoodData Central integration

`GET /foods/search?q=...` (`apps/backend/src/routes/foods.ts` +
`services/usda.ts`) proxies USDA's free public nutrition database
(~400k foods) and caches results in Postgres (`UsdaFoodCache` /
`UsdaSearchCache`) so a repeat search never re-hits USDA's rate-limited API.
The mobile FoodPicker's "Quick add" tab now shows local `FOOD_DATABASE`
matches instantly, and — once you've typed 3+ characters, debounced by
400ms — a second "From USDA FoodData Central" section underneath. Both use
the same shape (`name`/`serving`/nutrients) so the picker's servings
stepper works identically either way. Get a free key at
https://fdc.nal.usda.gov/api-key-signup.html and set `USDA_FDC_API_KEY`;
without one it falls back to USDA's shared `DEMO_KEY`, which is heavily
rate-limited (30 req/hour, shared across everyone using it) — fine for
trying the scaffold, not for shipping. USDA's per-100g figures are used
directly rather than branded foods' per-serving `labelNutrients`, so a
branded/packaged result's serving size ("100g") is less intuitive than its
actual package label — worth special-casing before shipping if branded
foods matter for your users.

### How the technique-check video feature actually works here

The prototype extracted frames with an offscreen `<video>`/`<canvas>` pair,
which doesn't exist in React Native. `apps/mobile/src/services/videoFrames.ts`
gets the same result (a handful of evenly-spaced JPEG frames read as a
chronological sequence) using `expo-video-thumbnails` — a thin wrapper over
`AVAssetImageGenerator` (iOS) / `MediaMetadataRetriever` (Android) — to grab
a still at each timestamp, then reads each still as base64 via
`expo-file-system`. Same contract into the backend (`/ai/analyze-technique-video`),
different extraction mechanism.

## Publishing checklist

### Done (code-level)

- Fixed the backend's production build being unrunnable on any host: `node
  dist/server.js` (plain Node, no TS-aware loader) couldn't resolve
  `@nutrition-app/shared`, since its `package.json` pointed `main` at raw
  `.ts` source — fine for `tsx`/Metro/`tsc`, which transform TypeScript
  themselves, but Node can't execute `.ts` directly. Fixed by having
  `packages/shared` build to (and `main`/`types` point at) its compiled
  `dist/`, with explicit `.js` extensions added to its internal relative
  imports (required for Node ESM resolution). A root `prepare` script
  rebuilds it automatically on `npm install`. Verified against a real
  Postgres instance that the exact production build+start sequence works,
  and that `tsx` dev mode and the Metro web bundle are both unaffected.
- `render.yaml` (Render Blueprint) for deploying the backend — see
  "Still needed" below.
- Real app icon/splash/adaptive-icon/notification-icon art in
  `apps/mobile/assets/` (was literal 1×1 placeholder PNGs)
- App Tracking Transparency prompt + Google's UMP consent flow, run once at
  startup before the first ad request (`apps/mobile/src/services/adsConsent.ts`,
  called from `app/_layout.tsx`) — required by App Store review guideline
  5.1.2 since AdMob's personalized ads use the IDFA; shipping without this
  gets the app rejected, not just flagged later. `expo-tracking-transparency`
  is registered as a plugin in `app.json` with its `NSUserTrackingUsageDescription`.
- In-app account deletion (`DELETE /account` in `apps/backend/src/routes/auth.ts`,
  surfaced as "Delete account" on the Profile screen) — required by App
  Store review guideline 5.1.1(v) for any app with account creation; Prisma's
  cascading foreign keys mean deleting the `User` row removes everything.
  Doesn't cancel an active subscription — that's still Apple's/Google's to
  manage (Profile → Manage subscription, via RevenueCat's Customer Center,
  covers that).
- Privacy Policy + Terms of Service, served directly by the backend at
  `GET /privacy` / `GET /terms` (`apps/backend/src/routes/legal.ts`) so
  there's a working URL the moment the backend is deployed — both stores
  require one. **Update `CONTACT_EMAIL` and `PRODUCT_NAME` in `legal.ts`
  before submitting** — they're placeholders.
- `apps/mobile/eas.json` scaffolded (development/preview/production build
  profiles) for EAS Build/Submit.
- RevenueCat (`apps/mobile/src/services/subscriptions.ts`) wired
  end-to-end: `configurePurchases(userId)` runs once per session
  (`EntitlementContext`, keyed off the same `userId` the backend webhook
  matches on), `presentPaywall()` shows RevenueCat's dashboard-configured
  paywall (Lifetime/Yearly/Monthly packages — copy/pricing/layout all live
  in the RevenueCat dashboard, no app update needed to change them), and
  `presentCustomerCenter()` gives subscribed users self-serve manage/cancel/
  restore, all surfaced from the Profile tab's "Premium" section. The
  webhook at `apps/backend/src/routes/subscriptions.ts` stays the source of
  truth for entitlement state (`GET /entitlement`) — the SDK calls are for
  presenting purchase UI, not for gating ads/features client-side.
- AdMob's native App ID wired via the `react-native-google-mobile-ads`
  Expo config plugin (`apps/mobile/app.config.js`), separate from the ad
  unit ID.
- Both RevenueCat and AdMob (and `expo-tracking-transparency`) are
  Expo-Go-safe — they `require()` lazily and no-op when running in Expo Go
  or on web (`isExpoGo` check via `expo-constants`), so the rest of the app
  stays testable via a plain QR scan; exercising purchases/ads/ATT for real
  needs an EAS development build.
- `/ai/*` routes are rate-limited per user (`@fastify/rate-limit`, 20
  requests/minute — see `apps/backend/src/routes/ai.ts`), since each call
  is a paid Anthropic request unlike the rest of the API.
- `apps/backend/src/services/notifications.ts`'s de-dupe is backed by the
  `SentNotification` table (unique on event+flag+date) instead of an
  in-memory Set, so it's safe across multiple backend instances.

### Still needed — things only you can do

1. **Deploy the backend.** `render.yaml` at the repo root is a Render
   Blueprint — in the Render dashboard: New → Blueprint → pick this repo →
   it provisions a free Postgres database and a web service from it
   automatically. After `JWT_SECRET` is auto-generated and `DATABASE_URL`
   is wired to the database, you still need to set
   `ANTHROPIC_API_KEY` (required) and, once you have them,
   `REVENUECAT_WEBHOOK_SECRET`/`USDA_FDC_API_KEY`/`EXPO_ACCESS_TOKEN`, in
   the service's **Environment** tab (left blank for now, marked
   `sync: false` in the blueprint so Render prompts for them rather than
   silently deploying without them). Both services default to Render's
   **free** plan — no cost, but the free web service spins down on idle
   (cold start on the next request after ~15 min) and the free database
   expires after a while; bump both to a paid plan in `render.yaml` once
   this is live for real users. Verified locally end-to-end before writing
   this: the exact `buildCommand`/`startCommand` Render will run (fresh
   `npm install`, build, `prisma migrate deploy`, `node dist/server.js`)
   against a clean Postgres database, including the full
   register/login/delete-account flow.

   Once deployed, update `eas.json`'s `EXPO_PUBLIC_API_URL` placeholders
   and `legal.ts`'s contact email with the real values.
2. **Apple Developer Program** ($99/yr) and **Google Play Developer
   account** ($25 one-time), if you don't have them already.
3. **RevenueCat dashboard:** Lifetime/Yearly/Monthly products + a
   "Healthapp Pro" entitlement + an offering/paywall, mirrored as real
   in-app-purchase products in App Store Connect / Play Console. Then set
   `EXPO_PUBLIC_REVENUECAT_IOS_KEY` / `_ANDROID_KEY` / `_ENTITLEMENT_ID` in
   `apps/mobile/.env.local`, point the RevenueCat webhook at
   `POST /webhooks/revenuecat`, and set `REVENUECAT_WEBHOOK_SECRET` on the
   deployed backend.
4. **AdMob account + app registration** → real App IDs and ad unit IDs, set
   as `ADMOB_IOS_APP_ID` / `ADMOB_ANDROID_APP_ID` (native, build-time — read
   by `app.config.js`, not `EXPO_PUBLIC_*`) and
   `EXPO_PUBLIC_ADMOB_BANNER_UNIT_ID`. All three currently fall back to
   Google's test IDs.
5. **`eas login` + `eas init`** (requires your own Expo account) to get a
   real `extra.eas.projectId` written into `app.json` — can't be faked or
   generated without an authenticated account.
6. **Store listings:** screenshots (several device sizes each store wants),
   description, keywords, content rating questionnaire, and each store's
   data-safety / privacy-nutrition-label form (what you collect, mirroring
   `/privacy`).
7. Move meal/build-photo thumbnails out of inline base64 (stored as text in
   Postgres today) and into object storage (S3/R2/Cloudinary) — not a
   launch blocker, but worth doing once photo volume matters.
