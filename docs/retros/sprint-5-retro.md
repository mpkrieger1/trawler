# Sprint 5 Retrospective

**Date:** 2026-04-17
**Sprint Goal:** Tides + Weather + Time Compression — tide model, currents drift + chart arrows, weather-driven water/sky/wind/pitchroll, compression with auto-slowdown
**Status:** Complete
**Health:** 🟢 Clean

---

## Health Summary

```
SPRINT 5 HEALTH SUMMARY
════════════════════════════════════════

Tasks Completed:        4 / 4 (plus 1 pre-sprint chore)
Tasks Partially Done:   None
Tasks Skipped:          None

Issues Encountered:     3
  - Failed Approaches:  0
  - Repeated Attempts:  0
  - Diversions:         0
  - Unexpected Errors:  2 (filename casing bug, test-timing false alarm)
  - PRD Deviations:     1 (no dedicated WeatherManager.tsx — planned)
  - Missing Prereqs:    0
  - Dependency Issues:  0

Overall Sprint Health:  🟢 Clean

Top 3 Time Sinks:
1. Filename casing split chore into two commits — Unexpected Error
2. False-alarm on time-compression verification (30-frame warmup) — Unexpected Error
3. (no third significant time sink — sprint was otherwise smooth)
```

Sprint 5 was the second consecutive first-pass-clean sprint. All four sub-tasks shipped in planned order (chore → 5.1 → 5.2 → 5.3 → 5.4). 33 new unit tests (140 total passing). End-to-end verification confirmed: 0.6 m/s Seattle flood current drifts the boat correctly north; three weather states are visibly distinct with pitch/roll and shader changes; 30× compression in open water advances gameTime exactly 30× per real second; near-port auto-slows to 1×; stormy caps at 5×. Zero console errors throughout. The long-overdue CLAUDE.md + PRD doc updates finally landed as a pre-sprint chore (despite a filename casing snag).

---

## Issues

### Issue: CLAUDE.md filename casing split the chore commit in two

**Category:** Unexpected Error

**Sprint Task:** Pre-5.1 chore — apply retro-recommended CLAUDE.md + PRD updates

**What happened:**
The tracked filename in git is `claude.md` (all lowercase), but I staged the file as `CLAUDE.md` in the first chore commit. On Windows the filesystem is case-insensitive, so the Edit tool wrote to the correct file on disk, but `git add CLAUDE.md` did not stage the modification under the tracked lowercase name. The resulting commit a418688 only contained the PRD corrections (1 file, 2 insertions / 1 deletion) — the CLAUDE.md additions were left uncommitted in the working tree.

**Attempts made:**
1. Ran `git add CLAUDE.md docs/prds/Trawler-Captain-PRD.md && git commit …` → commit succeeded but only captured the PRD file; `git log --stat -1` revealed 1 file changed.
2. Checked with `git status` → "modified: claude.md" (lowercase) still unstaged.
3. Confirmed with `ls -la claude.md CLAUDE.md` — on Windows both names resolve to the same file; `git ls-files | grep -i claude.md` returned only `claude.md`.
4. Made a second chore commit `8eac3cc` staging `claude.md` (lowercase) plus the Sprint 5 manifest row. Two chore commits instead of one.

**Resolution:** Two chore commits. Not amended per CLAUDE.md git safety rule ("NEVER amend"). Both commits reference each other in their messages.

**Diverted from original plan?** No — output landed as planned; just in two commits instead of one.

**Impact on sprint:**
- Time cost: Low (~3 min to diagnose + re-commit)
- Code quality: Clean — the committed content is identical; just split
- Technical debt: Mild cosmetic debt (`chore:` × 2 instead of × 1)

**Lesson for future sprints:**
On Windows, git preserves the original case of tracked files even though the filesystem is case-insensitive. Always match the case git reports in `git status` / `git ls-files` when staging. Alternative: rename the file to uppercase in git's view with `git mv claude.md CLAUDE.md` — but that's its own chore commit. Easiest pattern going forward is to stage by the tracked name shown in `git status`.

