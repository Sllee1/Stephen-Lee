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
cp apps/backend/.env.example apps/backend/.env   # fill in ANTHROPIC_API_KEY, JWT_SECRET
cp apps/mobile/.env.example apps/mobile/.env.local

docker compose up -d                              # local Postgres
npm run db:migrate                                # apply the Prisma schema
npm run dev:backend                                # http://localhost:4000

# in another terminal
npm run dev:mobile                                 # Expo dev server — scan the QR with Expo Go,
                                                     # or press i/a for a simulator
```

## What's fully wired vs. scaffolded

**Fully wired end-to-end** (mobile screen → API route → Postgres, or → the
Anthropic proxy):
- Auth + onboarding
- Today tab: daily totals, coach message, today's workout + previous-result lookup
- Photo-based meal logging (camera/library → `/ai/analyze-food-photo` → review → save)
- Quick-add food picker (`FOOD_DATABASE`), free-text AI food lookup (`/ai/lookup-food`), and manual entry — all three ways to add a food without a photo, in the Log tab
- Meal plan builder (Trainer tab): diet-style chips, physique-based suggestion banner, today's scaled meal preview, 3/5/7-day shopping list with copy-to-clipboard
- Workout plan builder (Trainer tab): location/equipment/cardio pickers, physique auto-fill, 7-day schedule preview, "Add week to planner" (replaces the workout half of the calendar template)
- Technique-check video: record/pick a clip, extract frames natively (`expo-video-thumbnails` — see below), send to `/ai/analyze-technique-video`, render strengths/improvements/safety notes
- Month Calendar view + "fill from template" auto-fill, plus per-date add/delete events
- Week Template editor: day-of-week event list with add/delete, and eating/workout "apply to all 7 days" quick-add presets
- Clear-entire-calendar (tap-twice-to-confirm)
- BMI + photo-adjusted estimate, motivation-mode picker, push-notification registration, and the ads/entitlement gate

**Still scaffolded / not built:**
- 5 of 6 meal-plan styles in `packages/shared/src/constants/mealLibrary.ts`
  (only `balanced` is populated) and the full ~230-row `FOOD_DATABASE` (a
  small seed is there — `lookupFoodByName` already covers anything missing
  in the meantime). This is data entry, not architecture.
- The workout-plan builder's sport list (`WorkoutPlanBuilder.tsx`) is an
  inferred stand-in — the prototype's exact 8-sport list wasn't captured
  during extraction, so swap in the real one if you have it.

### How the technique-check video feature actually works here

The prototype extracted frames with an offscreen `<video>`/`<canvas>` pair,
which doesn't exist in React Native. `apps/mobile/src/services/videoFrames.ts`
gets the same result (a handful of evenly-spaced JPEG frames read as a
chronological sequence) using `expo-video-thumbnails` — a thin wrapper over
`AVAssetImageGenerator` (iOS) / `MediaMetadataRetriever` (Android) — to grab
a still at each timestamp, then reads each still as base64 via
`expo-file-system`. Same contract into the backend (`/ai/analyze-technique-video`),
different extraction mechanism.

## Before shipping

- Replace the placeholder assets in `apps/mobile/assets/` (real icon/splash)
- Configure RevenueCat products/entitlement identifiers and AdMob ad units,
  then set the corresponding `EXPO_PUBLIC_*` env vars
- Add rate limiting to `/ai/*` routes — each call is a paid Anthropic
  request, unlike the rest of the API
- Move meal/build-photo thumbnails out of inline base64 (stored as text in
  Postgres today) and into object storage (S3/R2/Cloudinary) once photo
  volume matters
- `apps/backend/src/services/notifications.ts`'s de-dupe is in-memory —
  fine for one instance, move to a DB table or Redis set before scaling
  the backend horizontally
