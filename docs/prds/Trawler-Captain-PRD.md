# Product Requirements Document: **Trawler Captain** (MVP)

**Working title:** Trawler Captain
**Owner:** Matt Krieger
**Last updated:** April 17, 2026
**Status:** Draft v5 — final for Claude Code kickoff
**Target build tool:** Claude Code
**Side workstream:** Blender / BlenderGIS (port modeling, owner-driven)

---

## 1. Vision & Elevator Pitch

You're a private trawler captain cruising the Inside Passage from Seattle to Juneau. Pick a port, pick the weather, go. Real coastlines, real mountains, real place names — modeled from actual USGS/NRCan elevation data and OpenStreetMap footprints. No grading, no guests, no career — just cruising. But: **if you run aground, the game ends.** Pay attention to your chart.

**Tone reference:** Dredge's PNW moodiness, Sail Forth's clean low-poly aesthetic, and the focused calm of someone actually piloting a boat.

---

## 2. Scope

### 2.1 In scope for MVP

- **Region:** Inside Passage, Seattle to Juneau (~900 nm)
- **Mode:** Sandbox — any two ports, any weather
- **Boat:** One trawler (free Sketchfab pilothouse trawler at MVP; custom NP 590 model post-MVP)
- **Ports:** 21 playable ports (see §6), "simplified realistic" — accurate terrain & shorelines, abstracted buildings
- **Geography:** Pre-built Blender port scenes with dual-asset export (visual GLB + collision JSON)
- **Chart:** MapLibre GL JS with nautical styling
- **Tides:** Simplified sinusoidal model (3 reference stations)
- **Handling:** Arcade — responsive but weighty
- **Time compression:** 1x / 5x / 15x / 30x, with auto-slowdown near ports and hazards
- **Weather:** Clear / overcast / stormy (picked at start, static)
- **Grounding:** Two-zone system — warning (visual alert) + fatal (game over)
- **Controls:** Touch-first (iPad), keyboard fallback
- **Daytime only**

### 2.2 Explicitly cut

- ❌ Grading / report card / guest satisfaction
- ❌ Charter mode
- ❌ Fuel planning, radar
- ❌ Dynamic mid-voyage weather
- ❌ 3D cockpit interior (HUD overlay only)
- ❌ AI traffic (ferries, fishing boats)
- ❌ Audio (v1.1 polish pass)
- ❌ PWA optimization (v1.1)
- ❌ Log book / end-of-voyage summary

### 2.3 Post-MVP roadmap

Remaining port GLBs, custom NP 590 model, audio, PWA/offline, day-night cycle, Caribbean region, charter mode with grading, AI traffic, save/resume mid-voyage, NPC guests, anchoring, docking.

---

## 3. Target User & Platform

**Primary user:** Matt Krieger, solo play on iPad.

**Distribution:** Sideload via Safari "Add to Home Screen" for MVP.

**Performance targets:**
- **iPad Air (M-series): 60 fps — primary target**
- Desktop Chrome/Safari/Firefox: 60 fps at 1080p on integrated GPUs
- No guarantee for pre-M iPads

**Performance budgets derived from iPad Air target:**
- Port GLB polygon count: **≤ 50k triangles each**
- Maximum 2 port GLBs loaded simultaneously
- Water shader: Three.js standard `Water` (no expensive FFT/WebGPU ocean)
- Post-processing: minimal (color grading only, no bloom or SSAO)
- Texture sizes: 1024×1024 max per texture, 512×512 preferred

---

## 4. Tech Stack — Locked Dependencies

**Claude Code runs this `npm install` exactly.** All versions pinned to current-stable as of this PRD date.

```json
{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "three": "^0.169.0",
    "@react-three/fiber": "^9.5.0",
    "@react-three/drei": "^10.7.7",
    "zustand": "^5.0.2",
    "maplibre-gl": "^5.23.0",
    "@turf/turf": "^7.1.0"
  },
  "devDependencies": {
    "vite": "^6.0.0",
    "@vitejs/plugin-react": "^4.3.4",
    "typescript": "^5.6.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0"
  }
}
```

**Key reference URLs** (Claude Code can fetch these if clarification needed):