**Exact error (implicit from `git commit --stat`):**
```
 docs/prds/Trawler-Captain-PRD.md | 3 ++-
 1 file changed, 2 insertions(+), 1 deletion(-)
```
(expected: 2 files changed; 1 was silently missed because of casing mismatch)

---

### Issue: Time-compression verification looked broken on first try (test-timing issue)

**Category:** Unexpected Error (verification-tool timing, not code)

**Sprint Task:** Task 5.4 — Time compression

**What happened:**
First preview verification of 30× compression showed `gameTimeDelta = 4.33` over 2 real seconds (expected 60) and `compression = 2.16×` effective. Looked like compression was barely applying. Investigation revealed the issue was test timing, not implementation: the near-port proximity check runs every 30 frames (throttled in `boatPhysicsLoop.tsx`), so after `setBoatPosition([50_000, 0, 50_000])` to move boat to open water, the `isNearPortRef.current = false` update didn't take effect until the next 30-frame boundary (~500 ms). My 2-second measurement window captured both the "still showing as near Seattle → forced 1×" phase and the "detected as open water → 30×" phase, averaging to ~2.16×.

**Attempts made:**
1. Ran the 30× test without a warmup delay → got `delta1sec: 0.00, xDelta: 0.79` — confusingly zero
2. Verified `setGameTime` is wired correctly (`grep setGameTime` → present in store, physics loop calls it)
3. Traced that the boatPhysicsLoop's `isNearPortRef` is only updated every 30 frames (lines 27-30) and defaults to `false`, so the warmup matters
4. Re-ran with `await setTimeout(r, 1500)` between `setBoatPosition` and measurement → `gameTimeDelta` sampled 15.00, 15.01, 14.99, 15.50 per 500ms = exactly 30× per real second. ✓

**Resolution:** Added 1.5 s warmup to the verification sequence. Implementation was correct from the start.

**Diverted from original plan?** No — verification methodology adjusted, not implementation.

**Impact on sprint:**
- Time cost: Low (~5 min to diagnose)
- Code quality: N/A (no code changed)
- Technical debt: None

**Lesson for future sprints:**
When verifying a system that uses throttled state updates (proximity check, per-30-frames, debounced state), always allow at least one throttle cycle to elapse between test setup and measurement. Document this on the throttle site so future readers don't re-hit it.

---

### Issue: WeatherManager.tsx not implemented (planned PRD deviation)

**Category:** PRD Deviation (pre-flagged in plan)

**Sprint Task:** Task 5.3 — Weather system

**What happened:**
PRD §12.5.3 specifies a `WeatherManager.tsx` React component that centrally drives the weather effects. Sprint 5.3 instead distributed weather consumption across each affected component: Ocean, SkyDome, Trawler, and boatPhysicsLoop each read `weather` from the store and apply `weatherPreset(weather)` directly. The `src/world/weatherPresets.ts` module is the single source of truth for the mapping; no extra React component wraps it.

**Attempts made:**
1. Considered writing a thin `WeatherManager.tsx` R3F no-op component whose only role is to "own" the mapping — rejected as indirection without value.
2. Implemented the distributed approach; added the `weatherPresets` pure module with its own test file.

**Resolution:** Distributed. Documented in plan Risk & Notes and in the 5.3 commit message. Proposed as a PRD correction below.

**Diverted from original plan?** No — the deviation was in the plan from the start.

**Impact on sprint:**
- Time cost: None (net positive: simpler code, one less file)
- Code quality: Clean — `weatherPresets` is a small pure module with 7 unit tests
- Technical debt: None

**Lesson for future sprints:**
When the PRD specifies a centralization component that would just be an indirection layer over a pure-data mapping, prefer the distributed + pure-module approach. Flag as a PRD correction in the retro.

---

## Recommendations

### Carry-Forward Items

