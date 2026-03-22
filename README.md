# Racer

Mobile-first web app for a car community: live radar-style map, driver profiles, sprint challenges, and a synchronized race countdown with an in-race HUD. Built as a [Next.js](https://nextjs.org/) (App Router) + TypeScript + Tailwind CSS prototype, with TypeScript types aligned to a Palantir Foundry–style ontology.

## Repository

| | |
|---|---|
| **GitHub** | [github.com/krishp0130/Racer](https://github.com/krishp0130/Racer) |
| **Clone** | `git clone https://github.com/krishp0130/Racer.git` |

## Documentation

| File | Purpose |
|------|---------|
| [README.md](README.md) | Overview, setup, architecture, radar flow, ontology notes |
| [LICENSE](LICENSE) | MIT license |
| [AGENTS.md](AGENTS.md) | Notes for AI agents working on this Next.js codebase |
| [scripts/publish-github.sh](scripts/publish-github.sh) | Optional helper to create/push a new remote with `gh` |

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
git clone https://github.com/krishp0130/Racer.git
cd Racer
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

## Git remotes and new repos

This project’s **canonical remote** is [github.com/krishp0130/Racer](https://github.com/krishp0130/Racer). Clone and pull from there.

To publish a **fork or new copy** under another account, use the [GitHub CLI](https://cli.github.com/) (`brew install gh`):

```bash
gh auth login
./scripts/publish-github.sh your-repo-name
```

In automation (or when `gh` has no TTY), set `GH_TOKEN` to a [personal access token](https://github.com/settings/tokens) with the `repo` scope. On macOS, credentials stored for `github.com` in the Keychain (e.g. via Git) are often usable as `GH_TOKEN` when passed explicitly.

## License

MIT — see [LICENSE](LICENSE).
