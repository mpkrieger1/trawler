import { distance, point } from '@turf/turf'

// Simplified sinusoidal M2 tide model, PRD §8.2.
// Three reference stations with per-station amplitude, phase offset, peak
// current speed, and flood bearing (current direction at flood). Current at
// any boat position is inverse-distance interpolated between the stations.
//
// Axis convention: +X east, +Z north — matching physics.ts / coords.ts.
// Compass bearing: 0 = north, π/2 = east (clockwise), so
//   vx = magnitude * sin(bearing); vz = magnitude * cos(bearing).

export type TideStationId = 'seattle' | 'campbell_river' | 'juneau'

export type TideStation = {
  id: TideStationId
  lat: number
  lng: number
  amplitudeMeters: number
  periodSeconds: number
  phaseSeconds: number
  floodBearingRad: number
  peakCurrentMps: number
}

const M2_PERIOD_SECONDS = 12.42 * 3600 // lunar semidiurnal

export const TIDE_STATIONS: Record<TideStationId, TideStation> = {
  seattle: {
    id: 'seattle',
    lat: 47.605,
    lng: -122.338,
    amplitudeMeters: 1.5,
    periodSeconds: M2_PERIOD_SECONDS,
    phaseSeconds: 0,
    floodBearingRad: 0, // flood flows north up Puget Sound
    peakCurrentMps: 0.6,
  },
  campbell_river: {
    id: 'campbell_river',
    lat: 50.033,
    lng: -125.244,
    amplitudeMeters: 2.5,
    periodSeconds: M2_PERIOD_SECONDS,
    phaseSeconds: 1.5 * 3600,
    floodBearingRad: (350 * Math.PI) / 180, // ~NNW up Discovery Passage
    peakCurrentMps: 1.5, // Seymour Narrows is notorious
  },
  juneau: {
    id: 'juneau',
    lat: 58.300,
    lng: -134.420,
    amplitudeMeters: 2.0,
    periodSeconds: M2_PERIOD_SECONDS,
    phaseSeconds: 3 * 3600,
    floodBearingRad: (60 * Math.PI) / 180, // NE into Gastineau Channel
    peakCurrentMps: 0.8,
  },
}

export type TideCurrent = { vx: number; vz: number }

export function getTideHeight(station: TideStation, t: number): number {
  if (!Number.isFinite(t)) return 0
  const omega = (2 * Math.PI) / station.periodSeconds
  return station.amplitudeMeters * Math.sin(omega * (t + station.phaseSeconds))
}

export function getTideRate(station: TideStation, t: number): number {
  if (!Number.isFinite(t)) return 0
  const omega = (2 * Math.PI) / station.periodSeconds
  return station.amplitudeMeters * omega * Math.cos(omega * (t + station.phaseSeconds))
}

// Normalized signed rate in [-1, 1]: +1 = peak flood, -1 = peak ebb, 0 = slack.
function normalizedRate(station: TideStation, t: number): number {
  const omega = (2 * Math.PI) / station.periodSeconds
  return Math.cos(omega * (t + station.phaseSeconds))
}

export function getCurrentAtStation(station: TideStation, t: number): TideCurrent {
  if (!Number.isFinite(t)) return { vx: 0, vz: 0 }
  const rate = normalizedRate(station, t)
  const speed = station.peakCurrentMps * rate
  return {
    vx: speed * Math.sin(station.floodBearingRad),
    vz: speed * Math.cos(station.floodBearingRad),
  }
}

const INTERP_EPSILON_METERS = 1 // avoid division-by-zero when boat coincides with station

export function getCurrentAt([lat, lng]: [number, number], t: number): TideCurrent {
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || !Number.isFinite(t)) {
    return { vx: 0, vz: 0 }
  }

  try {
    const pBoat = point([lng, lat])
    let sumWx = 0
    let sumWz = 0
    let sumW = 0
    for (const station of Object.values(TIDE_STATIONS)) {
      const d = distance(pBoat, point([station.lng, station.lat]), { units: 'meters' })
      const w = 1 / Math.max(d, INTERP_EPSILON_METERS)
      const c = getCurrentAtStation(station, t)
      sumWx += w * c.vx
      sumWz += w * c.vz
      sumW += w
    }
    if (sumW === 0) return { vx: 0, vz: 0 }
    return { vx: sumWx / sumW, vz: sumWz / sumW }
  } catch {
    return { vx: 0, vz: 0 }
  }
}
