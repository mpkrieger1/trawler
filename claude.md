# CLAUDE.md — Project Conventions & Working Guide

> **For Claude Code:** Read this file at the start of every session before doing anything else. It contains project conventions, architectural decisions, and session protocol that don't change. The PRD (`docs/prds/Trawler-Captain-PRD.md`) is the source of truth for *what* to build; this file is the source of truth for *how*.

---

## Project: Trawler Captain

A sandbox cruising simulator for the Pacific Northwest Inside Passage (Seattle to Juneau). Browser-based, React + Three.js, iPad-first. Owner plays on his own iPad; this is a personal project, not commercial software.

See `docs/prds/Trawler-Captain-PRD.md` for full spec. See `README.md` for reader-facing overview.

---

## Before You Start Any Session

1. **Read `docs/prds/Trawler-Captain-PRD.md`** — at minimum the sprint sub-task you're working on. It's the source of truth.
2. **Read this file** — project conventions below.
3. **Check current git state** — `git status` and `git log --oneline -5`. Do not start work on uncommitted changes.
4. **Confirm which sub-task** — the owner will tell you (e.g. "start sub-task 2.3"). If not specified, ask. Do not infer.
5. **Commit at session end** — one logical commit per sub-task, descriptive message.

---

## Tech Stack (Locked)

Do not substitute libraries. Do not upgrade or downgrade major versions without asking. The stack is:

```
React 19 + TypeScript + Vite 6
@react-three/fiber 9.x (requires React 19)
@react-three/drei 10.x (pairs with R3F 9)
three 0.169.x
maplibre-gl 5.x
zustand 5.x
@turf/turf 7.x
```

If `npm install` fails with peer dependency errors, use `--legacy-peer-deps`. Never resolve conflicts by downgrading.

---

## Architectural Principles

### 1. Library-first, not custom-first
This project uses well-maintained libraries for anything they solve adequately. Water shader = Three.js official `Water`. Map = MapLibre. Geometry math = Turf.js. State = Zustand. If you're about to write >50 lines of custom code for something a library does, stop and check first.

### 2. Visual and collision are separate assets
Ports ship as two files each:
- `{port}.glb` — rich 3D geometry you see (terrain, buildings, docks)
- `{port}.collision.json` — simplified outline + depth grid you collide against

Never derive collision from the GLB at runtime. The JSON is authoritative for physics.

### 3. Pure modules over React components when possible
Physics, tides, grounding detection, time compression — these are pure TypeScript modules with no React dependencies. Easier to test, easier to reason about, easier to swap later. React components consume them via `useFrame` or Zustand subscriptions.

### 4. Defensive frame loops
Any code that runs every frame (`useFrame` callbacks, physics ticks, grounding checks) must be wrapped in try/catch. A single bad frame should never crash the game. Log the error to console, skip the frame, keep rendering.

### 5. Performance budgets are hard limits
See PRD §3. iPad Air M-series at 60 fps is the target. Port GLBs cap at 50k triangles. Max 2 ports loaded. No FFT water. No bloom or SSAO. If a sub-task would blow these budgets, stop and ask.

---

## Code Style

### TypeScript
- Strict mode on. No `any` without a comment explaining why.
- Prefer `type` aliases for data shapes, `interface` for component props.
- Named exports for utilities; default exports only for React components/scenes.
- Explicit return types on exported functions.

