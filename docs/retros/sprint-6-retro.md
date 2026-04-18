# Sprint 6 Retrospective

**Date:** 2026-04-17
**Sprint Goal:** Main Menu + Polish — live-3D menu background, scene transitions + pause menu, visual polish pass (fog/tone mapping/HUD overlap/1 nm alignment/touch-targets/code-split), iPad install meta + docs
**Status:** Complete (code). Device verification (fps, 20-voyage soak, touch-icon PNG) pending owner-run on iPad Air.
**Health:** 🟡 Bumpy

---

## Health Summary

```
SPRINT 6 HEALTH SUMMARY
════════════════════════════════════════

Tasks Completed:        4 / 4  (6.1, 6.2, 6.3 [split a/b], 6.4 code-side)
Tasks Partially Done:   6.4 — device fps check + 20-voyage soak
                              + apple-touch-icon.png deferred to owner
Tasks Skipped:          Palette token migration (within 6.3b, deliberate
                        scope cut per plan's mid-sprint checkpoint)

Issues Encountered:     6
  - Failed Approaches:  0
  - Repeated Attempts:  1 (Windows filename casing — same bug as
                         Sprint 5, lesson was in CLAUDE.md but
                         didn't get applied)
  - Diversions:         2 (pre-sprint: user asked for Sprint 6 from
                         main; had to locate the worktree. Mid-sprint:
                         dropped palette tokens from 6.3b.)
  - Unexpected Errors:  0
  - PRD Deviations:     0
  - Missing Prereqs:    1 (main branch manifest stale — showed only
                         Sprints 1-2 complete when work for 3-5 was on
                         worktree)
  - Dependency Issues:  0
  - Plan Errors:        1 (plan cited non-existent resetForNewVoyage())
  - Protocol Breaches:  1 (four sub-tasks in one session, vs.
                         CLAUDE.md one-per-session rule)

Overall Sprint Health:  🟡 Bumpy

Top 3 Time Sinks:
1. Pre-sprint plan-mode confusion over worktree vs main branch
2. Windows filename casing regression (readme.md) — required fixup commit
3. Scope re-scoping mid-6.3 (split into 6.3a/6.3b)
```

Functionally clean — all four sub-task deliverables shipped, tests green throughout (140 → 144), initial bundle halved (599→309 KB gzipped), no console errors in any commit. What drags this to 🟡 rather than 🟢:

- Same Windows filename-casing bug as Sprint 5, the lesson from that retro was explicitly in CLAUDE.md, I read CLAUDE.md at start of session and still repeated it. Classic "read ≠ internalized."
- Plan contained a wrong identifier (`resetForNewVoyage()`) that should have been caught during planning; would have mattered more if TDD in 6.2 hadn't surfaced it immediately.
- One session did four sub-tasks (plus a fixup) against the explicit one-per-session rule. User-directed, but worth naming: code quality held, but the risk of fatigue-driven mistakes was real and showed up in the casing regression.

---

## Issues

### Issue: Main branch manifest stale; Sprints 3-5 work lived on a worktree

**Category:** Missing Prerequisite

**Sprint Task:** Pre-6.1 / planning

**What happened:**
User invoked `/sprint-plan 6` from main. The main branch manifest showed Sprints 1-2 complete; the repo on `main` only contained code through sub-task 2.4. I initially pushed back telling the user Sprint 6 was out of order. User corrected: Sprints 3-5 were done on a git worktree. Located the worktree at `.claude/worktrees/epic-kilby-817d94` (branch `claude/epic-kilby-817d94`) containing 3.1 through 5.4 + retros + updated manifest. All Sprint 6 work happened on that branch.

**Attempts made:**
1. `git log --oneline -30` on main — last commit was `sub-task 2.4`. Concluded 3-5 undone.
2. Surfaced the conflict to the user; they pointed me to the worktree.
3. `git worktree list` → confirmed second worktree with `sub-task 5.4` at HEAD.
4. Re-planned against worktree state.

**Resolution:** Planning and execution both proceeded on the worktree branch. Main is untouched and remains behind.

**Diverted from original plan?** No — plan wasn't finalized yet when this surfaced.

**Impact on sprint:**
- Time cost: Low-Medium (~5 minutes of back-and-forth before clarity)
- Code quality: N/A
- Technical debt: Yes — main branch is now 7 commits behind `claude/epic-kilby-817d94`. Eventually someone has to merge or cherry-pick to reconcile.

