# Sprint 4 Retrospective

**Date:** 2026-04-17
**Sprint Goal:** Port Loading + Grounding — PortLoader, grounding core, warning/fatal zones, Game Over scene
**Status:** Complete
**Health:** 🟢 Clean

---

## Health Summary

```
SPRINT 4 HEALTH SUMMARY
════════════════════════════════════════

Tasks Completed:        4 / 4
Tasks Partially Done:   None
Tasks Skipped:          None

Issues Encountered:     3 (1 PRD deviation, 2 process notes)
  - Failed Approaches:  0
  - Repeated Attempts:  0
  - Diversions:         0
  - Unexpected Errors:  0
  - PRD Deviations:     1 (nearestPointOnLine → inline 2D math, performance)
  - Missing Prereqs:    0
  - Dependency Issues:  0
  - Process Debt:       2 (Sprint 3 retro CLAUDE.md updates still unapplied, dev-only store global added)

Overall Sprint Health:  🟢 Clean

Top 3 Time Sinks:
1. (none significant — sprint shipped in one unbroken flow)
2. Preview verification ergonomics — used setTimeout-wait pattern to let React state settle
3. Synthetic collision JSON generation — one-off Node script, ran once, committed output
```

Sprint 4 was the cleanest sprint to date. All four sub-tasks shipped on first pass with zero reverts. 32 new unit tests added (107 total pass). End-to-end flow verified in preview: voyage start → warning zone → fatal trigger → Game Over scene with stats → Try Again + Main Menu both work cleanly. Grounding core's brute-force parity test passed first try. The only "issues" are one intentional PRD deviation documented in the plan, and two items of process debt carried from Sprint 3.

---

## Issues

### Issue: Inline 2D point-to-segment distance instead of Turf's nearestPointOnLine

**Category:** PRD Deviation (documented in plan ahead of time)

**Sprint Task:** Task 4.2 — Grounding collision core

**What happened:**
PRD §8.3.2 specifies using Turf.js `nearestPointOnLine` for distance checks. Turf's helper converts to lat/lng km internally via spherical projection — expensive for a per-frame hot path where all inputs are already in local meters. Sprint 4 inlined a ~15-line 2D point-to-segment distance function instead.

**Attempts made:**
1. Considered using `nearestPointOnLine` per PRD — rejected at plan time (documented in plan Risk & Notes).
2. Implemented inline 2D math with t-parameter clamping.
3. Added brute-force parity test in `grounding.test.ts` to verify the inline math matches a reference implementation across a dense synthetic collision with 125+ segments.

**Resolution:** Inline math. Brute-force parity test locks correctness.

**Diverted from original plan?** No — plan explicitly called for this deviation (documented in Risk & Notes and flagged for PRD correction in this retro).

**Impact on sprint:**
- Time cost: Low (the inline math is ~15 lines; the test is the real investment)
- Code quality: Clean; `distanceToSegment` is a tight, testable helper in [src/systems/grounding.ts](src/systems/grounding.ts)
- Technical debt: None

**Lesson for future sprints:**
When the PRD suggests a library function in a performance-critical loop, profile before committing. The PRD can be corrected when the better approach is verified.

---

### Issue: Dev-only `window.__store` global added for preview verification

**Category:** Process note (non-blocking)

**Sprint Task:** Task 4.3 — Warning + fatal zone wiring (verification step)

**What happened:**
Verifying the warning/fatal zones end-to-end required driving the boat near the synthetic Seattle coastline. The boat has realistic inertia (30 s to reach cruise, ~2°/s turn rate), so simulating a drive-into-coast via keyboard events would take 60+ seconds of wall time per check. Instead, added a dev-only `window.__store = useGameStore` in [src/main.tsx](src/main.tsx) under `import.meta.env.DEV` so preview-tool evals can teleport the boat and read state directly.

**Attempts made:**
1. Considered dispatching keyboard events via `preview_eval` — rejected as too slow for iteration.
2. Added the dev-only global. Verified it's gated by `import.meta.env.DEV` — won't ship in production bundle.

**Resolution:** Dev-only global committed as part of 4.3. Production bundle unaffected.

**Diverted from original plan?** No — plan didn't explicitly call for this; improvised for verification ergonomics.

**Impact on sprint:**
- Time cost: Very low (~1 min to add)
- Code quality: Clean; gated by env check
- Technical debt: Mild. Future agents may not notice the global exists. Document so it doesn't look like dead code.

**Lesson for future sprints:**
When verifying physics-gated UI states, expose a dev-only store handle from day one of the project. Avoid re-discovering this ergonomics win every sprint.

---

### Issue: Sprint 3 retro CLAUDE.md updates still not applied

**Category:** Process debt (carried from Sprint 3)

**Sprint Task:** Pre-Sprint 4 housekeeping (flagged in plan, not executed)

**What happened:**
Sprint 3's retro recommended two new `CLAUDE.md` sections (worktree bootstrap, git identity in worktrees). Sprint 4 plan flagged them as "non-blocking but should be applied". They were not applied during Sprint 4. Now two sprints overdue.

**Attempts made:** None during Sprint 4 — flagged in plan, deliberately deprioritized to stay in sub-task scope.

**Resolution:** Deferred again. Should be applied as a chore commit before Sprint 5 starts, or early in Sprint 5.

**Diverted from original plan?** No — plan explicitly declined to apply these during Sprint 4.

**Impact on sprint:**
- Time cost: None (skipped)
- Code quality: N/A
- Technical debt: Mild — a fresh agent in a new worktree will re-discover the `npm install` requirement and the git-identity workaround the hard way.