1. **None blocking Sprint 6** — all Task 5.x deliverables ship. Sprint 6 (main menu + polish) can proceed immediately.
2. **HUD layout overlap** (new) — the top-center `TimeCompressionToggle` touches the top-left `CameraToggle` at narrow window widths, and the "Throttle" label appears to overlap slightly with the compression toggle. Visible in preview screenshots. Minor polish target for Sprint 6.3 visual pass.
3. **Real trawler GLB** (Sprint 1) — still open.
4. **Real port GLBs** (Sprint 4) — still open; owner's Blender workstream.
5. **Bundle size** — still ~2.15 MB. Sprint 5 added ~10 kB of app code. Sprint 6.3 code-splitting remains load-bearing.
6. **PRD §12.5.3 correction proposed** (see below).

### Technical Debt

1. **[src/ui/Hud.module.css](src/ui/Hud.module.css) top-center / top-left overlap** — the `timeCompression` (top-center) and `cameraToggle` (top-left, 88 px wide + 20 px offset = 108 px taken) can visually collide at widths below ~900 px. Either shrink the cameraToggle, widen the left margin, or shift the time-compression selector lower. Defer to Sprint 6.3.
2. **Stale frame-counter refs in two loops** — `PortLoader` and `BoatPhysicsLoop` both use a `frameCountRef` modulo-N throttle for proximity checks. Convention is not documented; if a third place needs it, extract a shared `useFrameCounter(n)` hook. Not urgent.
3. **`loadedPortId !== null` used as a proxy for "near port" in `TimeCompressionToggle`** — it's actually a 5 km check (PortLoader), while the compression auto-slowdown uses a stricter 1 nm check in the physics loop. The HUD's visual cap indicator can flash green between 1 nm and 5 km when the effective cap isn't actually applying. Minor UX inconsistency — consider aligning both to the 1 nm threshold in a future polish pass.
4. **Trawler.tsx** — still primitive geometry (Sprint 1 debt).
5. **Bundle size** (Sprint 1 debt, now more load-bearing).

### CLAUDE.md Updates

Add a new section in "Git Conventions" (right after the existing "Git identity in worktrees" block added in Sprint 5's chore):

```markdown
### Windows filename case sensitivity

On Windows the filesystem is case-insensitive, but git preserves the original case of tracked files in its index. Editing a file via the uppercase name (e.g. `CLAUDE.md`) writes to disk successfully but `git add CLAUDE.md` will silently NOT stage the change if the tracked name is lowercase (`claude.md`). `git status` shows the tracked name — match it when staging.

Check with:
```bash
git ls-files | grep -i '^filename'
```

If you want to rename a tracked file to uppercase, use `git mv old.md NEW.md` as its own commit.
```

### PRD Corrections

1. **§12.5.3 Weather system** — remove the `WeatherManager.tsx` filename from the deliverable. Replace with: "`src/world/weatherPresets.ts` — pure mapping from weather state to rendering + physics params. Each consumer (Ocean, SkyDome, Trawler, boatPhysicsLoop) reads the preset directly from the store. No central React component is required."
2. *(No §12.5 path changes otherwise — the deliverables are equivalent in behavior.)*

---

## Sprint 6 Readiness Check

Sprint 6 (Main menu + polish) prerequisites:

- [x] Three distinct weather presets render visibly in the 3D scene — MenuScene 6.1 "background render of trawler in Elliott Bay" can reuse these
- [x] Scene router supports all four states (menu, voyageSetup, voyage, gameOver) — 6.2 pause menu wires into existing cameraMode / activeScene pattern
- [x] HUD overlay layout stable — 6.3 visual polish has a clear baseline
- [x] iPad touch targets all meet 48×48 px minimum where it matters (Throttle, Wheel, VoyageSetup buttons, compression segments)
- [x] Bundle size tracked (2.15 MB) — 6.3 code-splitting target is concrete
- [x] 140 tests passing, build clean
- [x] Sprint 3/4 CLAUDE.md debt finally closed in this sprint's chore commit

**Green light to plan Sprint 6.**
