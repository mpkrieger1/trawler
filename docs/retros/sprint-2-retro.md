# Sprint 2 Retrospective

**Date:** 2026-04-17
**Sprint Goal:** Boat Handling — physics, HUD controls, keyboard fallback, gauge strip
**Status:** Complete
**Health:** 🟡 Bumpy

---

## Health Summary

```
SPRINT 2 HEALTH SUMMARY
════════════════════════════════════════

Tasks Completed:        4 / 4
Tasks Partially Done:   None
Tasks Skipped:          None

Issues Encountered:     4
  - Failed Approaches:  2 (throttle detent fight, wheel spring-back fight)
  - Repeated Attempts:  0
  - Diversions:         1 (removed DebugControls in 2.3 instead of 2.4)
  - Unexpected Errors:  0
  - PRD Deviations:     0
  - Missing Prereqs:    0
  - Dependency Issues:  0
  - Physics math error: 1 (caught by TDD — time-constant misinterpretation)

Overall Sprint Health:  🟡 Bumpy

Top 3 Time Sinks:
1. Wheel spring-back racing with keyboard input — Failed Approach
2. Throttle detent-snap useEffect preventing keyboard ramp — Failed Approach
3. Physics time-constant interpretation error — caught by TDD first run
```

Not a clean sprint. All four tasks shipped, tests/build are green, and the end-to-end experience works — but two real bugs required rework (one mid-sprint architectural change) and a physics math error would have shipped if tests hadn't caught it. This is what the 🟡 is for: the plan was solid, but the implementation hit friction the plan didn't anticipate — specifically, coordination between multiple input sources (pointer drag + keyboard hold) writing to the same store field.

---

## Issues

### Issue: Physics exponential time-constant misinterpretation

**Category:** Failed Approach (caught by TDD before commit)

**Sprint Task:** Task 2.1 — Physics Module

**What happened:**
PRD §7.2 states "0→cruise: ~30 sec; cruise→stop: ~45 sec coasting." I initially used these values directly as the exponential time constant τ in `velocity = target + (current - target) × exp(-dt/τ)`. That's wrong: with τ=30s, velocity reaches only ~63% of target after 30s, not "cruise."

**Attempts made:**
1. First impl: `ACCEL_TIME_SEC = 30`, `DECEL_TIME_SEC = 45` used directly as τ. Test "throttle 0.75 for ~30s approaches cruise velocity" failed — got 2.997 m/s, expected > 3.086 (cruise × 0.75). Test "coasting from cruise" failed similarly.
2. Corrected impl: `ACCEL_TIME_SEC = 10`, `DECEL_TIME_SEC = 15` so that after PRD-stated 3τ the velocity is ~95% of target. All 10 tests green.

**Resolution:** Changed constants, added explaining comment in code.

**Diverted from original plan?** No — this was a math error in implementation, not a plan deviation.

**Impact on sprint:**
- Time cost: Low (~5 minutes; TDD caught it immediately)
- Code quality: Clean — correct math with explanatory comment
- Technical debt: None

**Lesson for future sprints:**
When the PRD gives a spec like "time to reach X," translate it to ~3τ for exponential responses. This is the value of TDD — the test expressed the PRD requirement literally, and exposed the math error on first run.

**Exact error message:**
```
AssertionError: expected 2.9971638421473905 to be greater than 3.0864
AssertionError: expected 1.084754942773955 to be less than 0.82304
```

---

### Issue: Throttle detent-snap useEffect prevented keyboard ramp

**Category:** Failed Approach

**Sprint Task:** Task 2.2 implementation bug, discovered during Task 2.4 integration test

**What happened:**
`Throttle.tsx` had a `useEffect` that ran whenever `throttle` changed:
```ts
useEffect(() => {
  if (!dragging) {
    const final = snapToDetent(throttle)
    if (final !== throttle) setThrottle(final)
  }
}, [dragging, throttle, setThrottle])
```

