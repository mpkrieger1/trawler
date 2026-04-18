// Time compression per PRD §12.5.4. User selects 1/5/15/30×; effective level
// is reduced by two auto-slowdown rules (§9, §8):
//   - Stormy weather caps at 5×.
//   - Within 1 nm of any port, force 1×.

export const COMPRESSION_LEVELS = [1, 5, 15, 30] as const
export type CompressionLevel = (typeof COMPRESSION_LEVELS)[number]

export function effectiveCompression(
  selected: number,
  flags: { isStormy: boolean; isNearPort: boolean },
): number {
  if (!Number.isFinite(selected) || selected < 1) return 1
  let c = selected
  if (flags.isStormy) c = Math.min(c, 5)
  if (flags.isNearPort) c = 1
  return c
}