- React Three Fiber docs: https://r3f.docs.pmnd.rs
- Drei helpers: https://github.com/pmndrs/drei
- Three.js Water example: https://github.com/mrdoob/three.js/blob/dev/examples/webgl_shaders_ocean.html
- Three.js Sky example: https://github.com/mrdoob/three.js/blob/dev/examples/webgl_shaders_sky.html
- MapLibre docs: https://maplibre.org/maplibre-gl-js/docs/
- MapLibre + Three.js integration example: https://maplibre.org/maplibre-gl-js/docs/examples/adding-3d-models-using-threejs-on-terrain/
- Turf.js docs: https://turfjs.org
- Zustand docs: https://zustand.docs.pmnd.rs

**Compatibility notes for Claude Code:**
- R3F v9 requires React 19 (locked)
- Drei v10 pairs with R3F v9 (locked)
- Three.js `Water` and `Sky` are in `three/examples/jsm/objects/` — imported from `three-stdlib` or directly
- If dependency conflicts arise on install, use `npm install --legacy-peer-deps` — do not downgrade any of the pinned versions

---

## 5. Core Gameplay Loop

```
Main Menu
  ↓
Voyage Setup (map-based port picker)
  ↓
Voyage
  • Third-person view, HUD overlay, boat responds to throttle/wheel
  • Port 3D geometry loads when within 5km; unloads when >5km away
  • Chartplotter toggle anytime
  • Tides drift boat; weather changes sea state
  • Grounding = game over
  ↓
Arrival OR Game Over
  • Arrival: return to Main Menu
  • Game Over: show "You ran aground near [port name]" screen with chart marker
  ↓
Back to Main Menu
```

---

## 6. Inside Passage — 21 Ports

Organized south to north. All 21 ports require Blender-built GLB scenes for full MVP scope; soft-launch ships with 3.

**Puget Sound**
1. Seattle, WA — Elliott Bay
2. Bainbridge Island, WA — Eagle Harbor
3. Kingston, WA
4. Port Townsend, WA
5. Anacortes, WA

**San Juan Islands**
6. Friday Harbor, WA
7. Roche Harbor, WA
8. Deer Harbor, WA — Orcas Island

**Canadian Gulf Islands & Strait of Georgia**
9. Sidney, BC
10. Nanaimo, BC
11. Pender Harbour, BC
12. Campbell River, BC

**Desolation Sound & Johnstone Strait**
13. Refuge Cove, BC
14. Port McNeill, BC

**Central Inside Passage (BC)**
15. Shearwater, BC (Bella Bella)
16. Prince Rupert, BC

**Alaska (Southeast)**
17. Ketchikan, AK
18. Wrangell, AK
19. Petersburg, AK
20. Sitka, AK
21. Juneau, AK

### 6.1 Port rendering approach — "simplified realistic"

**Design principle:** each port should *look faintly like the real place* from cruising distance. Accurate silhouettes, real shorelines, real mountain backdrops. No architectural accuracy on individual buildings. Terrain does the heavy lifting; buildings are abstracted.

Each port is a **Blender scene built with BlenderGIS** from:

