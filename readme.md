# Trawler Captain

A sandbox cruising simulator for the Pacific Northwest Inside Passage. You're a private trawler captain — pick a port, pick the weather, go. Real coastlines, real mountains, real place names, from Seattle to Juneau.

Built for iPad. Browser-based. Low-poly, stylized, intentionally calm.

---

## What It Is

- **Sandbox mode only** — no grading, no guests, no career
- **21 playable ports** from Seattle to Juneau, ~900 nautical miles of Inside Passage
- **Real terrain and shorelines** pulled from USGS and Canadian elevation data
- **Arcade handling** with displacement-boat feel (~8 knot cruise, slow turns, drift from tides and wind)
- **Simplified weather** — clear, overcast, or stormy
- **Time compression** — cruise at 1x, 5x, 15x, or 30x, with auto-slowdown near ports
- **If you run aground, the game ends.** Pay attention to your chart.

## What It Isn't

No guests to please. No engine upgrades to buy. No AI traffic dodging. No radio chatter. No docking minigames. No fuel runs. This is a screensaver you can drive, with enough consequence to keep you honest.

See the [PRD](./PRD-v5.md) for full scope and explicit cuts.

---

## Project Structure

```
trawler-captain/
├── PRD-v5.md            # Product Requirements Document (source of truth)
├── CLAUDE.md            # Conventions & working guide for Claude Code
├── README.md            # This file
├── public/assets/       # 3D models, textures
│   └── models/
│       ├── trawler.glb
│       ├── shared/      # Reusable dock, forest blob modules
│       └── ports/       # Per-port GLB + collision JSON pairs
├── src/
│   ├── scenes/          # Main menu, voyage setup, voyage, game over
│   ├── world/           # Ocean, sky, port loader, weather
│   ├── boat/            # Trawler model, physics, controls
│   ├── nav/             # Chartplotter, tides, routing
│   ├── ui/              # HUD, throttle, wheel, gauges
│   ├── systems/         # Time compression, grounding
│   ├── state/           # Zustand store
│   └── data/            # Ports, tide stations
└── package.json
```

---

## Getting Started

```bash
# Install dependencies (React 19 + R3F 9)
npm install
# If you see peer dependency errors, use:
npm install --legacy-peer-deps

# Start the dev server
npm run dev

# Open on your iPad by visiting your dev machine's local IP
# e.g. http://192.168.1.42:5173
```

For TypeScript build verification:
```bash
npm run build
```

---

## Playing on iPad

This is the primary target platform.

### Local install (dev server)

```bash
npm run dev -- --host
```

Vite will print a `Network:` URL (e.g. `http://192.168.50.45:5173`).

1. Make sure your iPad is on the same Wi-Fi network as your dev machine
2. Open Safari on the iPad, navigate to the `Network:` URL
3. Tap the Share icon → **Add to Home Screen** → Add

The app now launches full-screen from the home-screen icon (no Safari chrome). `index.html` sets `apple-mobile-web-app-capable`, a black-translucent status bar, and `viewport-fit=cover` so the HUD respects the rounded-corner safe areas.

To customize the home-screen icon, drop a 180×180 PNG at `public/apple-touch-icon.png` and add `<link rel="apple-touch-icon" href="/apple-touch-icon.png" />` inside `<head>`. Without it, iOS generates one from a screenshot.

Controls are touch-first: throttle (bottom-left slider), wheel (bottom-right disc), camera toggle (top-left), pause (top-right), time compression (top-center), and gauge strip (bottom-center).

---

## Tech Stack

- **React 19** + **TypeScript** + **Vite 6**
- **Three.js** via **React Three Fiber 9** and **Drei 10**
- **MapLibre GL JS 5** for the chartplotter
- **Zustand 5** for state
- **Turf.js 7** for geographic math

Locked dependency versions in `package.json` — do not upgrade without checking compatibility (R3F 9 requires React 19).

---

## Development

This project is built in two parallel workstreams:

### Workstream 1: Game Code (Claude Code)
23 session-sized sub-tasks across 6 sprints. Each sub-task is a self-contained unit that produces a runnable, testable deliverable. See PRD §12 for the full sprint plan.

Roughly 2–3 weeks of focused effort.

### Workstream 2: Port Modeling (Blender)
Each of the 21 ports is hand-built in Blender using the BlenderGIS addon. Real USGS/NRCan elevation, OSM building footprints (auto-extruded), reused dock and forest modules.

Each port produces two files:
- `{port}.glb` — the visual 3D scene
- `{port}.collision.json` — simplified collision outline + depth grid

Roughly 1.5–2.5 hours per port after the first, 40–55 hours total. See PRD §14 for the workflow.

### Launch Stages

| Stage | Ports Complete | Notes |
|---|---|---|
| Soft launch | 3 (Seattle, Friday Harbor, Juneau) | Playable, full game loop works |
| v1.0 | 8 (adds Port Townsend, Roche Harbor, Nanaimo, Campbell River, Ketchikan) | Mid-Inside-Passage routes open up |
| v1.1 | 21 (all ports) | Full Inside Passage available |

The game is playable at every stage. More ports just means more route options.

---

## The 21 Ports

**Puget Sound:** Seattle, Bainbridge Island, Kingston, Port Townsend, Anacortes

**San Juan Islands:** Friday Harbor, Roche Harbor, Deer Harbor

**Gulf Islands / Strait of Georgia:** Sidney, Nanaimo, Pender Harbour, Campbell River

**Desolation Sound / Johnstone Strait:** Refuge Cove, Port McNeill

**Central Inside Passage (BC):** Shearwater, Prince Rupert

**Southeast Alaska:** Ketchikan, Wrangell, Petersburg, Sitka, Juneau

---

## Debug Shortcuts

Useful during development:

| Shortcut | Effect |
|---|---|
| `F3` | Toggle collision overlay (red lines over 3D scene) |
| `?debug=collision` URL param | Same as F3, persistent |
| `?debug=physics` URL param | Show boat velocity/heading vectors |
| `?port=seattle` URL param | Jump directly to a port for testing |

---

## License

Personal project. Not distributed.

---

## Credits

- Coastline and elevation data: USGS 3DEP, NRCan CDEM, SRTM
- Building footprints: OpenStreetMap contributors
- Nautical chart tiles: OpenSeaMap
- Water shader: adapted from the Three.js `Water` official example
- Built with React Three Fiber, MapLibre GL JS, and Blender
