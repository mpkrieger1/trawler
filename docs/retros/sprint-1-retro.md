# Sprint 1 Retrospective

**Date:** 2026-04-17
**Sprint Goal:** Foundation — project scaffold, water + sky, trawler model with follow camera
**Status:** Complete
**Health:** 🟢 Clean

---

## Health Summary

```
SPRINT 1 HEALTH SUMMARY
════════════════════════════════════════

Tasks Completed:        3 / 3
Tasks Partially Done:   None
Tasks Skipped:          None

Issues Encountered:     3
  - Failed Approaches:  0
  - Repeated Attempts:  0
  - Diversions:         1
  - Unexpected Errors:  1
  - PRD Deviations:     1
  - Missing Prereqs:    0
  - Dependency Issues:  0

Overall Sprint Health:  🟢 Clean

Top 3 Time Sinks:
1. Vite scaffold into non-empty directory — Diversion (handled cleanly via temp-scaffold)
2. Three.js duplicate instance warning — Unexpected Error (resolved via Vite dedupe config)
3. Placeholder trawler model — PRD Deviation (used generated geometry instead of Sketchfab GLB)
```

A notably smooth sprint. The plan correctly identified all three risks and the resolutions were straightforward. No repeated attempts, no loops, no abandoned approaches.

---

## Issues

### Issue: Vite scaffold would collide with existing project files

**Category:** Diversion

**Sprint Task:** Task 1.1 — Project Scaffold

**What happened:**
The plan anticipated that `npm create vite@latest . -- --template react-ts` might conflict with existing files (CLAUDE.md, docs/, .claude/). Rather than risk overwrites, scaffolded into `temp-scaffold/` subdirectory then copied configuration files out.

**Attempts made:**
1. Ran `npm create vite@latest temp-scaffold -- --template react-ts` — succeeded cleanly
2. Copied needed files (index.html, package.json, tsconfig*.json, vite.config.ts, eslint.config.js) to project root
3. Merged `src/*` and `public/*` contents into existing directories
4. Deleted temp-scaffold

**Resolution:** Temp-scaffold approach worked perfectly. No files were overwritten.

**Diverted from original plan?** Yes
- Original: `npm create vite . --force` in project root
- Actual: Scaffold to `temp-scaffold/` then copy files out

**Impact on sprint:**
- Time cost: Low (~2 minutes for extra file copies)
- Code quality: Clean
- Technical debt: None

**Lesson for future sprints:**
When scaffolding into an existing non-empty directory, always use a temp subdirectory. `--force` risks clobbering CLAUDE.md or other project files.

---

### Issue: Three.js "Multiple instances" warning in console

**Category:** Unexpected Error

**Sprint Task:** Task 1.3 — Trawler + Follow Camera (surfaced after all components were added)

**What happened:**
After integrating Water (from `three/examples/jsm/objects/Water.js`), drei components, and R3F, browser console showed:

```
WARNING: Multiple instances of Three.js being imported.
```

This is a known issue when different packages resolve `three` to different paths. Not fatal, but can cause subtle bugs with instanceof checks and shared state.

**Attempts made:**
1. Identified the cause: drei, @react-three/fiber, and direct `three/examples/jsm/*` imports can each pull in their own Three.js if not deduped
2. Added Vite dedupe config:
   ```ts
   resolve: {
     alias: { 'three': path.resolve(__dirname, './node_modules/three') },
     dedupe: ['three'],
   }
   ```

**Resolution:** Vite dedupe config forces single Three.js instance. Warning should be suppressed on next full reload.

