# Sprint 2 Retrospective

**Date:** 2026-04-17
**Sprint Goal:** Boat handling — physics module, touch HUD, wire to scene, keyboard + gauges
**Status:** Complete
**Health:** 🟢 Clean
**Note:** Synthesized post-hoc from git history and code inspection at start of Sprint 3 planning. No live-session notes were captured during execution; this retro covers what is verifiable from commits and final code state.

---

## Health Summary

```
SPRINT 2 HEALTH SUMMARY
════════════════════════════════════════

Tasks Completed:        4 / 4
Tasks Partially Done:   None
Tasks Skipped:          None

Issues Encountered:     1 (latent, surfaced later)
  - Failed Approaches:  0
  - Repeated Attempts:  0
  - Diversions:         0
  - Unexpected Errors:  0
  - PRD Deviations:     0
  - Missing Prereqs:    0
  - Latent Bugs:        1 (weather field duplicated across store slices)

Overall Sprint Health:  🟢 Clean
```

Commits show clean linear progression: 2.1 → 2.2 → 2.3 → 2.4, no reverts, no `wip` messages, no redo commits. Sprint 1 carry-forward items were all resolved (DebugControls.tsx deleted in 2.4 as planned). One latent type-declaration issue in the pre-existing store was not caught during sprint but surfaced during Sprint 3 planning.

---

## What Shipped (from commits)

### 2.1 — Physics module (0293bdf)
- `src/boat/physics.ts` — pure `stepPhysics()` with exponential velocity response (ACCEL τ=10s, DECEL τ=15s), velocity-scaled turn rate, NaN-safe via `clampFinite()`
- `src/boat/physics.test.ts` — 128 lines of unit tests
- `vitest.config.ts` added
- **Convention established:** `+Z = forward` at heading=0 (dz = cos(0)·v = +v·dt). FollowCamera sits at −Z behind the boat. This convention will drive the coordinate bridge in Sprint 3.4.

### 2.2 — Touch HUD (571b985)
- `src/ui/Throttle.tsx`, `Wheel.tsx` — pointer-event based, setPointerCapture pattern
- `src/ui/Hud.module.css` — CSS Modules, 173 lines; palette matches PRD §10.2
- `src/ui/throttle-detents.ts` + test — pure detent-snapping helper
- `src/ui/wheelInputState.ts` — shared input-state module pattern (non-Zustand side channel for ephemeral wheel drag)

### 2.3 — Wire physics to store (7cc72d2)
- `src/systems/boatPhysicsLoop.tsx` — R3F `useFrame` consumer of `stepPhysics`, writes position/heading/velocity to store
- Store gains `setVelocity` action

### 2.4 — Keyboard + gauges (f6b8c3c)
- `src/boat/KeyboardControls.tsx` — WASD / 1–4 / Space / Esc handlers
- `src/ui/GaugeStrip.tsx` — speed/heading readouts
- `src/ui/gauge-format.ts` + test — pure formatters (knots, heading degrees)
- `src/boat/DebugControls.tsx` deleted (Sprint 1 carry-forward resolved)

---

## Issues

### Latent: Weather field duplicated across store slices

**Category:** Latent bug (pre-existing from Sprint 1; not surfaced during Sprint 2)

**Sprint Task:** Pre-existing in [src/state/store.ts](src/state/store.ts) since sub-task 1.1. Sprint 2 didn't touch weather but also didn't catch it.

**What happened:**
`src/state/store.ts` declared `weather: WeatherState` in both `VoyageSlice` and `WorldSlice`. TypeScript merges duplicate property declarations with identical types, so the combined `GameState` has one field, no compile error, no runtime split — but the structure misleadingly suggests two independent weather concepts.

**Resolution:**
Fixed in Sprint 3 pre-work (this retro pass): `weather` removed from `WorldSlice`; `VoyageSlice.weather` is canonical. PRD §2.2 explicitly cuts dynamic mid-voyage weather, so one field is correct. WeatherManager in Sprint 5.3 will read from `voyage.weather`.

**Impact on sprint:** None (Sprint 2 didn't touch weather).

**Lesson for future sprints:**
When two slices appear to own the same concept, they probably don't — consolidate in planning, not after. Skim the full store during sprint planning, not just the slices you're about to modify.

---

## Recommendations

### Carry-Forward Items

1. **None blocking Sprint 3** — all Sprint 2 deliverables verified by inspection.
2. **Retro cadence** — Sprint 2 retro was written post-hoc. Going forward: run `/sprint-retro N` immediately after the last sub-task of sprint N is committed, **before** planning sprint N+1. This is when context is still fresh.
3. **Real trawler GLB** (carried from Sprint 1) — still open. Drop at `public/assets/models/placeholder/trawler.glb` when available; rewrite `Trawler.tsx` to use `useGLTF`.

### Technical Debt

1. **Trawler.tsx uses primitive geometry** — not touched in Sprint 2, same as Sprint 1 retro.
2. **Bundle size** — unoptimized, deferred to Sprint 6.3.
3. **`wheelInputState.ts` side-channel** — non-Zustand mutable state for wheel drag ergonomics. Works fine for touch but worth revisiting if the pattern proliferates. Not a problem yet.

### CLAUDE.md Updates

None required. Sprint 2 matched existing conventions cleanly.

### PRD Corrections

None.

---

## Sprint 3 Readiness Check

Sprint 3 (MapLibre + voyage setup) prerequisites:

- [x] Physics module stable and tested (`stepPhysics` is pure, vitest-covered)
- [x] Zustand store with `voyage` slice fields defined (setters missing — Sprint 3.2 will add `setStartPortId`, `setDestinationPortId`, `setWeather`, `setDepartureTime`, `setTimeCompression`)
- [x] Scene renders a driveable 3D boat on water with working touch + keyboard controls
- [x] `+Z = forward / north` axis convention documented (critical input to Sprint 3.4 coordinate bridge)
- [x] Weather field cleanup completed in retro pass
- [x] No outstanding blockers

**Green light to execute Sprint 3.**
