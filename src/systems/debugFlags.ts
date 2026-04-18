// Tiny module-scoped flag store for debug overlays. Kept out of Zustand
// because these toggle rarely and should not trigger React re-renders of the
// whole tree; consumers in the 3D canvas just poll each frame.

type DebugFlag = 'collision' | 'physics'

const active = new Set<DebugFlag>()

function readUrlFlags(): void {
  if (typeof window === 'undefined') return
  try {
    const params = new URLSearchParams(window.location.search)
    const debug = params.get('debug')
    if (!debug) return
    for (const token of debug.split(',')) {
      const t = token.trim() as DebugFlag
      if (t === 'collision' || t === 'physics') active.add(t)
    }
  } catch {
    // malformed URL — ignore
  }
}

readUrlFlags()

export function isDebugActive(flag: DebugFlag): boolean {
  return active.has(flag)
}

export function toggleDebug(flag: DebugFlag): boolean {
  if (active.has(flag)) active.delete(flag)
  else active.add(flag)
  return active.has(flag)
}

export function setDebug(flag: DebugFlag, on: boolean): void {
  if (on) active.add(flag)
  else active.delete(flag)
}