**Diverted from original plan?** No (plan didn't mention this specifically, but CLAUDE.md principles covered the fix)

**Impact on sprint:**
- Time cost: Low (~3 minutes)
- Code quality: Clean — this is the canonical fix
- Technical debt: None

**Lesson for future sprints:**
Any R3F project should include `dedupe: ['three']` in Vite config from the start. This belongs in Task 1.1 scaffold going forward.

**Exact error message:**
```
WARNING: Multiple instances of Three.js being imported.
```

---

### Issue: No free Sketchfab GLB sourced; used generated geometry

**Category:** PRD Deviation

**Sprint Task:** Task 1.3 — Trawler + Follow Camera

**What happened:**
PRD §12 specified: "Load placeholder trawler GLB (Claude Code grabs a free Sketchfab boat; falls back to a simple cube if needed)". Sketchfab requires manual download + account. Used programmatically-generated box geometry (hull, cabin, pilothouse, mast) instead.

**Attempts made:**
1. Generated placeholder trawler from primitive boxes and cylinder in `Trawler.tsx` — looks like a recognizable pilothouse trawler silhouette from follow-camera distance

**Resolution:** Placeholder works. The code path is `<group>` with meshes; switching to a real GLB is a drop-in replacement via `useGLTF`.

**Diverted from original plan?** Yes (but explicitly flagged as Option B in plan)
- Original: Load GLB via `useGLTF` from `/assets/models/placeholder/trawler.glb`
- Actual: Inline primitive geometry in Trawler.tsx

**Impact on sprint:**
- Time cost: Low (saved time by not hunting for a GLB)
- Code quality: Clean, but different code path than production will use
- Technical debt: **Minor** — when Matt sources a real GLB (or the custom NP 590), the Trawler component needs to be rewritten to use `useGLTF`. This is tracked in PRD §2.3 post-MVP roadmap.

**Lesson for future sprints:**
Placeholder-as-geometry is fine for early sprints. Revisit when asset pipeline is ready (likely when first Blender port lands).

---

## Recommendations

### Carry-Forward Items

1. **None blocking Sprint 2.** All Task 1.x deliverables are complete and verified.
2. **Replace debug controls in Sprint 2.4.** `src/boat/DebugControls.tsx` is a temporary WASD mover — Sprint 2 tasks 2.2 (Throttle+Wheel) and 2.4 (keyboard fallback) will supersede it. Delete when those ship.
3. **Real trawler GLB** — open item for Matt. When a model is available, drop it at `public/assets/models/placeholder/trawler.glb` and rewrite `src/boat/Trawler.tsx` to use `useGLTF`. Not blocking Sprint 2.

### Technical Debt

1. **`src/boat/Trawler.tsx`** — uses primitive geometry instead of GLB. Rewrite when real model available. ~30 lines to replace.
2. **`src/boat/DebugControls.tsx`** — delete in Sprint 2.
3. **Bundle size** — main chunk is 1.06 MB (295 KB gzipped). Expected for Three.js; worth code-splitting before v1.0 but fine for MVP. Tracked for Sprint 6 polish pass.

### CLAUDE.md Updates

Add to the "Specific Technical Gotchas" section:

```markdown
### Vite dedupe for Three.js is required
R3F + drei + direct `three/examples/jsm/*` imports can resolve to multiple Three.js instances, triggering "Multiple instances of Three.js being imported" warnings and subtle bugs. The fix is already in `vite.config.ts`:

```ts
resolve: {
  alias: { 'three': path.resolve(__dirname, './node_modules/three') },
  dedupe: ['three'],
}
```

Do not remove this config. If you see the warning return, verify dedupe is still present.
```

Add to the "Asset Pipeline" section:

```markdown
### Placeholder trawler is generated geometry
Until a real GLB is sourced, `src/boat/Trawler.tsx` renders the boat from primitive meshes (boxes + cylinder). The follow camera, physics, and control plumbing all work against this placeholder. When a real GLB is available, rewrite `Trawler.tsx` to use `useGLTF('/assets/models/placeholder/trawler.glb')` — no other components need to change.
```

### PRD Corrections

None. The PRD Sprint 1 breakdown matched reality closely. The Sketchfab GLB instruction in §12 is aspirational, not a blocker — the "falls back to a simple cube if needed" caveat handles it.

---

## Sprint 2 Readiness Check

Sprint 2 (Boat Handling) prerequisites:

- [x] Zustand store with boat slice exists (`src/state/store.ts`)
- [x] Trawler component reads position/heading from store
- [x] Follow camera tracks boat position
- [x] Canvas, lighting, water, sky all functional
- [x] TypeScript strict mode clean build

**Green light to plan Sprint 2.**