1. **USGS 3DEP or NRCan CDEM elevation data** (real terrain — this is what sells "place")
2. **NOAA/OSM shoreline vector data** (accurate coast geometry)
3. **OSM building footprints, automatically extruded** to default height (~8m) or OSM-recorded height — no individual modeling, no roofs, no signature buildings
4. **One generic dock module** (reusable asset, hand-placed at each port's real marina location)
5. **Flat-shaded forest blobs** where OSM tags forested areas

Each port covers ~5 km radius, exported as GLB, loaded when boat enters the bubble.

**Polygon budget per port:**
- Terrain mesh: ~10–15k triangles
- OSM building extrusions: ~5–15k (varies — Seattle high, Refuge Cove ~0)
- Dock module: ~500
- Forest blobs: ~2–5k
- **Total: ~20–35k, under 50k cap with headroom**

### 6.2 Dual-asset export per port

Each port produces **two files**:

| File | Purpose | Contents |
|---|---|---|
| `{port}.glb` | Visual (rendered) | Full 3D scene: terrain, buildings, docks, forest |
| `{port}.collision.json` | Physics (grounding) | Simplified coastline as line segments + 50m depth grid |

The collision outline is a **manual simplification** of the visual shoreline — tracing the outer envelope at a coarser resolution (typically 50–300 line segments per port). Where the visual has a narrow cove, collision includes it. Collision can smooth minor bumps but must not skip features a player can see. 15-minute step per port during Blender export.

See §14 for the export workflow and Python script.

### 6.3 Between-port rendering

Open water between ports has no 3D geometry — just water, sky, and horizon fog. The chartplotter shows where you are. Grounding check is inactive outside the 5 km port bubble.

### 6.4 Launch stages

- **Soft launch:** 3 ports — Seattle, Friday Harbor, Juneau
- **v1.0:** 8 ports — adds Port Townsend, Roche Harbor, Nanaimo, Campbell River, Ketchikan
- **v1.1:** full 21 ports

The game is playable at each stage; more ports = more route options.

---

## 7. Boat Handling (Arcade)

### 7.1 On-screen controls (HUD overlay)

**Touch (iPad primary):**
- Bottom-left: throttle slider, vertical (−1 to +1, detents at 0, 0.25, 0.5, 0.75, 1.0)
- Bottom-right: virtual wheel (drag to turn; spring-back center)
- Top-left: camera toggle (3D ↔ chartplotter)
- Top-right: menu / pause
- Top-center: time compression (1x / 5x / 15x / 30x)
- Bottom-center: gauge strip — speed (knots), heading (°), depth under keel (ft)

**Keyboard fallback:**
- `W`/`S`: throttle; `A`/`D`: wheel; `Space`: camera toggle; `1`/`2`/`3`/`4`: compression; `Esc`: pause

### 7.2 Physics model

```
Cruise: 8 knots @ 0.75 throttle
Max:   10 knots @ 1.0
Reverse: 3 knots @ −1.0
0→cruise: ~30 sec; cruise→stop: ~45 sec coasting
Turn rate: ~2°/sec at cruise, scales with speed
External forces: wind + current vectors per frame, scaled by weather

Pitch & roll: visual only, driven by sea state
```

---

## 8. Navigation

### 8.1 Chartplotter (MapLibre)

Full-screen map with nautical-chart styling. Shows:
- Real coastlines, place names
- Boat position + heading arrow
- All 21 ports as tappable icons
- Route line (start → destination) via Turf.js
- Tide arrows at 3 reference stations
- Current depth contour for grounding awareness

### 8.2 Tides (simplified model)

Pre-computed sinusoidal tide curve for Seattle, Campbell River, Juneau. Current vector at boat = interpolated between nearest stations, scaled by rate-of-change. No API calls, no cached real-world dates — synthetic but plausible.

### 8.3 Grounding detection (game-over condition)

**Key design principle:** Visual geometry (what the player sees) and collision geometry (what grounds the boat) are **separate assets** exported from Blender. The player sees rich, detailed shorelines; physics uses a simplified outline.

#### 8.3.1 Two-zone system

| Zone | Trigger | Effect |
|---|---|---|
| **Warning** | Within 30m of collision line, OR depth under keel < 10 ft | Depth gauge turns red; haptic pulse on iPad; visual red vignette on screen edges |
| **Fatal** | Within 5m of collision line, OR depth under keel < 3 ft | Game over |

The warning zone gives the player time to react (throttle back, turn away) and provides forgiveness if collision geometry is slightly misaligned with visual geometry.

#### 8.3.2 Collision representation

- Boat = 2D circle (radius ~10m, projected to XZ plane)
- Coastline = array of 2D line segments loaded from port's `.collision.json`
- Check = point-to-line-segment distance (Turf.js `nearestPointOnLine`)
- No polygon-vs-polygon intersection, no runtime GLB parsing

#### 8.3.3 Spatial grid for performance

On port load: build a 50×50 grid over the 5km × 5km port area. Each cell stores indices of line segments that pass through it. Per frame:
1. Compute boat's current grid cell
2. Look up that cell + 8 neighbors (9 cells total)
3. Distance-test only the segments in those cells (typically 5–20 segments)

Rebuilt once per port load; trivial cost.

#### 8.3.4 Depth grid

Each port's `.collision.json` also contains a 2D depth grid at 50m resolution covering the port area. Depth lookup is O(1): `depthGrid[floor(x/50)][floor(z/50)]`. Values in feet below chart datum; boat draft subtracted to compute under-keel clearance.

#### 8.3.5 Defensive error handling

The entire grounding system is wrapped in try/catch. If anything throws — malformed collision JSON, NaN coordinates, missing depth grid — log the error, skip the check that frame, continue the game. **Grounding is a feature; crashing the voyage because of a geometry bug is not.**

#### 8.3.6 Scope of detection

Grounding only runs when a port GLB is loaded (within 5 km of a port). Open water between ports has no grounding check — matches reality, keeps cost zero mid-strait.

#### 8.3.7 Game Over screen

On fatal-zone trigger:
- Boat stops immediately, tilts visually (2-second hold)
- "Ran Aground" screen appears, showing:
  - Port name nearest the grounding
  - Chart snippet with a red marker at grounding location
  - Distance traveled this voyage, time elapsed
  - Buttons: "Return to Main Menu" / "Try Again" (reloads same voyage setup)

---

## 9. Weather (3 states, picked at start)

| State | Wind | Sea state | Water shader | Compression cap |
|---|---|---|---|---|
| Clear | Light | Ripple | Low amp, bright blue | 30x |
| Overcast | Moderate | Chop | Med amp, gray-blue | 30x |
| Stormy | Strong | Swell | High amp, dark gray-green | 5x |

Stormy caps time compression at 5x — you should be paying attention.

---

## 10. UI / Art Direction

### 10.1 References
Dredge (PNW mood, restrained UI), Sail Forth (low-poly boat), Flight Simulator (HUD readability)

### 10.2 Palette (Matt's brand)
- Primary UI: `#2C2E73` (navy), `#58585A` (slate)
- Accent: `#AF4035` (warm red) — game-over, alerts
- Water (clear): `#5A7A8A`; (stormy): `#2B3A42`
- Land: muted greens, gray-browns; snow above ~2000m: `#E8E8E8`

### 10.3 Typography
- UI: Inter or system sans
- Gauges: JetBrains Mono (tabular figures)

---

## 11. File Structure

```
trawler-captain/
├── public/
│   ├── assets/
│   │   ├── models/
│   │   │   ├── trawler.glb
│   │   │   ├── shared/
│   │   │   │   ├── dock.glb              // reusable dock module
│   │   │   │   └── forest_blob.glb       // reusable vegetation asset
│   │   │   └── ports/
│   │   │       ├── seattle.glb           // visual geometry
│   │   │       ├── seattle.collision.json // collision + depth grid
│   │   │       ├── bainbridge.glb
│   │   │       ├── bainbridge.collision.json
│   │   │       └── ... (19 more pairs)
│   │   └── textures/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── scenes/
│   │   ├── MainMenuScene.tsx
│   │   ├── VoyageSetupScene.tsx
│   │   ├── VoyageScene.tsx
│   │   └── GameOverScene.tsx
│   ├── world/
│   │   ├── Ocean.tsx
│   │   ├── Sky.tsx
│   │   ├── PortLoader.tsx
│   │   ├── WeatherManager.tsx
│   │   └── HorizonFog.tsx
│   ├── boat/
│   │   ├── Trawler.tsx
│   │   ├── physics.ts
│   │   └── controls.ts
│   ├── nav/
│   │   ├── Chartplotter.tsx
│   │   ├── tides.ts
│   │   └── routing.ts
│   ├── ui/
│   │   ├── Hud.tsx
│   │   ├── Throttle.tsx
│   │   ├── Wheel.tsx
│   │   ├── GaugeStrip.tsx
│   │   └── TimeCompression.tsx
│   ├── state/store.ts
│   ├── systems/
│   │   ├── timeCompression.ts
│   │   └── grounding.ts
│   └── data/ports.ts
```

---

## 12. Build Plan — Session-Sized Sub-Tasks

Each sub-task below is a **single Claude Code session** target: coherent scope, testable deliverable, 1–3 files per session. Sprints group related sessions.

### Sprint 1: Foundation

**1.1 — Project scaffold** *(1 session)*
- `npm create vite` with React + TypeScript
- Install all locked dependencies from §4
- Basic Canvas + Scene with ambient light + directional light
- Orbit controls for debug
- Deliverable: `npm run dev` loads a blank Canvas with orbit-able empty scene

**1.2 — Water and sky** *(1 session)*
- Integrate Three.js `Water` (from three-stdlib or copied from examples)
- Integrate Three.js `Sky`
- Color-grade water to match `#5A7A8A` clear-state palette
- Deliverable: camera orbits an infinite water surface under a proper sky

**1.3 — Trawler model + follow camera** *(1 session)*
- Load placeholder trawler GLB (Claude Code grabs a free Sketchfab boat; falls back to a simple cube if needed)
- Third-person follow camera positioned ~15m behind, ~8m above boat
- Smooth camera lerp (boat moves → camera follows with slight lag)
- Deliverable: trawler sits on water; camera follows when boat position is manually changed in code

### Sprint 2: Boat handling

**2.1 — Physics module** *(1 session)*
- `src/boat/physics.ts` pure module: state { position, heading, velocity, throttle, wheel }
- Update loop: throttle → target velocity (with ~30s lerp); wheel → heading change; basic inertia
- Unit-testable; no React dependencies
- Deliverable: stepping the physics in a loop produces sensible position/heading changes

**2.2 — Touch controls (throttle + wheel)** *(1 session)*
- `Throttle.tsx`: vertical slider, detents, large touch target
- `Wheel.tsx`: draggable disc, spring-back to center
- Outputs values to Zustand store
- Deliverable: on iPad (or dev tools touch emulation), dragging the throttle and wheel updates store values

**2.3 — Wire controls to physics and world** *(1 session)*
- Connect store values into physics update
- Physics output updates boat position in scene
- Camera follow tracks the moving boat
- Deliverable: drive the boat around the ocean

**2.4 — Keyboard fallback + gauge strip** *(1 session)*
- Keyboard handlers: WASD, Space, 1–4, Esc
- `GaugeStrip.tsx`: speed, heading readouts (placeholder for depth)
- Deliverable: desktop keyboard control works; gauges update live

### Sprint 3: MapLibre + voyage setup

**3.1 — Ports data module** *(1 session)*
- `src/data/ports.ts`: 21 ports with `{ id, name, region, lat, lng, glbPath, tideStationRef }`
- Deliverable: importable, typed, 21 entries

**3.2 — Voyage Setup scene** *(1 session)*
- `VoyageSetupScene.tsx`: two-column layout
- Left: start port picker (list of 21)
- Right: destination picker (list of 21)
- Weather selector (3 radio options), time-of-day slider, compression default
- "Start Voyage" button
- Stores selection in Zustand
- Deliverable: can configure a voyage and click Start

**3.3 — MapLibre basic chart** *(1 session)*
- `Chartplotter.tsx`: MapLibre map, OpenSeaMap tile style, centered on boat lat/lng
- 21 ports as symbol markers
- Boat position marker with heading rotation
- Deliverable: full-screen chart shows real Puget Sound + San Juans with port markers

**3.4 — Coordinate bridge** *(1 session)*
- Utility module: convert between lat/lng (MapLibre) and local Cartesian meters (Three.js scene), origin = boat's starting port
- Turf.js for distance/bearing calculations
- Deliverable: boat moving in 3D scene corresponds to correct lat/lng shown on MapLibre chart

**3.5 — Route line on chart** *(1 session)*
- Great-circle route from start to destination via Turf.js
- Rendered as a line layer on MapLibre
- Port tappable → popup with name + distance from boat
- Deliverable: route visible on chart, tapping ports shows info

### Sprint 4: Port loading + grounding

**4.1 — Port loader (visual + collision)** *(1 session)*
- `PortLoader.tsx`: monitors boat position, computes distance to each port
- Loads **both** `{port}.glb` (visual, via `useGLTF`) and `{port}.collision.json` (via fetch) when boat within 5 km
- Unloads both when >5 km away (dispose properly; drop collision grid from memory)
- Horizon fog hides geometry transitions
- Deliverable: with placeholder assets, port "arrives" and "departs" as boat moves; collision data logs to console on load

**4.2 — Grounding collision core** *(1 session)*
- `src/systems/grounding.ts`:
  - On port load: parse collision JSON, build 50×50 spatial grid indexing line segments
  - Each frame (only when port is loaded): look up boat's grid cell + 8 neighbors, test each segment with Turf.js `nearestPointOnLine`
  - Return closest distance to collision geometry + current depth from depth grid
- Pure module, no React. Unit-testable.
- Wrap all operations in try/catch — on any error, log and skip the frame (never crash)
- Deliverable: feed synthetic collision data + boat positions to the module, verify correct distance and depth returned

**4.3 — Warning zone + fatal zone wiring** *(1 session)*
- Consume grounding module output in voyage scene
- **Warning zone** (distance < 30m OR depth < 10 ft): depth gauge turns red, red screen-edge vignette, iPad haptic pulse
- **Fatal zone** (distance < 5m OR depth < 3 ft): trigger game-over state
- Deliverable: driving close to collision geometry shows warnings; driving into it ends the voyage

**4.4 — Game Over scene** *(1 session)*
- `GameOverScene.tsx`: overlay showing
  - "Ran Aground near [port name]"
  - Chart snippet with red marker at grounding location
  - Stats: distance traveled, time elapsed
  - Buttons: "Return to Main Menu" / "Try Again"
- Deliverable: fatal grounding shows proper end screen; buttons work

### Sprint 5: Tides + weather + time compression

**5.1 — Tide model** *(1 session)*
- `src/nav/tides.ts`: 3 reference stations with sinusoidal parameters (period 12.4h, realistic amplitudes)
- Function: `getCurrentAt(lat, lng, gameTime)` returns vector (direction + magnitude)
- Deliverable: tide model returns sensible currents that vary over game time

**5.2 — Currents affect boat drift** *(1 session)*
- Wire tide model output into physics module as external force vector per frame
- Tide arrows rendered on MapLibre at the 3 stations, sized by current magnitude
- Deliverable: boat drifts noticeably at peak flow; chart shows tide arrows

**5.3 — Weather system** *(1 session)*
- `WeatherManager.tsx`: reads weather state from Zustand
- Drives: water shader params (amplitude, color), sky color tint, wind magnitude, visual pitch/roll scaling
- Deliverable: switching weather state in store changes the scene visually and physically

**5.4 — Time compression** *(1 session)*
- `src/systems/timeCompression.ts`: scales game time delta by 1x / 5x / 15x / 30x
- HUD compression selector updates store
- Auto-slowdown triggers: within 1 nm of port → force 1x; stormy weather → cap at 5x
- Deliverable: crank 30x on open water; approach port and it auto-slows

### Sprint 6: Main menu + polish

**6.1 — Main menu scene** *(1 session)*
- `MainMenuScene.tsx`: background render of trawler in Elliott Bay (using Seattle port GLB if available, else placeholder), title, "New Voyage" button
- Deliverable: launch screen matches art direction

**6.2 — Scene transitions + pause menu** *(1 session)*
- Clean transitions: MainMenu → VoyageSetup → Voyage → GameOver/MainMenu
- Pause menu overlay (Resume, Settings, Return to Main Menu)
- Deliverable: full app navigation works

**6.3 — Visual polish pass** *(1 session)*
- Color grading via simple post-process
- Distance fog tuned to each weather state
- Final palette alignment
- iPad touch target sizes verified (minimum 48×48px)
- Deliverable: ship-quality MVP visual

**6.4 — iPad verification** *(1 session)*
- Test on iPad Air via local network dev server
- Profile performance; flag any frame-rate issues
- Document Add-to-Home-Screen install procedure
- Deliverable: confirmed 60fps on iPad Air in clear weather

---

## 13. Total Sessions & Time

**23 Claude Code sessions** across 6 sprints.

At 1 session per work-block (likely 1–2 sessions per sitting), realistic calendar time: **2–3 weeks of focused Claude Code work.**

Running alongside the Blender workstream below.

---

## 14. Parallel Workstream: Port Modeling (Blender — owner-driven)

Runs independently on evenings/weekends. Claude Code ships with placeholder assets; real ports drop in as completed.

### 14.1 Per-port workflow (BlenderGIS) — "simplified realistic"

**Design target:** accurate silhouettes and shorelines, abstract buildings, reused modules for consistency.

1. Define 5 km × 5 km bounding box at port center
2. **GIS → Web Geodata → Basemap** for satellite orientation
3. **GIS → Get Elevation (3DEP for US, NRCan CDEM for BC, SRTM fallback)** for real terrain
4. **GIS → Get OSM → Ways + Buildings** with default height ~8m; enable "Elevation from object" for auto-placement on terrain
5. Apply styled materials from `port_template.blend`:
   - Flat-shaded muted green (land), gray (buildings), snow-white (above 2000m elevation — driven by shader, not manual)
   - Dark green forest blobs where OSM tags forested areas
6. Place one instance of the **generic dock module** (`shared/dock.glb`) at the port's marina location
7. Decimate modifier to hit ~20–35k triangle target (≤50k hard cap)
8. **Export visual:** File → Export → glTF 2.0 → `seattle.glb`
9. **Export collision:** run the Python script in §14.5 → `seattle.collision.json`
10. **Validate:** reload both in-game in debug mode, visually confirm collision outline tracks shoreline (see §14.6)

**Time per port: ~20 minutes of active workflow, plus 60–90 minutes of quality tuning/validation.**

### 14.2 Effort

- Port #1 (Seattle): 6–8 hrs (learning workflow, establishing `port_template.blend`)
- Ports #2–3: 3–4 hrs each
- Ports #4–21: 1.5–2.5 hrs each

**Total: 40–55 hours of Blender work over ~5–7 weeks of evening/weekend time.**

### 14.3 Launch stages
- **Soft launch (3 ports):** Seattle, Friday Harbor, Juneau
- **v1.0 (8 ports):** adds Port Townsend, Roche Harbor, Nanaimo, Campbell River, Ketchikan
- **v1.1 (21 ports):** all remaining

### 14.4 Consistency modules

To keep all 21 ports feeling like one cohesive world, the following are **built once, reused everywhere**:

| Module | Location | Built during |
|---|---|---|
| `port_template.blend` | Blender template file | Port #1 |
| Styled materials (land, building, forest, water, snow) | In template | Port #1 |
| Snow-line shader (whitens above ~2000m) | In template | Port #1 |
| `shared/dock.glb` (generic dock module) | `public/assets/models/shared/` | Port #1 |
| `shared/forest_blob.glb` (vegetation asset) | `public/assets/models/shared/` | Port #1 |
| Python collision export script | Tool, one-time | Port #1 |

Every subsequent port starts from this template. Ports 4–21 use the workflow as a near-scripted sequence.

### 14.5 Collision export script (Python, runs inside Blender)

After visual export, select the coastline curve object(s) in Blender, then run this script via Blender's Scripting workspace. It walks curve vertices, projects to the XZ ground plane, simplifies, and writes the collision JSON.

```python
# Save as collision_export.py; run from Blender Scripting tab
# Select coastline curve objects + depth grid empty, then execute
import bpy, json, os

SIMPLIFY_TOLERANCE = 15.0  # meters — merge vertices within this distance along the curve
DEPTH_GRID_SIZE = 50.0     # meters per depth grid cell
PORT_RADIUS = 5000.0       # half the 5km x 5km port area

def export_collision(port_name, output_dir):
    polygons = []
    for obj in bpy.context.selected_objects:
        if obj.type != 'CURVE':
            continue
        for spline in obj.data.splines:
            pts = [(p.co.x, p.co.z) for p in spline.points]  # Project to XZ (top-down)
            simplified = simplify_polyline(pts, SIMPLIFY_TOLERANCE)
            polygons.append(simplified)

    depth_grid = sample_depth_grid(DEPTH_GRID_SIZE, PORT_RADIUS)  # see helper

    out = {
        "port": port_name,
        "polygons": polygons,       # list of list of [x, z] pairs (meters)
        "depth_grid": {
            "cell_size": DEPTH_GRID_SIZE,
            "origin": [-PORT_RADIUS, -PORT_RADIUS],
            "grid": depth_grid      # 2D array of depths in feet (negative = underwater)
        }
    }
    path = os.path.join(output_dir, f"{port_name}.collision.json")
    with open(path, "w") as f:
        json.dump(out, f, indent=2)
    print(f"Wrote {path}: {sum(len(p) for p in polygons)} vertices, "
          f"{len(depth_grid) * len(depth_grid[0])} depth cells")

# simplify_polyline: Ramer–Douglas–Peucker implementation, ~20 lines
# sample_depth_grid: ray-cast from grid cell center down onto bathymetric mesh, ~15 lines
```

**Claude Code will need to flesh out the helpers** — this is pseudocode. The helpers `simplify_polyline` and `sample_depth_grid` are straightforward implementations the PRD authorizes Claude Code to generate when building port #1.

### 14.6 Visual validation step

After exporting both files, the game has a debug overlay mode (toggle via keyboard `F3` or URL param `?debug=collision`) that:
- Loads the port GLB normally
- Renders the collision polygons as red lines overlaid on the 3D scene
- Renders depth grid as a translucent checkerboard

Fly the camera around the port — the red lines should closely follow visible shorelines. If they skip a cove or intersect a pier, adjust the curve source in Blender, re-export, reload.

**5-minute validation per port. Catches misalignment before players can hit it.**

---

## 15. Data Sources

| Source | Use | URL |
|---|---|---|
| USGS 3DEP | US elevation (1–10m) | https://apps.nationalmap.gov/downloader/ |
| NRCan CDEM | Canadian elevation (20m) | https://open.canada.ca/data/en/dataset/957782bf-847c-4644-a757-e383c0057995 |
| SRTM | Global fallback elevation | Auto via BlenderGIS |
| OSM | Buildings, coastlines | Auto via BlenderGIS |
| NOAA ENC | US nautical shorelines | https://nauticalcharts.noaa.gov/charts/noaa-ens.html |
| OpenSeaMap | Chart tiles for MapLibre | https://www.openseamap.org/ |

---

## 16. Success Criteria (Soft Launch)

- At least 3 port pairs complete (`.glb` + `.collision.json`): Seattle, Friday Harbor, Juneau
- Installed on Matt's iPad Air
- Seattle → Friday Harbor runs end-to-end without crashes
- Mountains around Seattle recognizable (Olympics, Rainier silhouette)
- Collision validation passes: `?debug=collision` overlay confirms red lines track shorelines
- **Warning zone** triggers visually before player grounds (red vignette, depth gauge red)
- **Fatal zone** triggers game over with correct port name and chart marker
- 60 fps on iPad Air in clear weather, 2 ports loaded
- 20-voyage test sequence with zero hard crashes (grounding system try/catch never triggers)

---

## 17. Open Questions

1. Trawler model: ship with free Sketchfab pilothouse trawler; upgrade to custom NP 590 Blender model in v1.1?
2. OSM building quality in remote ports (Klemtu not in MVP, but Shearwater, Wrangell, Petersburg): acceptable as-is from OSM extrusion, or does remote fidelity matter enough to hand-model?
3. Snow-line shader threshold: is 2000m the right cut-off for the Inside Passage, or should it be lower (1500m) to capture more visible snow on coastal peaks?
4. Collision polygon simplification tolerance: the export script uses 15m default — worth tuning per port, or one-size-fits-all for MVP?

---

## Appendix A: Glossary

- **Trawler:** displacement-hull power boat for long-range slow-speed cruising
- **GLB:** binary glTF, standard 3D model format for web
- **BlenderGIS:** open-source Blender addon for geographic data import
- **USGS 3DEP / NRCan CDEM:** US and Canadian digital elevation model programs
- **OSM:** OpenStreetMap, global community-sourced map data
- **Inside Passage:** sheltered coastal route, Washington → Southeast Alaska
- **MapLibre:** open-source map rendering library (Mapbox GL JS fork)
- **R3F:** React Three Fiber, React renderer for Three.js
- **Aground:** vessel's keel or hull in contact with seafloor
- **Collision proxy:** simplified geometry used for physics checks, separate from visual geometry
- **Warning zone / fatal zone:** two-tier grounding detection — warning triggers alerts, fatal ends the voyage
- **Spatial grid:** data structure that divides a 2D space into cells for fast nearest-neighbor lookups
- **Depth grid:** 2D array of seafloor depths at fixed spatial resolution, for O(1) under-keel clearance lookup
- **Ramer–Douglas–Peucker:** classic polyline simplification algorithm used in the collision export script
