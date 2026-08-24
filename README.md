# Someday Board

A scrapbook wall for the things you keep putting off. Pin things up, pull one off the board each week/month, and turn it into a photo memory once it's done.

A native Expo/React Native app backed by Supabase, built for testing on a real iPhone via Expo Go without needing a Mac. Everything lives in [`mobile/`](mobile/).

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

**4. Show the sign-in code in the email.** In the Supabase dashboard, go to Authentication → Email Templates → Magic Link, and add `{{ .Token }}` somewhere in the email body — that's the 6-digit code the app's sign-in screen asks you to type in.

(An earlier version of this app used a clickable magic-link deep link instead. That turned out to be a dead end specifically under Expo Go: cold-launching the app via a deep link drops the URL's path/query entirely — a real Expo Go limitation, not something fixable in app code — so a typed-in code is used instead. No redirect URL configuration is needed at all with this approach.)

**5. Install dependencies and start the dev server.**

```bash
cd mobile
npm install
npx expo start
```

Scan the QR code with your iPhone's camera (opens in Expo Go — install it from the App Store first). No Mac or Xcode needed for this.

## How auth works here

Sign-in is passwordless: enter your email, Supabase sends a 6-digit code, you type it into the app. No deep link, no redirect URL, no app-switching — this was chosen specifically to avoid Expo Go's cold-start deep-linking limitation (see `mobile/src/lib/auth.ts`). Sessions persist across restarts via `AsyncStorage` and refresh automatically while the app is foregrounded (see `mobile/src/lib/supabase.ts`).

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
- There's currently no distributable build — the app runs via Expo Go during development. Getting a real home-screen icon (via TestFlight) requires a paid Apple Developer account; ask if you want to set that up later.
- **This project is intentionally pinned to Expo SDK 54, not latest.** SDK 57's Expo Go build was stuck in Apple App Store review with no ETA, so the project was downgraded to SDK 54 (what the public Expo Go app actually runs) to keep testing on a real iPhone without a paid Apple Developer account. Before upgrading, check whether Expo Go's App Store build has caught up.