When keyboard ramped throttle from 0 to 0.008, `snapToDetent(0.008)` returned 0 (within detent tolerance), and the effect wrote 0 back — every frame. Result: the keyboard could never increment throttle beyond the detent tolerance near zero, so "W" key did nothing visible. Gauge stayed at "0.0 kt."

**Attempts made:**
1. Initial test via `preview_eval` dispatching `keydown W` for 2s, then 3s — gauges still read 0.0 kt. Thumb stayed at dead-center.
2. Added probe for keyboard handler firing at all (confirmed events dispatch correctly).
3. Traced the data flow: store writes from KB were happening, but Throttle's effect was reverting them.
4. Fixed by moving the snap-to-detent logic out of useEffect and into `onPointerUp` only. Removed the `dragging` state hook since it was unused elsewhere.

**Resolution:** Detent snapping only happens on pointer release, not on every throttle change.

**Diverted from original plan?** No — plan said "on drop near a detent (within 0.05), snap to it." Implementation incorrectly snapped on every state change.

**Impact on sprint:**
- Time cost: Medium (~10 minutes debugging + refactor)
- Code quality: Clean — simpler than before (removed unused state)
- Technical debt: None

**Lesson for future sprints:**
Effects that react to store changes and write back to the same field are high-risk. Prefer event-driven writes at the UI boundary (onPointerUp) to effects that watch derived state. Also: when a control feels dead, check what else is writing to its store field.

---

### Issue: Wheel spring-back race condition with keyboard wheel hold

**Category:** Failed Approach (required architectural change)

**Sprint Task:** Task 2.4 integration — discovered during end-to-end keyboard test

**What happened:**
`Wheel.tsx` ran its own rAF spring-back loop that decayed `wheel` toward 0 whenever it wasn't being dragged by the pointer. Separately, `KeyboardControls.tsx` set `wheel` to ±0.5 every frame while A or D was held. Both ran every frame, both wrote to `wheel`. The spring-back decayed the KB write before the next KB frame could restore it. Observable effect: holding `D` at cruise for 10s produced only ~5° of heading change when physics predicted ~10°.

**Attempts made:**
1. First observation: `preview_eval` holding D for 10s. Expected heading change ≈ 10°, got 5°.
2. Root-cause analysis: `Wheel.tsx` spring-back rAF was decaying wheel continuously while `KeyboardControls.tsx` tried to hold it. The two loops didn't know about each other.
3. Considered solutions:
   - (a) Remove per-frame KB writes and only write on keydown/keyup edges — rejected: spring-back would still decay while key held.
   - (b) Rely on rAF callback ordering — rejected: fragile under React StrictMode double-mount.
   - (c) Shared flag indicating "wheel is being actively driven" — chosen.
4. Created `src/ui/wheelInputState.ts` with two flags: `pointerDragging` and `keyboardHolding`. Wheel.tsx sets `pointerDragging` in its pointer handlers. KeyboardControls.tsx sets `keyboardHolding` and owns the centralized spring-back, which only runs when both flags are false.

**Resolution:** After refactor, 10s of `D` at cruise produced ~11° of heading change — matches physics prediction (within rounding).

**Diverted from original plan?** Yes.
- Original Task 2.2 plan: Wheel.tsx owns pointer + spring-back locally.
- Actual: Wheel.tsx owns pointer drag only. KeyboardControls.tsx owns keyboard input AND the shared spring-back. Coordination via module-level `wheelInputState.ts`.

**Impact on sprint:**
- Time cost: Medium-High (~15-20 minutes debugging + refactor + re-verification)
- Code quality: Cleaner than original — single source of spring-back authority
- Technical debt: **Minor** — `wheelInputState.ts` is module-level mutable state, not in Zustand. Works fine, but if a third input driver (e.g., gamepad) is added it will need to plug into this flag set. Could be formalized into store if it grows.

**Lesson for future sprints:**
When multiple input sources write to the same store field, they must coordinate explicitly. Don't rely on frame ordering or "last write wins" — make the coordination visible. This lesson applies to any future work: throttle, time-compression, camera mode if they end up with more than one driver.

