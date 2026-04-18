import { distance, point } from '@turf/turf'

import { ports, type Port } from '@/data/ports'

export function findNearestPortWithinRadius(
  boatLatLng: [number, number],
  radiusMeters = 5000,
): Port | null {
  const [lat, lng] = boatLatLng
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null

  let nearest: Port | null = null
  let nearestDist = Infinity

  for (const p of ports) {
    try {
      const d = distance(point([lng, lat]), point([p.lng, p.lat]), { units: 'meters' })
      if (d <= radiusMeters && d < nearestDist) {
        nearest = p
        nearestDist = d
      }
    } catch {
      // skip malformed data defensively
    }
  }

  return nearest
}
