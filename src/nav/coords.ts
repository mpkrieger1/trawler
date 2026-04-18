import { bearing, distance, point } from '@turf/turf'

// PRD §8 coordinate convention: +X east meters, +Z north meters.
// Matches the boat physics convention (stepPhysics at heading=0 moves +Z).
// Equirectangular flat-earth projection — accurate to ~1 m within 5 km of origin.

export type LatLng = [number, number] // [latitude, longitude]
export type LocalXZ = [number, number] // [x east, z north] in meters

const METERS_PER_DEG_LAT = 111_320
const DEG_TO_RAD = Math.PI / 180
const RAD_TO_DEG = 180 / Math.PI

export type CoordinateBridge = {
  origin: LatLng
  latLngToLocal: (coord: LatLng) => LocalXZ
  localToLatLng: (xz: LocalXZ) => LatLng
  distanceMeters: (a: LatLng, b: LatLng) => number
  bearingRadians: (from: LatLng, to: LatLng) => number
}

export function createBridge(origin: LatLng): CoordinateBridge {
  const [originLat, originLng] = origin
  const metersPerDegLng = METERS_PER_DEG_LAT * Math.cos(originLat * DEG_TO_RAD)

  const latLngToLocal = ([lat, lng]: LatLng): LocalXZ => {
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return [NaN, NaN]
    const x = (lng - originLng) * metersPerDegLng
    const z = (lat - originLat) * METERS_PER_DEG_LAT
    return [x, z]
  }

  const localToLatLng = ([x, z]: LocalXZ): LatLng => {
    if (!Number.isFinite(x) || !Number.isFinite(z)) return [NaN, NaN]
    const lat = originLat + z / METERS_PER_DEG_LAT
    const lng = originLng + x / metersPerDegLng
    return [lat, lng]
  }

  const distanceMeters = (a: LatLng, b: LatLng): number => {
    try {
      return distance(point([a[1], a[0]]), point([b[1], b[0]]), { units: 'meters' })
    } catch {
      return NaN
    }
  }

  const bearingRadians = (from: LatLng, to: LatLng): number => {
    try {
      const deg = bearing(point([from[1], from[0]]), point([to[1], to[0]]))
      return deg * DEG_TO_RAD
    } catch {
      return NaN
    }
  }

  return { origin, latLngToLocal, localToLatLng, distanceMeters, bearingRadians }
}

export function radiansToCompassDegrees(rad: number): number {
  if (!Number.isFinite(rad)) return NaN
  const deg = rad * RAD_TO_DEG
  return ((deg % 360) + 360) % 360
}
