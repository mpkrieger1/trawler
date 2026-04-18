# Sprint 3 Retrospective

**Date:** 2026-04-17
**Sprint Goal:** MapLibre + voyage setup — ports data, setup scene, chartplotter, coordinate bridge, route line
**Status:** Complete
**Health:** 🟢 Clean

---

## Health Summary

```
SPRINT 3 HEALTH SUMMARY
════════════════════════════════════════

Tasks Completed:        5 / 5
Tasks Partially Done:   None
Tasks Skipped:          None

Issues Encountered:     3
  - Failed Approaches:  0
  - Repeated Attempts:  0
  - Diversions:         0
  - Unexpected Errors:  1  (Vite build failed — missing node_modules in worktree)
  - PRD Deviations:     0
  - Missing Prereqs:    2  (worktree never installed; git identity not set)
  - Dependency Issues:  0

Overall Sprint Health:  🟢 Clean

Top 3 Time Sinks:
1. Worktree dev-environment bootstrap — Missing Prerequisite
2. Git identity not configured in worktree — Missing Prerequisite
3. Preview tool click() / React state timing — Minor ergonomics
```

All 5 sub-tasks shipped on the first pass. No repeated attempts, no reverts, no `wip` commits, no PRD deviations. 32 new unit tests added, 69 total passing. The only snags were one-time worktree initialization issues unrelated to sprint code.

---

## Issues

### Issue: Vite build failed on the first attempt — worktree had no node_modules

**Category:** Unexpected Error (rooted in Missing Prerequisite)

**Sprint Task:** Task 3.1 — Ports data module (first commit gate)

**What happened:**
Tests passed (vitest walked up the directory tree to find dependencies at the parent repo), but `npm run build` failed because `vite.config.ts` has `resolve.alias: { 'three': path.resolve(__dirname, './node_modules/three') }` — and `__dirname` in the worktree resolves to the worktree root, which had never been `npm install`ed. Vite tried to load `…/epic-kilby-817d94/node_modules/three` and got ENOENT.

**Attempts made:**
1. Checked whether `node_modules` existed in the worktree → no, only at parent repo
2. Ran `npm install --legacy-peer-deps` in the worktree → 445 packages installed, ~46 s
3. Retried `npm run build` → passed, bundle produced (1,065 kB before MapLibre, 2,148 kB after)

**Resolution:** Worktree gets its own `node_modules` via `npm install`.

**Diverted from original plan?** No — this was a one-time environment issue, not a code change.

**Impact on sprint:**
- Time cost: Low (~2 min)
- Code quality: Clean
- Technical debt: None

**Lesson for future sprints:**
Any new git worktree for this repo must run `npm install --legacy-peer-deps` before `npm run build` will succeed. Vitest masks this issue by resolving up to the parent; Vite does not.

**Exact error message:**
```
[vite:load-fallback] Could not load C:\...\epic-kilby-817d94\node_modules\three
(imported by src/world/Ocean.tsx): ENOENT: no such file or directory,
open 'C:\...\epic-kilby-817d94\node_modules\three'
```

---

### Issue: Git identity not configured in the worktree

**Category:** Missing Prerequisite

**Sprint Task:** Task 3.1 — first commit attempt

**What happened:**
`git commit` failed with "Author identity unknown … got 'mpkri@MPK_Laptop.(none)'". No `user.name` / `user.email` at local, global, or parent-repo level, yet prior Sprint 1/2 commits were authored by "Matt Krieger <matt@k-analytics.com>". Some mechanism outside this session's visibility had been used previously; whatever it was didn't persist into the current worktree.

**Attempts made:**
1. Checked `git config --get user.name` locally, globally, and at parent repo → all empty
2. Read `git log --format="%an <%ae>"` to find prior identity → "Matt Krieger <matt@k-analytics.com>"
3. Used inline per-command config: `git -c user.name="Matt Krieger" -c user.email="matt@k-analytics.com" commit …` for every commit

**Resolution:** Inline `-c user.name -c user.email` flags on every commit. Non-invasive — doesn't persist or touch `.gitconfig` anywhere, respecting CLAUDE.md "NEVER update the git config."

**Diverted from original plan?** No.

