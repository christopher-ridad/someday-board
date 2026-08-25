# Someday Board

A scrapbook wall for the things you keep putting off. Pin things up, pull one off the board each week/month, and turn it into a photo memory once it's done.

A native Expo/React Native app backed by Supabase. Built from Windows with no Mac — day-to-day development uses Expo Go for fast iteration, and real builds are distributed via TestFlight using EAS Build (which compiles the signed binary in Expo's cloud, no Mac required for that either). Everything lives in [`mobile/`](mobile/).

(An earlier version of this project was a vanilla HTML/CSS/JS PWA with no backend. It's been fully replaced by the app described below; its history is still in git if you ever want to look back at it.)

## One-time setup

**1. Create the Supabase project.** At [supabase.com](https://supabase.com), create a new project.

**2. Run the schema.** In the Supabase dashboard's SQL Editor, run everything in [`mobile/supabase/schema.sql`](mobile/supabase/schema.sql) — it creates the `items`/`memories` tables, enables row-level security scoped to `auth.uid()`, and creates the private `memory-photos` storage bucket with matching policies.

**3. Add your Supabase credentials.**

```bash
cd mobile
cp .env.example .env
```

Fill in `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` from your project's Settings → API page.

**4. Turn on Sign in with Apple.** Two places:
   - **Apple Developer portal** → Certificates, Identifiers & Profiles → Identifiers → your app's App ID → enable the "Sign In with Apple" capability.
   - **Supabase dashboard** → Authentication → Providers → Apple → enable it, and register your app's bundle identifier (e.g. `com.yourname.somedayboard`) as an authorized client ID. This is the *native* flow (no Services ID or redirect URL needed) — the app gets a signed identity token straight from Apple's SDK and hands it to Supabase.

**5. Install dependencies and start the dev server.**

```bash
cd mobile
npm install
npx expo start
```

Scan the QR code with your iPhone's camera (opens in Expo Go — install it from the App Store first). No Mac or Xcode needed for this.

## How auth works here

Sign in with Apple, using Apple's native sign-in flow (`expo-apple-authentication`) rather than a web/OAuth redirect — one tap, Face ID, no email or code to type (see `mobile/src/lib/auth.ts`). This only works in a real build (Expo Go can't hold the Apple Sign In entitlement), which is part of why this project moved off Expo Go and onto TestFlight — see below. Sessions persist across restarts via `AsyncStorage` and refresh automatically while the app is foregrounded (see `mobile/src/lib/supabase.ts`).

An earlier version used a typed-in 6-digit email code instead, specifically to route around Expo Go's cold-start deep-linking limitation (a plain clickable magic link didn't survive a cold app launch there). That's moot now that the app runs as a real build instead of through Expo Go.

## Project layout

- `mobile/src/app/` — Expo Router screens: `(auth)/index.tsx` (sign-in), `(tabs)/index.tsx` (Board), `(tabs)/list.tsx`, `(tabs)/memories.tsx`.
- `mobile/src/components/board/` — the corkboard: drag-to-reposition, the "pull one off the board" animation, the challenge ticket.
- `mobile/src/components/memories/` — the memory-logging modal, the memories grid card, and the detail view.
- `mobile/src/lib/` — Supabase client, auth helpers, and photo upload/signed-URL helpers.
- `mobile/src/store/` — Zustand stores for auth session and board state.
- `mobile/supabase/schema.sql` — the database schema to run once per project.

## Notes

- This is built for personal, single-user use — RLS scopes every row to your own `auth.uid()`, but there's no multi-tenant UI beyond that.
- Photos are resized/compressed client-side (max 640px, JPEG ~0.6 quality) before upload.
- Distributable builds go through EAS Build/Submit (`mobile/eas.json`) → TestFlight, which is how the app gets tested with a real home-screen icon instead of through Expo Go. Build with `eas build --platform ios --profile production`, then `eas submit --platform ios --profile production --latest`. This requires a paid Apple Developer account. Any change to native config (`app.json` plugins/entitlements, e.g. Sign in with Apple) needs a fresh build — a JS-only change doesn't.
- **This project is intentionally pinned to Expo SDK 54, not latest.** SDK 57's Expo Go build was stuck in Apple App Store review with no ETA, so the project was downgraded to SDK 54 (what the public Expo Go app actually runs) to keep testing on a real iPhone without a paid Apple Developer account. Before upgrading, check whether Expo Go's App Store build has caught up.
