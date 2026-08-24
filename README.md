# Someday Board

A scrapbook wall for the things you keep putting off. Pin things up, pull one off the board each week/month, and turn it into a photo memory once it's done.

Everything is client-side — vanilla HTML/CSS/JS with no build step and no backend. Your data lives only in your browser's local storage on whichever device you use it from; nothing is sent to a server, there's no account, and no one else can see your board.

**There's also a native mobile rewrite in [`mobile/`](mobile/)** — an Expo/React Native app backed by Supabase, built for testing on a real iPhone via Expo Go without needing a Mac. It's a separate, from-scratch implementation; this web version is left untouched. See [`mobile/README.md`](mobile/README.md) for setup.

## Project structure

```
someday-board/
├── index.html            # markup
├── manifest.json         # PWA install metadata (name, icons, colors)
├── service-worker.js     # offline caching of the app shell
├── package.json          # local dev server only — no build step
├── css/
│   └── styles.css
├── js/
│   ├── app.js             # entry point — wires everything together
│   ├── constants.js       # colors, ratings, track config
│   ├── storage.js         # localStorage-backed persistence
│   ├── state.js           # app state + load/save
│   ├── audio.js           # procedural sound effects & haptics
│   ├── utils.js           # small shared DOM helpers
│   ├── board.js           # the wall: rendering, drag-to-move, the pick animation
│   ├── list.js             # the List screen
│   ├── memories.js         # the Memories screen + memory-logging modal
│   ├── nav.js               # tab switching, header subtitle
│   └── sw-register.js       # registers the service worker
├── images/
│   └── cork-bg.jpg        # the corkboard background photo
└── icons/                 # app icons (192, 512, maskable, apple-touch)
```

Each JS file is an ES module with explicit `import`/`export` — open any file and you can see exactly what it depends on at the top.

## Run it locally

```bash
npm install
npm run dev
```

Then open the printed `http://localhost:5173` URL. (A plain static server is enough — `npx serve .` works too without installing anything, if you'd rather skip `npm install`.)

Note: because the JS uses ES modules, opening `index.html` directly as a `file://` path won't work — browsers block module imports from the local filesystem for security reasons. You need it served over `http://` or `https://`, which is exactly what `npm run dev` gives you locally.

## Deploy it (so you can install it on your phone)

This is a static site, so any static host works. **GitHub Pages** is the natural fit since the code already lives on GitHub:

1. Push this repo to GitHub (see below if you haven't yet)
2. Repo → **Settings** → **Pages**
3. Under "Build and deployment," set **Source** to "Deploy from a branch," branch `main`, folder `/ (root)`
4. Save — your site will be live at `https://yourusername.github.io/reponame` in a minute or two

Then open that link **on your phone**:
- **iPhone (Safari):** Share icon → "Add to Home Screen"
- **Android (Chrome):** ⋮ menu → "Add to Home Screen" / "Install app"

It'll show up as a real app icon and open full-screen, and keeps working offline once you've opened it at least once.

## Pushing this to GitHub for the first time

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

(Create the empty repo on GitHub first at github.com/new, without a README/license/gitignore, then run the commands above.)

## A few honest limitations

- **No sync between devices.** The version on your phone is the only copy — installing this on a second device starts a separate, empty board.
- **Storage has a ceiling.** Browsers cap local storage at a few MB per site. Photos are compressed automatically when added, but the app will warn you with a toast if it ever fills up.
- **Back up what matters.** If you clear your browser's site data or reinstall the browser, your board is gone. Screenshot the memories you'd actually be sad to lose.

If you ever want real cross-device sync or cloud backup, that's a legitimate next step (a small backend + accounts), just a bigger one than this — worth a separate conversation whenever you're ready for it.