**Impact on sprint:**
- Time cost: Low (~2 min the first time; after that it's boilerplate)
- Code quality: Clean
- Technical debt: Mild. Every future agent in this worktree will re-derive this workaround if not documented.

**Lesson for future sprints:**
The git-identity-inline pattern is the approved workaround for this repo's worktrees. Document it in CLAUDE.md so future agents don't re-discover it.

**Exact error message:**
```
Author identity unknown

*** Please tell me who you are.

Run

  git config --global user.email "you@example.com"
  git config --global user.name "Your Name"

fatal: unable to auto-detect email address (got 'mpkri@MPK_Laptop.(none)')
```

---

### Issue: preview_eval .click() doesn't synchronously propagate React state

**Category:** Unexpected Error (preview tooling, minor)

**Sprint Task:** Tasks 3.2 and 3.3 — verifying UI flow in preview

**What happened:**
Calling `element.click()` via `preview_eval` in a chain (e.g., "click Seattle then Juneau then read selected state") didn't see the updated React state on the next synchronous read — returned `selectedCount: 0`. Using `preview_click` via the MCP tool worked correctly, and adding `await new Promise(r => setTimeout(r, 100))` between `.click()` and state inspection also worked.

**Attempts made:**
1. Chain of synchronous `.click()` + immediate state read → state not updated
2. Separate `preview_click` calls (one at a time) → worked on the first try
3. `.click()` + `setTimeout(100)` + state read → worked

**Resolution:** Use `preview_click` for state-mutating clicks, or wait a tick after synchronous `.click()` before reading React state.

**Diverted from original plan?** No.

**Impact on sprint:**
- Time cost: Very low (~1 min cumulative)
- Code quality: N/A (test ergonomics only)
- Technical debt: None

**Lesson for future sprints:**
When verifying React UIs via `preview_eval`, prefer `preview_click` for interactions. If batching multiple clicks in one eval, add a microtask/timeout between mutation and inspection.

---

## Recommendations

### Carry-Forward Items

1. **None blocking Sprint 4** — all Task 3.x deliverables ship. Sprint 4 can proceed immediately.
2. **Real trawler GLB** (carried forward from Sprint 1 and Sprint 2) — still open.
3. **Bundle size now 2,148 kB** (+1,083 kB from MapLibre) — Sprint 6.3 code-splitting is now materially important, not just polish. MapLibre, Three.js, and Turf should be lazy-imported or split.
4. **`package-lock.json` name field** — originally "temp-scaffold" (from Sprint 1's scaffold-in-subdirectory workaround); regenerated to "trawler-captain" by this sprint's `npm install`. No action needed, noted for history.

### Technical Debt

1. **Bundle size** — [dist/assets/index-*.js](dist/) is 2,148 kB / 591 kB gzip. Defer to Sprint 6.3 but budget it properly.
2. **Trawler.tsx uses primitive geometry** (Sprint 1 carry-forward, unchanged).
3. **`wheelInputState.ts` side-channel pattern** (Sprint 2 observation) — still localized, not proliferating. Watch in Sprint 4.
4. **`Chartplotter.tsx` mounts/unmounts the map on every 3D↔Chart toggle** — acceptable for MVP. Consider hiding rather than unmounting in Sprint 6.3 polish if toggling becomes common.

### CLAUDE.md Updates

Add to the "Specific Technical Gotchas" section:

```markdown
### Worktree bootstrap

This repo uses git worktrees at `.claude/worktrees/<branch>/`. Each worktree has its own `node_modules` — they are NOT shared with the parent repo. On the first session in a fresh worktree, run:

```bash
npm install --legacy-peer-deps
```

Vitest will work without this (it resolves up to the parent), but `npm run build` will fail with `[vite:load-fallback] Could not load .../node_modules/three` because `vite.config.ts` uses `path.resolve(__dirname, './node_modules/three')` which expects node_modules in the worktree root.
```

Add to the "Git Conventions" section:

```markdown
### Git identity in worktrees

Worktrees inherit git state from the parent repo but NOT git config (no `user.name` / `user.email`). Commits will fail with "Author identity unknown". Per CLAUDE.md "NEVER update the git config", the approved workaround is inline per-command config:

```bash
git -c user.name="Matt Krieger" -c user.email="matt@k-analytics.com" commit -m "..."
```

Do not `git config user.name ...` — that writes to `.git/config` and counts as updating config.
```

### PRD Corrections

None. The PRD's Sprint 3 spec matched reality. The only "deviation" was executing 3.4 before 3.3, which was documented in the Sprint 3 plan's Risk & Notes — not a PRD error, just an execution-order optimization that the PRD didn't prescribe.

---

## Sprint 4 Readiness Check

Sprint 4 (Port loading + grounding) prerequisites:

- [x] `src/data/ports.ts` exports 21 typed entries with `glbPath` convention
- [x] Coordinate bridge available via `useCoordinateBridge()` — needed for 4.1 port loader distance checks
- [x] Chartplotter renders real PNW coastlines + markers + route
- [x] Boat position updates flow through bridge end-to-end (verified by seeing red marker in Elliott Bay)
- [x] Turf.js in active use (`distance`, `bearing`, `greatCircle`, `point`) — 4.2 grounding will add `nearestPointOnLine`
- [x] Scene router in place so GameOver scene (4.4) can slot in without further App.tsx changes
- [x] 69 unit tests passing, build clean

**Green light to plan Sprint 4.**
