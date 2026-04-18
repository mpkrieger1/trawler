export function formatElapsedTime(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) return '0m 00s'
  const totalSec = Math.floor(ms / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  const mmStr = String(m).padStart(2, '0')
  const ssStr = String(s).padStart(2, '0')
  if (h > 0) return `${h}h ${mmStr}m ${ssStr}s`
  return `${m}m ${ssStr}s`
}
