import { describe, it, expect } from 'vitest'

import { TIDE_STATIONS } from '@/nav/tides'
import { buildTideArrowGeoJSON } from '@/nav/tideArrows'

const PERIOD = 12.42 * 3600

describe('buildTideArrowGeoJSON', () => {
  it('returns exactly 3 LineString features', () => {
    const fc = buildTideArrowGeoJSON(0)
    expect(fc.features).toHaveLength(3)
    for (const f of fc.features) {
      expect(f.geometry.type).toBe('LineString')
      expect(f.geometry.coordinates).toHaveLength(2)
    }
  })

  it('has finite bearingDeg and magnitude for every feature at t=0', () => {
    const fc = buildTideArrowGeoJSON(0)
    for (const f of fc.features) {
      expect(Number.isFinite(f.properties.bearingDeg)).toBe(true)
      expect(Number.isFinite(f.properties.magnitude)).toBe(true)
      expect(f.properties.magnitude).toBeGreaterThanOrEqual(0)
      expect(f.properties.bearingDeg).toBeGreaterThanOrEqual(0)
      expect(f.properties.bearingDeg).toBeLessThan(360)
    }
  })

  it('starts each line at the station lng/lat', () => {
    const fc = buildTideArrowGeoJSON(0)
    const seattle = fc.features.find((f) => f.properties.stationId === 'seattle')
    expect(seattle?.geometry.coordinates[0]).toEqual([
      TIDE_STATIONS.seattle.lng,
      TIDE_STATIONS.seattle.lat,
    ])
  })

  it("Seattle arrow at t=0 bears ≈ 0° (flood flows north; station's floodBearing=0)", () => {
    const fc = buildTideArrowGeoJSON(0)
    const seattle = fc.features.find((f) => f.properties.stationId === 'seattle')!
    const deg = seattle.properties.bearingDeg
    expect(Math.min(deg, 360 - deg)).toBeLessThan(5)
  })

  it('at slack (Seattle high tide) magnitude is near zero', () => {
    const fc = buildTideArrowGeoJSON(PERIOD / 4)
    const seattle = fc.features.find((f) => f.properties.stationId === 'seattle')!
    expect(seattle.properties.magnitude).toBeLessThan(0.01)
  })

  it('arrow tip is offset from station in the bearing direction (positive dz for north-flowing)', () => {
    const fc = buildTideArrowGeoJSON(0)
    const seattle = fc.features.find((f) => f.properties.stationId === 'seattle')!
    const [startLng, startLat] = seattle.geometry.coordinates[0]
    const [tipLng, tipLat] = seattle.geometry.coordinates[1]
    // At t=0 Seattle flood flows north → tip lat > start lat
    expect(tipLat).toBeGreaterThan(startLat)
    expect(tipLng).toBeCloseTo(startLng, 3)
  })
})
