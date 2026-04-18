import { describe, it, expect } from 'vitest'

import { createBridge, type LatLng } from '@/nav/coords'

const SEATTLE: LatLng = [47.605, -122.338]
const JUNEAU: LatLng = [58.300, -134.420]
const FRIDAY_HARBOR: LatLng = [48.535, -123.012]

describe('createBridge.latLngToLocal', () => {
  it('maps the origin to [0, 0]', () => {
    const bridge = createBridge(SEATTLE)
    const [x, z] = bridge.latLngToLocal(SEATTLE)
    expect(x).toBeCloseTo(0, 6)
    expect(z).toBeCloseTo(0, 6)
  })

  it('maps a point due north of origin to positive Z (+Z = north convention)', () => {
    const bridge = createBridge(SEATTLE)
    const [x, z] = bridge.latLngToLocal([SEATTLE[0] + 1, SEATTLE[1]])
    expect(x).toBeCloseTo(0, 6)
    expect(z).toBeGreaterThan(0)
  })

  it('maps a point due east of origin to positive X', () => {
    const bridge = createBridge(SEATTLE)
    const [x, z] = bridge.latLngToLocal([SEATTLE[0], SEATTLE[1] + 1])
    expect(x).toBeGreaterThan(0)
    expect(z).toBeCloseTo(0, 6)
  })

  it('1° of latitude ≈ 111320 m anywhere', () => {
    const bridge = createBridge(SEATTLE)
    const [, z] = bridge.latLngToLocal([SEATTLE[0] + 1, SEATTLE[1]])
    expect(z).toBeGreaterThan(111_000)
    expect(z).toBeLessThan(111_700)
  })

  it('1° of longitude at 47.6°N ≈ 75100 m', () => {
    const bridge = createBridge(SEATTLE)
    const [x] = bridge.latLngToLocal([SEATTLE[0], SEATTLE[1] + 1])
    expect(x).toBeGreaterThan(74_800)
    expect(x).toBeLessThan(75_300)
  })

  it('returns [NaN, NaN] for non-finite lat/lng', () => {
    const bridge = createBridge(SEATTLE)
    const [x, z] = bridge.latLngToLocal([NaN, 0])
    expect(Number.isNaN(x)).toBe(true)
    expect(Number.isNaN(z)).toBe(true)
  })
})

describe('createBridge.localToLatLng', () => {
  it('round-trips Seattle through Juneau-anchored bridge within 1e-5°', () => {
    const bridge = createBridge(JUNEAU)
    const local = bridge.latLngToLocal(SEATTLE)
    const [lat, lng] = bridge.localToLatLng(local)
    expect(lat).toBeCloseTo(SEATTLE[0], 5)
    expect(lng).toBeCloseTo(SEATTLE[1], 5)
  })

  it('returns [NaN, NaN] for non-finite input', () => {
    const bridge = createBridge(SEATTLE)
    const [lat, lng] = bridge.localToLatLng([Infinity, 0])
    expect(Number.isNaN(lat)).toBe(true)
    expect(Number.isNaN(lng)).toBe(true)
  })
})

describe('createBridge.distanceMeters', () => {
  it('returns ~111320 m for 1° of latitude', () => {
    const bridge = createBridge(SEATTLE)
    const d = bridge.distanceMeters(SEATTLE, [SEATTLE[0] + 1, SEATTLE[1]])
    expect(d).toBeGreaterThan(111_000)
    expect(d).toBeLessThan(111_700)
  })

  it('is zero for identical points', () => {
    const bridge = createBridge(SEATTLE)
    expect(bridge.distanceMeters(SEATTLE, SEATTLE)).toBeCloseTo(0, 3)
  })
})

describe('createBridge.bearingRadians', () => {
  it('returns ≈ 0 rad for due-north', () => {
    const bridge = createBridge(SEATTLE)
    const b = bridge.bearingRadians(SEATTLE, [FRIDAY_HARBOR[0], SEATTLE[1]])
    expect(Math.abs(b)).toBeLessThan(0.02)
  })

  it('returns ≈ π/2 rad for due-east', () => {
    const bridge = createBridge(SEATTLE)
    const b = bridge.bearingRadians(SEATTLE, [SEATTLE[0], SEATTLE[1] + 1])
    expect(b).toBeGreaterThan(Math.PI / 2 - 0.02)
    expect(b).toBeLessThan(Math.PI / 2 + 0.02)
  })
})
