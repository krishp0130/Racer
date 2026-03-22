# Racer

Mobile-first web app for a car community: live radar-style map, driver profiles, sprint challenges, and a synchronized race countdown with an in-race HUD. Built as a [Next.js](https://nextjs.org/) (App Router) + TypeScript + Tailwind CSS prototype, with TypeScript types aligned to a Palantir Foundry–style ontology.

## Features

- **Dark, racing-inspired shell** with bottom navigation: Radar (map), Garages (profile), Leaderboard.
- **Interactive map** ([MapLibre](https://maplibre.org/) via [react-map-gl](https://visgl.github.io/react-map-gl/)) using the public demo style (no API key).
- **Sprint challenge flow**: tap an opponent marker → bottom sheet with vehicle stats → place a finish line on the map → simulated accept → full-screen **3-2-1-GO** → **active** HUD (speed + distance to finish).
- **Foundry-oriented types** for `Driver`, `Vehicle`, `LiveTelemetry`, and `Race` in `src/types/ontology.ts`.

## Tech stack

| Area        | Choice                                      |
|------------|----------------------------------------------|
| Framework  | Next.js 16 (App Router)                      |
| UI         | React 19, Tailwind CSS 4                     |
| Map        | `maplibre-gl`, `react-map-gl` / `@vis.gl/react-maplibre` |
| Fonts      | Outfit, JetBrains Mono (`next/font/google`)  |

## Requirements

- **Node.js** 20+ (see [Next.js system requirements](https://nextjs.org/docs/app/getting-started/installation))
- **npm** (ships with Node)

## Getting started

```bash
git clone <your-repo-url> racer
cd racer
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The home route redirects to `/radar`.

### Scripts

| Command       | Description              |
|---------------|--------------------------|
| `npm run dev` | Dev server (Turbopack)   |
| `npm run build` | Production build      |
| `npm run start` | Run production server |
| `npm run lint`  | ESLint                |

## Project structure

```
src/
  app/
    (app)/                 # Tabbed app routes (wrapped in AppShell)
      layout.tsx
      radar/               # Map + race flow (client map loaded dynamically)
      garages/
      leaderboard/
    layout.tsx             # Root layout, fonts, metadata
    page.tsx               # Redirects to /radar
    globals.css            # Theme tokens + animation keyframes
  components/
    AppShell.tsx           # Layout + bottom nav spacing
    BottomNav.tsx          # Primary navigation (client)
  lib/
    geo.ts                 # Haversine distance + interpolate toward finish
  types/
    ontology.ts            # Ontology-shaped TypeScript interfaces
```

## Radar and race flow

1. **Browsing** — Opponent marker (VS) is tappable; map is pannable.
2. **Opponent sheet** — Shows mock opponent username and `Vehicle` (make, model, year, HP). **Challenge to sprint** closes the sheet.
3. **Placing finish** — Banner instructs: tap the map to set the finish; cursor becomes a crosshair.
4. **Finish marker** — Checkered flag marker at the chosen coordinates.
5. **Awaiting accept** — After **2 seconds**, a short toast simulates the opponent accepting; then the countdown phase starts.
6. **Countdown** — Full-screen overlay: **3 → 2 → 1 → GO** (CSS keyframes in `globals.css`).
7. **Active** — Top HUD shows simulated **mph** and **distance to finish** while the user marker moves toward the finish (until within ~10 m).

Map loading is **client-only** (`ssr: false`) so `maplibre-gl` never runs on the server (`RadarClientEntry.tsx`).

## Ontology types (Foundry-oriented)

Types in `src/types/ontology.ts` mirror objects you might define in Foundry:

- **`Driver`** — `id`, `username`, `vehicleId`, `eloRating`
- **`Vehicle`** — `id`, `make`, `model`, `year`, `horsepower`, `class`
- **`LiveTelemetry`** — `driverId`, position, `speed`, `heading`, `timestamp`
- **`Race`** — `status` (`pending` | `countdown` | `active` | `finished`), `participants`, `startCoords` / `finishCoords`, `winnerId`

Pipelines, Actions, and AIP can later own authoritative race state, telemetry ingestion, and natural-language ops on these objects.

## Publishing to GitHub

Use the [GitHub CLI](https://cli.github.com/) (`brew install gh`).

**Interactive (recommended):** log in once, then run the helper script:

```bash
gh auth login
```

**Automation / sandboxed terminals:** set a [personal access token](https://github.com/settings/tokens) with the `repo` scope, then:

```bash
export GH_TOKEN=ghp_your_token_here
./scripts/publish-github.sh
```

From the repo root, create a **public** repo under your account, add `origin`, and push `main`:

```bash
./scripts/publish-github.sh
```

Optional: pass a repo name (default is `racer`):

```bash
./scripts/publish-github.sh my-racer-app
```

If you prefer the browser: create an empty repo on GitHub, then:

```bash
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
```

## License

MIT — see [LICENSE](LICENSE).
