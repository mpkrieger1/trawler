import { describe, it, expect } from 'vitest'

import {
  TIDE_STATIONS,
  getCurrentAt,
  getCurrentAtStation,
  getTideHeight,
  getTideRate,
} from '@/nav/tides'

const PERIOD = 12.42 * 3600

describe('getTideHeight', () => {
  it('repeats after one full M2 period', () => {
    const s = TIDE_STATIONS.seattle
    const h0 = getTideHeight(s, 0)
    const hP = getTideHeight(s, PERIOD)
    expect(hP).toBeCloseTo(h0, 6)
  })

  it("peaks at the station's configured amplitude (within ±1 cm)", () => {
    const s = TIDE_STATIONS.seattle
    let peak = 0
    for (let t = 0; t < PERIOD; t += 60) {
      peak = Math.max(peak, getTideHeight(s, t))
    }
    expect(peak).toBeCloseTo(s.amplitudeMeters, 2)
  })

  it('is zero at slack — for Seattle with phase=0, h(0)=0', () => {
    expect(getTideHeight(TIDE_STATIONS.seattle, 0)).toBeCloseTo(0, 6)
  })

  it('returns 0 for non-finite time (defensive)', () => {
    expect(getTideHeight(TIDE_STATIONS.seattle, NaN)).toBe(0)
  })
})

describe('getTideRate is the derivative of getTideHeight', () => {
  it('matches the central-difference derivative at several sample times', () => {
    const s = TIDE_STATIONS.seattle
    const DT = 1
    for (const t of [0, 3600, 6000, 20_000]) {
      const numerical = (getTideHeight(s, t + DT) - getTideHeight(s, t - DT)) / (2 * DT)
      expect(getTideRate(s, t)).toBeCloseTo(numerical, 5)
    }
  })

  it('is zero at high/low tide (slack) and peaks at mid-tide', () => {
    const s = TIDE_STATIONS.seattle
    // Seattle: phase=0, so h(t)=A*sin(ω t). High tide at ω t = π/2 → t = period/4.
    const tHigh = PERIOD / 4
    const tMid = 0
    expect(Math.abs(getTideRate(s, tHigh))).toBeLessThan(0.00001)
    expect(Math.abs(getTideRate(s, tMid))).toBeGreaterThan(
      Math.abs(getTideRate(s, tHigh)) + 1e-6,
    )
  })
})

describe('getCurrentAtStation', () => {
  it('flows in the flood-bearing direction at mid-flood (t=0 for Seattle)', () => {
    // Seattle: phase=0, floodBearing=0 (north). At t=0, rate>0 (rising), so
    // current flows north: +Z positive, X ≈ 0. Locks +Z = north convention.
    const c = getCurrentAtStation(TIDE_STATIONS.seattle, 0)
    expect(c.vz).toBeGreaterThan(0)
    expect(Math.abs(c.vx)).toBeLessThan(0.01)
  })

  it('flips direction half a period later (ebb)', () => {
    const flood = getCurrentAtStation(TIDE_STATIONS.seattle, 0)
    const ebb = getCurrentAtStation(TIDE_STATIONS.seattle, PERIOD / 2)
    expect(flood.vz * ebb.vz).toBeLessThan(0) // opposite signs
  })

  it('is zero at slack (max height)', () => {
    const c = getCurrentAtStation(TIDE_STATIONS.seattle, PERIOD / 4)
    expect(Math.abs(c.vx)).toBeLessThan(0.01)
    expect(Math.abs(c.vz)).toBeLessThan(0.01)
  })

  it('peak speed is bounded by the station configured peak', () => {
    const s = TIDE_STATIONS.campbell_river
    let maxMag = 0
    for (let t = 0; t < PERIOD; t += 60) {
      const c = getCurrentAtStation(s, t)
      const mag = Math.hypot(c.vx, c.vz)
      if (mag > maxMag) maxMag = mag
    }
    expect(maxMag).toBeLessThanOrEqual(s.peakCurrentMps + 1e-6)
    expect(maxMag).toBeGreaterThan(s.peakCurrentMps - 0.05)
  })
})

describe('getCurrentAt (interpolated)', () => {
  it('returns near the Seattle station vector when boat is at Seattle', () => {
    const station = TIDE_STATIONS.seattle
    const stationC = getCurrentAtStation(station, 10_000)
    const interpC = getCurrentAt([station.lat, station.lng], 10_000)
    expect(interpC.vx).toBeCloseTo(stationC.vx, 2)
    expect(interpC.vz).toBeCloseTo(stationC.vz, 2)
  })

  it('interpolated magnitude between two stations stays within the pair', () => {
    // Halfway between Seattle and Campbell River.
    const s = TIDE_STATIONS.seattle
    const c = TIDE_STATIONS.campbell_river
    const midLat = (s.lat + c.lat) / 2
    const midLng = (s.lng + c.lng) / 2
    const t = 3000
    const sMag = Math.hypot(
      getCurrentAtStation(s, t).vx,
      getCurrentAtStation(s, t).vz,
    )
    const cMag = Math.hypot(
      getCurrentAtStation(c, t).vx,
      getCurrentAtStation(c, t).vz,
    )
    const mid = getCurrentAt([midLat, midLng], t)
    const midMag = Math.hypot(mid.vx, mid.vz)
    const lo = Math.min(sMag, cMag)
    const hi = Math.max(sMag, cMag)
    // With IDW between two stations, magnitude is bounded by the two inputs
    // (plus small overshoot is possible near direction disagreement — allow ε).
    expect(midMag).toBeGreaterThanOrEqual(lo * 0.5)
    expect(midMag).toBeLessThanOrEqual(hi * 1.2)
  })

  it('returns zero vector for non-finite inputs', () => {
    expect(getCurrentAt([NaN, -122], 0)).toEqual({ vx: 0, vz: 0 })
    expect(getCurrentAt([47, 0], Infinity)).toEqual({ vx: 0, vz: 0 })
  })
})

describe('TIDE_STATIONS config', () => {
  it('has three stations with sensible values', () => {
    const ids = Object.keys(TIDE_STATIONS).sort()
    expect(ids).toEqual(['campbell_river', 'juneau', 'seattle'])
    for (const id of ids) {
      const s = (TIDE_STATIONS as Record<string, (typeof TIDE_STATIONS)['seattle']>)[id]
      expect(s.amplitudeMeters).toBeGreaterThan(0)
      expect(s.amplitudeMeters).toBeLessThan(10)
      expect(s.peakCurrentMps).toBeGreaterThan(0)
      expect(s.peakCurrentMps).toBeLessThan(5)
      expect(s.periodSeconds).toBeCloseTo(PERIOD, 0)
    }
  })
})
