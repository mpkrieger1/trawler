import { describe, it, expect } from 'vitest'

import { formatDistanceNm, greatCircleRoute } from '@/nav/routing'

const SEATTLE: [number, number] = [47.605, -122.338]
const JUNEAU: [number, number] = [58.300, -134.420]

describe('greatCircleRoute', () => {
  it('returns a LineString with steps + 1 coordinates', () => {
    const route = greatCircleRoute(SEATTLE, JUNEAU, { steps: 32 })
    expect(route.geometry.type).toBe('LineString')
    expect(route.geometry.coordinates).toHaveLength(33)
  })

  it('starts at the input start coordinate', () => {
    const route = greatCircleRoute(SEATTLE, JUNEAU, { steps: 10 })
    const first = route.geometry.coordinates[0]
    expect(first[0]).toBeCloseTo(SEATTLE[1], 4)
    expect(first[1]).toBeCloseTo(SEATTLE[0], 4)
  })

  it('ends at the input destination coordinate', () => {
    const route = greatCircleRoute(SEATTLE, JUNEAU, { steps: 10 })
    const last = route.geometry.coordinates[route.geometry.coordinates.length - 1]
    expect(last[0]).toBeCloseTo(JUNEAU[1], 4)
    expect(last[1]).toBeCloseTo(JUNEAU[0], 4)
  })

  it('first segment for Seattle → Juneau heads roughly north-northwest', () => {
    const route = greatCircleRoute(SEATTLE, JUNEAU, { steps: 64 })
    const [lng1, lat1] = route.geometry.coordinates[0]
    const [lng2, lat2] = route.geometry.coordinates[1]
    const dLat = lat2 - lat1
    const dLng = (lng2 - lng1) * Math.cos((lat1 * Math.PI) / 180)
    const deg = (Math.atan2(dLng, dLat) * 180) / Math.PI
    const bearing = ((deg % 360) + 360) % 360
    expect(bearing).toBeGreaterThan(315)
    expect(bearing).toBeLessThan(345)
  })

  it('returns a degenerate single-point line for identical start and dest', () => {
    const route = greatCircleRoute(SEATTLE, SEATTLE)
    expect(route.geometry.coordinates).toHaveLength(1)
    expect(route.geometry.coordinates[0][0]).toBeCloseTo(SEATTLE[1], 6)
    expect(route.geometry.coordinates[0][1]).toBeCloseTo(SEATTLE[0], 6)
  })
})

describe('formatDistanceNm', () => {
  it('formats 1852 m as 1.0 nm', () => {
    expect(formatDistanceNm(1852)).toBe('1.0 nm')
  })

  it('formats 0 as 0.0 nm', () => {
    expect(formatDistanceNm(0)).toBe('0.0 nm')
  })

  it('guards negative values to 0.0 nm', () => {
    expect(formatDistanceNm(-500)).toBe('0.0 nm')
  })

  it('guards non-finite values to 0.0 nm', () => {
    expect(formatDistanceNm(NaN)).toBe('0.0 nm')
    expect(formatDistanceNm(Infinity)).toBe('0.0 nm')
  })

  it('formats Seattle → Juneau distance (~810 nm) with one decimal', () => {
    // 900 nm = 1,666,800 m
    expect(formatDistanceNm(1_666_800)).toBe('900.0 nm')
  })
})
