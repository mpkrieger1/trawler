import { describe, it, expect } from 'vitest'

import { findNearestPortWithinRadius } from '@/world/portProximity'

describe('findNearestPortWithinRadius', () => {
  it('returns Seattle when boat is at Seattle coordinates', () => {
    const result = findNearestPortWithinRadius([47.605, -122.338])
    expect(result?.id).toBe('seattle')
  })

  it('returns Seattle when boat is ~2 km NE of Seattle (within 5 km)', () => {
    const result = findNearestPortWithinRadius([47.620, -122.320])
    expect(result?.id).toBe('seattle')
  })

  it('returns null when boat is mid-Strait-of-Georgia (no port within 5 km)', () => {
    expect(findNearestPortWithinRadius([49.0, -124.5])).toBeNull()
  })

  it('returns null for non-finite inputs', () => {
    expect(findNearestPortWithinRadius([NaN, -122.338])).toBeNull()
    expect(findNearestPortWithinRadius([47.6, Infinity])).toBeNull()
  })

  it('respects a custom radius', () => {
    // Boat ~10 km north of Seattle: outside the 5 km default, inside 15 km.
    expect(findNearestPortWithinRadius([47.700, -122.338], 5000)).toBeNull()
    expect(findNearestPortWithinRadius([47.700, -122.338], 15000)?.id).toBe('seattle')
  })

  it('returns the nearest port when multiple are within radius', () => {
    // With a wide radius, both Seattle and Bainbridge are in range; Seattle is closer.
    const result = findNearestPortWithinRadius([47.611, -122.400], 15000)
    expect(result?.id).toBe('seattle')
  })
})