**Lesson for future sprints:**
If a worktree exists in `.claude/worktrees/`, treat it as the likely active branch regardless of what main says. Check `git worktree list` at session start. Also: future sprint-plan runs should read the manifest from the worktree, not from main.

---

### Issue: Plan referenced non-existent `resetForNewVoyage()`

**Category:** Plan Error (diversion documented in plan output)

**Sprint Task:** Task 6.2 (scene transitions + pause menu)

**What happened:**
The Sprint 6 plan file (`~/.claude/plans/eager-seeking-wombat.md`) specified that the pause menu's "Return to Main Menu" action should call `resetForNewVoyage()` on the store. That function does not exist. The store has `resetVoyageRuntime()` (for Try Again) and `resetEverything()` (for Main Menu); the latter internally sets `activeScene: 'menu'`.

**Attempts made:**
1. While implementing `pauseMenuActions.ts`, `grep` over `store.ts` for the cited identifier → not found.
2. Located the real names (`resetVoyageRuntime`, `resetEverything`) via Read of `src/state/store.ts`.
3. Cross-referenced `GameOverScene.tsx:onMainMenu` which already uses `resetEverything()` + `clearCollision()` — used the same pattern.

**Resolution:** `pauseMenuActions.returnToMenu()` calls `clearCollision() + resetEverything()`. Unit tests verify voyage state clears, active scene flips to `menu`, and `paused` is reset.

**Diverted from original plan?** Yes — function name corrected. Behavior-identical to the plan's intent.

**Impact on sprint:**
- Time cost: Low (~2 min — caught immediately by grep)
- Code quality: Clean (existing pattern reused)
- Technical debt: None

**Lesson for future sprints:**
When planning, verify every identifier cited against the actual file before writing to the plan. Grep-check. "The store probably has this" is a trap.

---

### Issue: Repeated the Windows filename-casing bug from Sprint 5

**Category:** Repeated Attempts (same class of bug as Sprint 5)

**Sprint Task:** Task 6.4 (README install section)

**What happened:**
Edited `README.md` (path I used in tool calls). On-disk filesystem is case-insensitive so the write succeeded, but git tracks the file as `readme.md` (lowercase). Commit 3dfcc19 (`sub-task 6.4`) staged only `index.html`; the README change was silently dropped from the commit. Same exact bug as Sprint 5 retro "CLAUDE.md filename casing split the chore commit in two." The CLAUDE.md section added after Sprint 5 explicitly warned about this. I read CLAUDE.md at session start and still didn't apply the lesson.

**Attempts made:**
1. `git add README.md`, commit → `git log -1 --stat` shows only 1 file changed.
2. `git status` → `modified: readme.md` (lowercase) still unstaged.
3. Second commit `cc91e6b` (`fix: stage readme install section (6.4 follow-up)`) staging `readme.md` (lowercase). Two commits for what should have been one.

**Resolution:** Two commits. Followed the Sprint 5 precedent: did NOT amend; created a new follow-up commit. Referenced the prior commit in the fix message.

**Diverted from original plan?** No — output content landed as planned, just in two commits.

**Impact on sprint:**
- Time cost: Low (~3 min)
- Code quality: Fine (content correct; just split)
- Technical debt: Minor cosmetic (sub-task 6.4 is now two commits: `sub-task 6.4: ...` + `fix: ...`)

**Lesson for future sprints:**
The existing CLAUDE.md prose isn't strong enough — I read it and still repeated the bug. Propose strengthening: when editing `.md` files on Windows, always invoke `git ls-files <pattern>` or `git status` and use the exact tracked name in tool calls. Consider adding a concrete "stop and check" step to the CLAUDE.md gotcha rather than just "be careful."

**Exact git output:**
```
$ git log -1 --stat
commit 3dfcc19 sub-task 6.4: iPad install meta tags and README install section
 index.html | 5 ++++-
 1 file changed, 4 insertions(+), 1 deletion(-)   # expected 2 files
$ git status
modified:   readme.md                              # silently unstaged
```

---

### Issue: Four sub-tasks in one session (CLAUDE.md protocol breach)

**Category:** Protocol Breach (user-directed)

**Sprint Task:** 6.1 through 6.4

**What happened:**
CLAUDE.md Session Protocol and `.claude-session` both mandate "one sub-task per session." User explicitly said "continue" after 6.1, after 6.2, after 6.3a, and after 6.3b. I obliged each time, ultimately shipping 6.1, 6.2, 6.3a, 6.3b, 6.4 + a fixup in a single session — five commits against the explicit one-commit-per-session policy.