**Lesson for future sprints:**
Retro → plan → plan → [applied] should not take multiple sprints. If an update is recommended, apply it as a chore commit during the next sprint's pre-work, or mark it as a blocker so it happens before the next sub-task.

---

## Recommendations

### Carry-Forward Items

1. **None blocking Sprint 5** — all Task 4.x deliverables ship. Sprint 5 can proceed immediately.
2. **Sprint 3 CLAUDE.md updates (still open, now 2 sprints overdue)** — apply the "Worktree bootstrap" and "Git identity in worktrees" sections from [docs/retros/sprint-3-retro.md](docs/retros/sprint-3-retro.md). Suggest doing this as a chore commit at the start of Sprint 5 before sub-task 5.1.
3. **Real trawler GLB** (carried from Sprint 1) — still open.
4. **Real port GLBs** (new carry-forward from Sprint 4) — owner's Blender workstream hasn't produced any yet. PortLoader handles missing GLBs with a placeholder wireframe box per PRD. Real assets drop in without code change.
5. **PRD correction proposed** (see below) — `nearestPointOnLine` vs inline 2D math; worth updating §8.3.2 when convenient.
6. **Dev-only store global** — [src/main.tsx:9](src/main.tsx) exposes `useGameStore` on `window.__store` under `import.meta.env.DEV`. Useful for preview-tool verification. Should be documented in CLAUDE.md so future agents don't mistake it for dead code.

### Technical Debt

1. **Bundle size still 2.15 MB** — unchanged from Sprint 3. Sprint 4 added ~5 kB of app code + a 32 kB runtime-fetched synthetic collision JSON. No regression. Sprint 6.3 code-splitting target still applies.
2. **[src/boat/Trawler.tsx](src/boat/Trawler.tsx)** — primitive geometry, carried from Sprint 1.
3. **[src/world/PortLoader.tsx](src/world/PortLoader.tsx)** — renders a 40 m wireframe box as placeholder when no GLB exists. Replace with `useGLTF` loader when real assets land.
4. **[src/main.tsx](src/main.tsx) dev-only `window.__store`** — harmless in dev, gated by env check. Document, don't remove.

### CLAUDE.md Updates

The Sprint 3 updates are **still pending**. Reproduce here, plus one new addition from Sprint 4.

**Still pending from Sprint 3 retro** (add to "Specific Technical Gotchas"):

```markdown
### Worktree bootstrap

This repo uses git worktrees at `.claude/worktrees/<branch>/`. Each worktree has its own `node_modules` — they are NOT shared with the parent repo. On the first session in a fresh worktree, run:

```bash
npm install --legacy-peer-deps
```

Vitest will work without this (it resolves up to the parent), but `npm run build` will fail with `[vite:load-fallback] Could not load .../node_modules/three` because `vite.config.ts` uses `path.resolve(__dirname, './node_modules/three')` which expects node_modules in the worktree root.
```

**Still pending from Sprint 3 retro** (add to "Git Conventions"):

```markdown
### Git identity in worktrees

Worktrees inherit git state from the parent repo but NOT git config (no `user.name` / `user.email`). Commits will fail with "Author identity unknown". Per CLAUDE.md "NEVER update the git config", the approved workaround is inline per-command config:

```bash
git -c user.name="Matt Krieger" -c user.email="matt@k-analytics.com" commit -m "..."
```

Do not `git config user.name ...` — that writes to `.git/config` and counts as updating config.
```

**New from Sprint 4** (add to "Specific Technical Gotchas"):

```markdown
### Dev-only `window.__store` for preview verification

`src/main.tsx` attaches the Zustand store to `window.__store` when `import.meta.env.DEV` is true. This is intentional — it lets preview-tool `preview_eval` calls teleport the boat, read state, and trigger scene transitions without simulating inertia-laden keyboard input. The assignment is tree-shaken from production builds (Vite strips the `DEV` branch when minifying). Do not remove.

Use from `preview_eval`:
```js
window.__store.getState().setBoatPosition([500, 0, 0])
window.__store.getState().activeScene
```
```

### PRD Corrections

1. **§8.3.2 "Collision representation"** — update "point-to-line-segment distance (Turf.js `nearestPointOnLine`)" to note that inlining a 2D point-to-segment function is acceptable (and preferred) for the per-frame hot path, since all inputs are in local meters and Turf's helper has significant per-call overhead converting through lat/lng km. The inline implementation lives in [src/systems/grounding.ts](src/systems/grounding.ts) and is verified against a brute-force baseline in [src/systems/grounding.test.ts](src/systems/grounding.test.ts).
2. **§7.2 "Physics model"** — boat draft is not explicitly stated. Sprint 4 chose 3 ft based on PRD §8.3.1's "depth under keel < 3 ft" fatal threshold. Consider stating this explicitly (`Draft: 3 ft`) in §7.2 alongside cruise/max/reverse speeds.

---

## Sprint 5 Readiness Check

Sprint 5 (Tides + weather + time compression) prerequisites:

- [x] Boat physics stable with `externalForce` vector input (the unused third parameter is ready for tide currents)
- [x] Weather state in `VoyageSlice` (set at voyage start, static per PRD §2.2)
- [x] Chartplotter available — tide arrows will add a new GeoJSON source/layer alongside the existing route line
- [x] `timeCompression` field in store (set in voyage setup, wired to UI in Sprint 2.4)
- [x] Ocean water shader has uniforms that WeatherManager can drive (amplitude, color)
- [x] `worldTime` (gameTime) field in store, currently unused — Sprint 5.4 will increment it with compression
- [x] Build clean, 107 tests passing, no grounding regressions

**Green light to plan Sprint 5.**
