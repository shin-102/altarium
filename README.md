# Altarium

A calm, distraction-free focus environment for the browser. Altarium combines a Pomodoro timer, ambient soundscapes, and beautiful wallpapers into a single immersive workspace — designed to help you get into flow and stay there.

---

## Features

- **Pomodoro timer** — a circular ring UI that tracks work and break intervals
- **Ambient audio panel** — layered soundscapes to mask distractions and set the mood
- **Distraction panel** — utilities to keep you on track between sessions
- **Wallpaper picker** — curated full-screen backgrounds that shift the atmosphere of your session
- **Clock** — always-visible time display that doesn't interrupt focus
- **Auto-hide UI** — panels fade out when idle so the wallpaper takes center stage
- **First-visit intro** — a cinematic name reveal on the first load, never shown again after

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 18 + TypeScript |
| Build tool | Vite |
| Styling | CSS (index.css, component-scoped classes) |
| Package manager | pnpm |
| Linting | ESLint (flat config) |

---

## Project Structure

```
src/
├── App.tsx                  # Root component, layout, and state wiring
├── main.tsx                 # React entry point
├── index.css                # Global styles and design tokens
│
├── components/
│   ├── IntroScreen.tsx      # First-visit cinematic intro
│   ├── AmbientPanel.tsx     # Ambient audio controls
│   ├── Clock.tsx            # Current time display
│   ├── DistractionPanel.tsx # Focus utilities
│   ├── PomodoroRing.tsx     # Circular Pomodoro timer
│   ├── WallpaperLayer.tsx   # Full-screen background renderer
│   └── WallpaperPicker.tsx  # Wallpaper selection UI
│
├── hooks/
│   └── useAutoHide.ts       # Hook for fading UI on mouse idle
│
├── lib/
│   ├── ambient-audio.ts     # Audio engine and track definitions
│   ├── utils.ts             # Shared utility functions
│   ├── wallpapers.ts        # Wallpaper metadata and imports
│   └── youtube.ts           # YouTube embed helpers for ambient audio
│
└── assets/                  # Wallpaper images (webp)
```

---

## Getting Started

**Prerequisites:** Node.js ≥ 18, pnpm

```bash
# Install dependencies
pnpm install

# Start the dev server
pnpm dev

# Build for production
pnpm build

# Preview the production build
pnpm preview
```

---

## The Intro Screen

On their very first visit, users see a full-screen cinematic reveal of the Altarium name. It plays once and is never shown again (stored in `localStorage`).

**To replay the intro during development**, run in the browser console:

```js
localStorage.removeItem("altarium_intro_seen"); location.reload();
```

The intro dismisses on any click or keypress (`Enter`, `Space`, `Escape`).

---

## Adding Wallpapers

1. Drop a `.webp` image into `src/assets/`
2. Add an entry to `src/lib/wallpapers.ts` following the existing format (import + metadata object)

---

## Adding Ambient Tracks

Ambient audio is managed in `src/lib/ambient-audio.ts`. Tracks can be local files or YouTube embeds (handled via `youtube.ts`). Add a new entry following the existing pattern.

---

## Logo

The current logo is a placeholder geometric mark (nested triangles). To replace it:

- Edit the `<svg>` block inside `src/components/IntroScreen.tsx`
- Use the same `viewBox="0 0 64 64"` coordinate space, or adjust as needed
- The mark is also a candidate for `public/favicon.svg` once finalized

---

## License

MIT