### React / R3F
- Functional components only, hooks only.
- Component files: one component per file, file name matches component.
- Props interface defined in the same file, above the component.
- No `useEffect` inside `useFrame` callbacks (that's a footgun).
- Use `drei` helpers where available (`useGLTF`, `Environment`, `PerspectiveCamera` with `makeDefault`, etc.) — don't reimplement.

### Naming
- Components: `PascalCase.tsx`
- Modules: `camelCase.ts`
- Types: `PascalCase`
- Constants: `SCREAMING_SNAKE_CASE` at module scope
- Zustand stores: `useXxxStore` pattern

### Imports
Order: (1) third-party, (2) local modules (alphabetical within group), (3) type-only last. Blank line between groups.

```ts
import { useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

import { useGameStore } from '@/state/store'
import { updatePhysics } from '@/boat/physics'

import type { BoatState } from '@/boat/physics'
```

Use `@/` path alias for `src/` (configure in `vite.config.ts` and `tsconfig.json`).

### Comments
- Code should be self-explanatory where possible
- Comments explain *why*, not *what*
- Reference PRD sections in comments when implementing a spec'd behavior: `// PRD §8.3.3 — spatial grid for grounding`
- Never leave `TODO` comments — file an issue in the repo or ask the owner

---

## State Management (Zustand)

One main store, `src/state/store.ts`. Keep slices grouped by domain:
- `voyage` — current voyage config (start, destination, weather, departure time, compression)
- `boat` — live boat state (position, heading, velocity, throttle, wheel)
- `world` — game time, current port loaded, weather state
- `ui` — active scene, camera mode, pause state
- `grounding` — warning/fatal state

Mutations via actions defined inside the store. No direct state writes from components.

---

## File & Folder Conventions

### Where things go

| Type | Location |
|---|---|
| React scenes (full-screen views) | `src/scenes/` |
| React components for the 3D world | `src/world/` |
| React components for the boat | `src/boat/` |
| React components for nav (chart, tides) | `src/nav/` |
| React components for HUD/UI | `src/ui/` |
| Pure TypeScript systems | `src/systems/` |
| Data tables (ports, tide stations) | `src/data/` |
| Zustand store | `src/state/store.ts` |
| Public assets (models, textures) | `public/assets/` |

### File size guideline
Keep files under ~300 lines. If a component grows past that, split it. Sub-components go in the same folder with a co-located name.

---

## Asset Pipeline

### Loading 3D models
Use `useGLTF` from drei. Preload in a parent `<Suspense>` boundary.

```tsx
import { useGLTF } from '@react-three/drei'
useGLTF.preload('/assets/models/trawler.glb')
```

### Loading collision JSON
Fetch with native `fetch`, parse, hand to the grounding module. Don't `import` — collision JSON is dynamic data, not a bundled asset.

### Port assets
Ports are paired: `seattle.glb` + `seattle.collision.json`. Always load both or neither.

### Placeholder policy
Ship with placeholder assets (Sketchfab trawler for boat, simple extruded cube for "port") until real ones are ready. Placeholders go in `public/assets/models/placeholder/`. Real assets replace placeholders; the code path doesn't change.

### Placeholder trawler is generated geometry
Until a real GLB is sourced, `src/boat/Trawler.tsx` renders the boat from primitive meshes (boxes + cylinder). The follow camera, physics, and control plumbing all work against this placeholder. When a real GLB is available, rewrite `Trawler.tsx` to use `useGLTF('/assets/models/placeholder/trawler.glb')` — no other components need to change.

---

## Session Protocol (How Claude Code should work)

### Starting a session
1. Read the sub-task spec from the PRD.
2. State out loud: "Working on sub-task X.Y: [name]. Deliverable is [description]."
3. If the deliverable is unclear or the sub-task seems mis-sized, ask before coding.

### During a session
- One sub-task per session. Do not bleed into the next.
- Run `npm run dev` and verify the deliverable works before declaring done.
- Do not refactor code outside the sub-task's scope unless blocked by it.
- If you discover a problem in previously committed code, note it but do not fix it in this session. Raise it to the owner.

### Ending a session
1. Run `npm run build` and confirm no TypeScript errors.
2. Run `npm run dev` and manually verify the deliverable.
3. Stage all changes, commit with message: `sub-task X.Y: <deliverable summary>`.
4. Summarize what was done, what was tested, and what's ready for the next session.

### If you get stuck
- Try one alternative approach.
- If still stuck after ~30 min of effort, stop and ask the owner for guidance rather than forcing a bad solution.
- Don't silently deviate from the PRD. Ask.

---

## Git Conventions

- Branch: `main` only for MVP. No feature branches needed for a solo project.
- Commits: one per sub-task. Prefix with sub-task ID.
  - `sub-task 1.1: project scaffold with locked dependencies`
  - `sub-task 4.2: grounding collision core with spatial grid`
- Don't commit `node_modules`, `dist`, `.env.local`, or asset source files (only built GLBs).
- `.gitignore` is locked in sub-task 1.1 — don't add to it casually.

### Git identity in worktrees

Worktrees inherit git state from the parent repo but NOT git config (no `user.name` / `user.email`). Commits will fail with "Author identity unknown". Per CLAUDE.md "NEVER update the git config", the approved workaround is inline per-command config:

```bash
git -c user.name="Matt Krieger" -c user.email="matt@k-analytics.com" commit -m "..."
```

Do not `git config user.name ...` — that writes to `.git/config` and counts as updating config.

### Windows filename case sensitivity

On Windows, git preserves the original case of tracked files even though the filesystem is case-insensitive. A write to `README.md` succeeds on disk, but `git add README.md` will silently drop the change from the commit if the tracked name is `readme.md`. This bug has now shipped twice (Sprint 5 CLAUDE.md chore, Sprint 6 sub-task 6.4 README). Each time the cost is a split commit plus a `fix:` follow-up.

**Before the first Edit/Write on any `.md` or root-level config file, run:**

```bash
git ls-files | grep -i '^<stem>\.'
```

Use the exact casing that appears in the output for every subsequent tool call — Read, Edit, Write, and `git add`. Examples of the files most affected in this repo: `claude.md` (lowercase), `readme.md` (lowercase), `docs/prds/Trawler-Captain-PRD.md` (mixed, exact), `docs/sprints/manifest.md` (lowercase), `docs/retros/sprint-N-retro.md` (lowercase).

If the write already happened with the wrong case:
1. `git status` will show the tracked (usually lowercase) name as `modified:` — that's the name to stage.
2. Stage it with the correct casing: `git add readme.md` (not `README.md`).
3. Do NOT amend the bad commit (CLAUDE.md forbids amend). Make a new `fix: ...` follow-up commit referencing the miss.

If you want to rename a tracked file to a different case as the right long-term fix, use `git mv old.md NEW.md` as its own chore commit.

---

## Testing Philosophy (MVP-appropriate)

This is a personal project. Full test coverage is not the goal. Write tests for:

- **Pure systems**: physics math, tide calculations, grounding distance checks, time compression scaling. These have clear inputs and outputs; tests are cheap.
- **Critical game state transitions**: starting a voyage, ending at a port, triggering game over. These break in non-obvious ways.

Skip tests for:
- React components that are mostly markup
- Three.js scene composition (visual, hard to assert)
- MapLibre integration (external lib, mostly config)

Use Vitest. Co-locate tests: `physics.ts` → `physics.test.ts` next to it.

---

## Specific Technical Gotchas

### Three.js `Water` expects a sun direction
The official Water shader reflects sunlight. When switching weather states, you need to update both the water uniforms AND the Sky's sun position to keep them consistent. See `WeatherManager.tsx` spec in sub-task 5.3.

### MapLibre + R3F coordinate systems are different
MapLibre uses Web Mercator (lat/lng → pixels). R3F uses local Cartesian meters. The coordinate bridge (sub-task 3.4) is the only place that crosses this boundary. Every other component works in one system or the other.

### `useGLTF` caches by URL
If you load `/assets/models/ports/seattle.glb`, it's cached. Reloading the same URL returns the same object tree. If you need fresh copies per render, use `.clone()` or switch to `useLoader(GLTFLoader, url)`.

### Touch events on iPad
iPad Safari has quirks with touch events. Use pointer events (`onPointerDown` etc.) via R3F, not native touch events. Test on actual iPad early — the simulator lies.

### `npm install --legacy-peer-deps`
If dependencies won't resolve, this is the approved workaround. Don't downgrade React 19 or R3F 9.

### Vite dedupe for Three.js is required
R3F + drei + direct `three/examples/jsm/*` imports can resolve to multiple Three.js instances, triggering "Multiple instances of Three.js being imported" warnings and subtle bugs with instanceof checks. The fix is in `vite.config.ts`:

```ts
resolve: {
  alias: { 'three': path.resolve(__dirname, './node_modules/three') },
  dedupe: ['three'],
}
```

Do not remove this config. If the warning returns, verify dedupe is still present.

### Exponential time constants vs. PRD spec times
When the PRD specifies "time to reach X" for an exponential response (throttle, camera lerp, shader fade, etc.), the exponential time constant τ is roughly `spec_time / 3`. With τ = spec_time / 3 the value reaches ~95% after the spec time; using spec_time directly as τ leaves you at ~63%, which reads as "the boat never quite reaches cruise." Tests encoded literally from PRD spec times will fail in exactly this way — lean on TDD to catch it.

### Multiple input sources writing to the same store field must coordinate
When two input drivers (pointer drag + keyboard hold, touch + gamepad, etc.) can both write to the same store field, they must coordinate explicitly or they'll race. Symptoms: "the control does ~50% of what it should," "holds don't hold," "feels laggy." Established pattern: a small module-level flag object (see `src/ui/wheelInputState.ts`) that each active driver sets, with a single authority for passive behavior (spring-back, idle decay) that checks the flags. If you add a second writer to an existing store field, plug into the existing flag module rather than starting a new rAF loop.

### Worktree bootstrap

This repo uses git worktrees at `.claude/worktrees/<branch>/`. Each worktree has its own `node_modules` — they are NOT shared with the parent repo. On the first session in a fresh worktree, run:

```bash
npm install --legacy-peer-deps
```

Vitest will work without this (it resolves up to the parent), but `npm run build` will fail with `[vite:load-fallback] Could not load .../node_modules/three` because `vite.config.ts` uses `path.resolve(__dirname, './node_modules/three')` which expects node_modules in the worktree root.

### Dev-only `window.__store` for preview verification

`src/main.tsx` attaches the Zustand store to `window.__store` when `import.meta.env.DEV` is true. This is intentional — it lets preview-tool `preview_eval` calls teleport the boat, read state, and trigger scene transitions without simulating inertia-laden keyboard input. The assignment is tree-shaken from production builds (Vite strips the `DEV` branch when minifying). Do not remove.

Use from `preview_eval`:
```js
window.__store.getState().setBoatPosition([500, 0, 0])
window.__store.getState().activeScene
```

---

## Owner Context

Matt Krieger. CPA by day, runs Krieger Analytics. Has built web projects before (MyFlow, GeneScope, The Lot). Prefers:
- Practical, direct communication
- Concise explanations, no fluff
- Being told when an approach is risky or suboptimal
- Library-first solutions over custom code
- Deferring polish to ship working features first

Matt plays this game on an iPad. That's the only install target. No need to accommodate other devices.

---

## What This File Is Not

- Not a replacement for the PRD. The PRD is authoritative on *what*.
- Not a technical design doc. Design decisions live in the PRD.
- Not a style guide you should expand. Keep it lean.

If something here conflicts with the PRD, the PRD wins. If you think this file needs updating, flag it to the owner — don't edit unilaterally.