---

### Issue: Deleted DebugControls in Task 2.3 instead of 2.4

**Category:** Diversion

**Sprint Task:** Task 2.3 — Wire Physics Loop

**What happened:**
Plan said: "Don't delete DebugControls.tsx yet — will delete in 2.4 after verifying keyboard works." Kept the file but removed the `<DebugControls />` import and usage from `App.tsx` in Task 2.3, since the HUD throttle + physics loop already worked. Then in 2.4 after keyboard was wired, deleted the file.

**Attempts made:**
1. Removed the import/usage from App.tsx in Task 2.3 (left the file on disk).
2. Deleted the file entirely in Task 2.4.

**Resolution:** Not actually a problem — the "sanity backup" intent was to have a fallback if HUD didn't work; HUD worked fine.

**Diverted from original plan?** Yes — the plan wanted DebugControls mounted through 2.3 as a safety net. I removed it earlier.

**Impact on sprint:**
- Time cost: None
- Code quality: Fine
- Technical debt: None

**Lesson for future sprints:**
Minor. If plan specifies a safety net, either keep it or explicitly note its removal in the commit. I did the latter implicitly.

---

## Recommendations

### Carry-Forward Items

1. **No blocking items.** Sprint 2 shipped complete.
2. **`wheelInputState.ts` may need to move into the store** if a third input source (gamepad, touchscreen gesture, remote control) is added. Not a Sprint 3 blocker.
3. **DebugControls cleanup** is done.

### Technical Debt

1. **`src/ui/wheelInputState.ts`** — module-level mutable state for input coordination. Works but breaks the "state lives in Zustand" convention from CLAUDE.md. Low priority; revisit if another input driver is added.
2. **Bundle size** — still 1.06 MB (297 KB gzipped). Carried from Sprint 1. Defer to Sprint 6 polish pass.
3. **`Trawler.tsx` placeholder geometry** — still unchanged. Not affected by Sprint 2 work.

### CLAUDE.md Updates

Add to the "Specific Technical Gotchas" section:

```markdown
### Exponential time constants vs. PRD spec times
When the PRD specifies "time to reach X" for an exponential response (throttle response, camera lerp, shader fade), the exponential time constant τ is roughly spec_time / 3. With τ = spec_time / 3, velocity/value reaches ~95% after the spec time. Using spec_time directly as τ leaves you at ~63%, which reads as "the boat never reaches cruise." Tests encoded from PRD spec times will fail in exactly this way — use TDD to catch it.

### Multiple input sources writing to the same store field must coordinate
When two input drivers (e.g., pointer drag + keyboard hold) can both write to the same store field, they must coordinate or they'll race. Symptoms: "the control does ~50% of what it should," "feels laggy," "holds don't hold." The established pattern in this project: a small module-level flag object (see `src/ui/wheelInputState.ts`) that each driver sets while active, with a single authority for passive behavior (spring-back, idle decay) that checks the flags. If you find yourself adding a second writer to an existing store field, look for an existing flag module first; if none, add one rather than duplicating rAF loops.
```

### PRD Corrections

None. PRD §7.2 uses "~30 sec" which is ambiguous between "time constant" and "time to reach," but this is a common shorthand in spec docs and TDD catches the ambiguity. No change needed.

---

## Sprint 3 Readiness Check

Sprint 3 (MapLibre + voyage setup) prerequisites:

- [x] Boat has a working position/heading driven by physics
- [x] Store has voyage slice (startPortId, destinationPortId, weather, departureTime)
- [x] Store has UI slice (activeScene) for scene transitions
- [x] Gauge strip exists — will extend for chart data later
- [x] TypeScript strict, 28 tests green, clean production build

**Green light to plan Sprint 3.**

Sprint 3 introduces MapLibre (new dependency domain) and a new scene system. Main new risk: the MapLibre/R3F coordinate bridge (Task 3.4) crosses the system boundary CLAUDE.md warns about. Plan carefully.
