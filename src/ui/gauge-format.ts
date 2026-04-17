export function mpsToKnots(mps: number): number {
  if (!Number.isFinite(mps)) return 0
  return mps * 1.9438
}

export function radiansToCompass(rad: number): number {
  if (!Number.isFinite(rad)) return 0
  const TWO_PI = Math.PI * 2
  const normalized = ((rad % TWO_PI) + TWO_PI) % TWO_PI
  const degrees = Math.round((normalized * 180) / Math.PI)
  return degrees % 360
}

export function formatDepthFt(ft: number): string {
  if (!Number.isFinite(ft)) return '—'
  return Math.round(ft).toString()
}
