import { greatCircle, point } from '@turf/turf'

export type LatLng = [number, number] // [latitude, longitude]

const METERS_PER_NM = 1852

export function greatCircleRoute(
  start: LatLng,
  dest: LatLng,
  opts: { steps?: number } = {},
): GeoJSON.Feature<GeoJSON.LineString> {
  const steps = opts.steps ?? 64

  if (start[0] === dest[0] && start[1] === dest[1]) {
    return {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: [[start[1], start[0]]],
      },
    }
  }

  try {
    const line = greatCircle(
      point([start[1], start[0]]),
      point([dest[1], dest[0]]),
      { npoints: steps + 1 },
    )
    if (line.geometry.type === 'LineString') {
      return line as GeoJSON.Feature<GeoJSON.LineString>
    }
    // MultiLineString (antimeridian crossing) — flatten first part; our Inside
    // Passage region never crosses but be defensive.
    const [first] = (line.geometry as GeoJSON.MultiLineString).coordinates
    return {
      type: 'Feature',
      properties: line.properties ?? {},
      geometry: { type: 'LineString', coordinates: first },
    }
  } catch {
    return {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: [
          [start[1], start[0]],
          [dest[1], dest[0]],
        ],
      },
    }
  }
}

export function formatDistanceNm(meters: number): string {
  if (!Number.isFinite(meters) || meters < 0) return '0.0 nm'
  return `${(meters / METERS_PER_NM).toFixed(1)} nm`
}
