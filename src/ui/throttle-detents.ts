export const DETENTS = [-1, -0.75, -0.5, -0.25, 0, 0.25, 0.5, 0.75, 1]
const DETENT_SNAP_DISTANCE = 0.05

export function snapToDetent(value: number): number {
  if (!Number.isFinite(value)) return 0
  const clamped = Math.max(-1, Math.min(1, value))
  let nearest = clamped
  let bestDist = Infinity
  for (const d of DETENTS) {
    const dist = Math.abs(clamped - d)
    if (dist < bestDist) {
      bestDist = dist
      nearest = d
    }
  }
  return bestDist <= DETENT_SNAP_DISTANCE ? nearest : clamped
}