**Attempts made:**
1. Stopped after 6.1 and flagged the rule.
2. Stopped after 6.2 and flagged the rule again.
3. Stopped after 6.3a and flagged the rule again, specifically warning 6.3b is high-risk.
4. Continued when user said "continue" each time.

**Resolution:** User override accepted. Code quality held (tests green throughout, build green throughout, no regressions), but the Windows filename bug (above) happened on the fourth sub-task, which is the fatigue profile these rules exist to guard against.

**Diverted from original plan?** Yes — plan was paced one-per-session; shipped in one session.

**Impact on sprint:**
- Time cost: Arguably negative (saved elapsed wall time)
- Code quality: Net OK — 144/144 tests green, build green, bundle improved
- Technical debt: The casing bug might be causally attributable

**Lesson for future sprints:**
When user overrides one-per-session explicitly, push back once (done), then proceed but raise the bar on self-checks — specifically around filename casing on Windows, and git-status reads before/after each commit. Don't just trust that auto-commit succeeded.

---

### Issue: Palette token extraction cut from 6.3b (deliberate scope reduction)

**Category:** Diversion (documented in plan's mid-sprint checkpoint and in the commit message)

**Sprint Task:** Task 6.3b (visual polish — second half)

**What happened:**
The plan for 6.3 listed 7 items. Plan's own mid-sprint checkpoint anticipated a split into 6.3a (fog, tone mapping, HUD overlap, 1 nm alignment) and 6.3b (palette tokens, touch audit, code-split). I did the split as planned. Then in 6.3b, dropped the palette-token migration entirely because: (a) it's pure cosmetic churn with no functional change, (b) CSS-module cascade risk for zero user-visible benefit, (c) user had already overridden one-per-session several times and the fatigue curve was a concern. Two items shipped, one item deferred.

**Attempts made:**
1. Considered extracting 6-8 tokens (`--accent`, `--danger`, `--surface`, etc.) into `src/ui/tokens.css` with `:root` scope.
2. Reviewed all HUD/menu/pause/scene CSS — hex literals are consistent (`#2c2e73` accent, `#af4035` danger, `#e8e8e8` text) but distributed across 8+ files. Migration is ~50 line changes with no behavioral difference.
3. Decided the ratio of churn to value was not defensible this session. Documented the deferral in the commit message.

**Resolution:** Deferred. Flagged in Tech Debt for future cleanup commit (not blocking MVP).

**Diverted from original plan?** Yes. Plan listed 7 items; shipped 6 across 6.3a + 6.3b.

**Impact on sprint:**
- Time cost: None (saved time)
- Code quality: Neutral — the hex-literal status quo is functional
- Technical debt: Minor — if a future palette change is desired, it'll touch 8 CSS files instead of 1 tokens file

**Lesson for future sprints:**
Scope cuts in polish sprints are fine as long as they're pre-flagged and the reasoning is clear. The plan's mid-sprint checkpoint worked — it's a pattern worth repeating.

---

### Issue: R3F default tone mapping is already ACES (6.3a change partially no-op)

**Category:** Diversion / minor learning

**Sprint Task:** Task 6.3a (tone mapping)

**What happened:**
Plan spec'd setting `gl={{ toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}` on the R3F Canvas. Implementing this, I confirmed that R3F 9's default `gl` config already sets `toneMapping: ACESFilmicToneMapping`. So the code change is mostly a documentation/explicit-pinning exercise rather than a visual change. Exposure was kept at 1.0 (default) rather than 1.1 — bumping exposure without a visual sanity check felt premature.

**Resolution:** Change landed as explicit pinning. Adds no visual difference today, but gives a documented lever for future per-scene exposure tuning.

**Diverted from original plan?** Minor — plan suggested 1.1 exposure; shipped 1.0.

**Impact on sprint:**
- Time cost: None
- Code quality: Fine (explicit > implicit for tone mapping is defensible)
- Technical debt: None

**Lesson for future sprints:**
When the plan says "set X", verify the default state first. If it's already the desired value, either skip the change or document the pin with a comment explaining why it's there.

---

## Recommendations

### Carry-Forward Items

1. **Device verification (owner-action)** — three items from 6.4 still need Matt + iPad:
   - 60 fps sustained in clear weather with 2 ports loaded (PRD §16)
   - 20-voyage crash-free soak (PRD §16)
   - Drop a 180×180 PNG at `public/apple-touch-icon.png` and add `<link rel="apple-touch-icon" ...>` in `index.html` (README §Playing on iPad has the snippet)

   Sprint 6 is NOT fully closed until these check off. Owner should do a `/sprint-retro 6 amend` or just update this file when complete. The manifest row has been updated to "Complete (code)" / retro date 2026-04-17 to flag the nuance.

2. **Main branch reconciliation** — `main` is 7 commits behind `claude/epic-kilby-817d94`. Options: (a) fast-forward merge `main` ← worktree branch, (b) cherry-pick per sprint boundary. Owner decision. Probably do after device verification so the shipping branch is definitively one-and-done.

3. **Palette token migration** — deferred from 6.3b. Not MVP-blocking. Suitable as a tiny standalone cleanup commit post-launch: extract tokens to `src/ui/tokens.css`, migrate the ~50 hex-literal sites to `var(--accent)` etc.

### Technical Debt

1. **`src/ui/wheelInputState.ts`** — Sprint 2 debt. Module-level mutable state for input coordination. Still works; still violates the "state lives in Zustand" convention. Only tighten if a third input driver appears.

2. **`src/boat/Trawler.tsx`** — placeholder primitive geometry since Sprint 1. MVP-acceptable; real GLB lands post-launch.

3. **Port GLBs** — only `seattle.collision.json` exists; no real GLBs yet. Soft-launch needs Seattle, Friday Harbor, Juneau visual GLBs. Blender workstream, not Claude-Code scope.

4. **Main branch 7 commits behind `claude/epic-kilby-817d94`** — see Carry-Forward #2.

5. **Palette tokens not extracted** — `src/ui/Hud.module.css`, `src/scenes/Menu.module.css`, `src/scenes/VoyageSetup.module.css`, `src/scenes/GameOver.module.css`, `src/ui/PauseMenu.module.css` all carry duplicated hex literals.

6. **Sub-task 6.4 split across two commits** (`3dfcc19` + `cc91e6b`) due to the casing regression. Cosmetic only.

### CLAUDE.md Updates

Strengthen the existing "Windows filename case sensitivity" section with a concrete process step. Current text warns; the fix is to add a verification:

```markdown
### Windows filename case sensitivity (strengthened after Sprint 5 + 6 repeat)

On Windows, git preserves the original case of tracked files even though the
filesystem is case-insensitive. A write to `README.md` succeeds on disk,
but `git add README.md` will silently drop the change if the tracked name
is `readme.md`.

**Before editing any .md or root-level config file, run:**

```bash
git ls-files --error-unmatch -- '*<filename-stem>*' 2>/dev/null || git status
```

Use the exact casing that appears in git's output for all subsequent tool
calls (Read, Edit, Write, git add). If you have already written to the
wrong case, `git status` will show the lowercase/original name as modified
— stage from that name.

This bug has now hit twice (Sprint 5 chore, Sprint 6 sub-task 6.4). The
cost is a split commit + a `fix:` follow-up each time.
```

### PRD Corrections

None new this sprint. The Sprint 5 retro's proposed §12.5.3 correction (no `WeatherManager.tsx` — replaced by pure `weatherPresets` module) is still unapplied; worth bundling with a future PRD maintenance commit. Sprint 6 did not contradict the PRD anywhere.

---

## Sprint 7 / Post-MVP Readiness Check

There is no Sprint 7 in the PRD — Sprint 6 is the final MVP sprint. The relevant checklist is PRD §16 Success Criteria:

- [x] Launch screen matches art direction (live-3D menu with trawler + water + sky) — 6.1
- [x] Full app navigation works: Menu → Setup → Voyage → GameOver → Menu, with pause — 6.2
- [x] Pause menu: Resume + Return to Main Menu (Settings deferred — nothing to expose in MVP) — 6.2
- [x] Ship-quality visual: per-weather fog, tone mapping pinned, palette alignment (partial — hex literals left in place) — 6.3a
- [x] HUD overlap at iPad widths resolved — 6.3a
- [x] Time compression cap indicator matches physics (1 nm, not 5 km) — 6.3a
- [x] All interactive elements ≥ 48×48 pt — 6.3b
- [x] Initial bundle < 2 MB gzipped (hit 309 KB) — 6.3b
- [x] Add-to-Home-Screen meta tags + install docs — 6.4
- [ ] 60 fps clear weather, 2 ports loaded on iPad Air — OWNER-PENDING
- [ ] 20-voyage zero-crash soak — OWNER-PENDING
- [ ] apple-touch-icon.png in place — OWNER-PENDING (optional)
- [ ] 3 real port GLBs (Seattle / Friday Harbor / Juneau) — OWNER-PENDING (Blender)

**Green light to declare MVP code-complete.** Device verification and asset delivery remain.
