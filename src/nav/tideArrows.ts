import { TIDE_STATIONS, getCurrentAtStation } from './tides'

const ARROW_SCALE_METERS_PER_MPS = 20_000
const METERS_PER_DEG_LAT = 111_320
const DEG_TO_RAD = Math.PI / 180

export type TideArrowProperties = {
  stationId: string
  magnitude: number
  bearingDeg: number
}

export function buildTideArrowGeoJSON(
  t: number,
): GeoJSON.FeatureCollection<GeoJSON.LineString, TideArrowProperties> {
  const features: GeoJSON.Feature<GeoJSON.LineString, TideArrowProperties>[] = []
  for (const station of Object.values(TIDE_STATIONS)) {
    const current = getCurrentAtStation(station, t)
    const magnitude = Math.hypot(current.vx, current.vz)
    const bearingRad = Math.atan2(current.vx, current.vz)
    const bearingDeg = (((bearingRad * 180) / Math.PI) + 360) % 360

    const dLat = (current.vz * ARROW_SCALE_METERS_PER_MPS) / METERS_PER_DEG_LAT
    const dLng =
      (current.vx * ARROW_SCALE_METERS_PER_MPS) /
      (METERS_PER_DEG_LAT * Math.cos(station.lat * DEG_TO_RAD))

    features.push({
      type: 'Feature',
      properties: { stationId: station.id, magnitude, bearingDeg },
      geometry: {
        type: 'LineString',
        coordinates: [
          [station.lng, station.lat],
          [station.lng + dLng, station.lat + dLat],
        ],
      },
    })
  }
  return { type: 'FeatureCollection', features }
}
