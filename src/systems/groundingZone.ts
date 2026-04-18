// Two-zone grounding classifier per PRD §8.3.1.
// Thresholds: warning at <30 m OR <10 ft clearance; fatal at <5 m OR <3 ft clearance.
// Clearance is |depth| − draft when underwater; negative on land (positive depth).
// Depth convention (from collision JSON): negative = below datum, positive = above.

export type GroundingZone = 'safe' | 'warning' | 'fatal'

const DEFAULT_DRAFT_FEET = 3
const WARNING_DISTANCE_M = 30
const FATAL_DISTANCE_M = 5
const WARNING_CLEARANCE_FT = 10
const FATAL_CLEARANCE_FT = 3

export function depthToClearanceFt(depth: number, draftFeet = DEFAULT_DRAFT_FEET): number {
  if (!Number.isFinite(depth)) return Infinity
  return -depth - draftFeet
}

export function classifyZone(input: {
  distance: number
  depth: number
  draftFeet?: number
}): GroundingZone {
  const { distance, depth, draftFeet = DEFAULT_DRAFT_FEET } = input
  if (!Number.isFinite(distance) || !Number.isFinite(depth)) return 'safe'
  const clearance = -depth - draftFeet
  if (distance < FATAL_DISTANCE_M || clearance < FATAL_CLEARANCE_FT) return 'fatal'
  if (distance < WARNING_DISTANCE_M || clearance < WARNING_CLEARANCE_FT) return 'warning'
  return 'safe'
}
