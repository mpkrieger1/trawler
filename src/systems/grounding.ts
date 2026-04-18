import type { CollisionJson } from './groundingState'

// Spatial-grid grounding: 50×50 grid over the 5 km × 5 km port area (100 m per
// cell). Per-call cost is O(segments in 3×3 neighborhood) — typically <20.
// Inlines a 2D point-to-segment distance to avoid Turf's per-call overhead
// (nearestPointOnLine converts through lat/lng km and is ~100× slower than
// needed for a per-frame hot path — see Sprint 4 plan Risk & Notes).

type Segment = [number, number, number, number] // [ax, az, bx, bz]

const GRID_N = 50
const CELL_SIZE = 100
const GRID_HALF = (GRID_N * CELL_SIZE) / 2 // 2500 m

function cellIndex(coord: number): number {
  const c = Math.floor((coord + GRID_HALF) / CELL_SIZE)
  if (c < 0) return 0
  if (c >= GRID_N) return GRID_N - 1
  return c
}

function distanceToSegment(px: number, pz: number, seg: Segment): number {
  const [ax, az, bx, bz] = seg
  const abx = bx - ax
  const abz = bz - az
  const apx = px - ax
  const apz = pz - az
  const abLenSq = abx * abx + abz * abz
  let t = abLenSq === 0 ? 0 : (apx * abx + apz * abz) / abLenSq
  if (t < 0) t = 0
  else if (t > 1) t = 1
  const cx = ax + t * abx
  const cz = az + t * abz
  const dx = px - cx
  const dz = pz - cz
  return Math.sqrt(dx * dx + dz * dz)
}

export type GroundingResult = { distance: number; depth: number }
export type Grounding = {
  checkGrounding: (boat: [number, number]) => GroundingResult
  segmentCount: number
}

export function createGrounding(json: CollisionJson | unknown): Grounding {
  const segments: Segment[] = []
  const cellSegments: number[][][] = Array.from({ length: GRID_N }, () =>
    Array.from({ length: GRID_N }, () => [] as number[]),
  )

  try {
    const polygons = (json as CollisionJson)?.polygons
    if (Array.isArray(polygons)) {
      for (const poly of polygons) {
        if (!Array.isArray(poly) || poly.length < 2) continue
        for (let i = 0; i < poly.length - 1; i++) {
          const a = poly[i]
          const b = poly[i + 1]
          if (!Array.isArray(a) || !Array.isArray(b)) continue
          const [ax, az] = a
          const [bx, bz] = b
          if (
            !Number.isFinite(ax) ||
            !Number.isFinite(az) ||
            !Number.isFinite(bx) ||
            !Number.isFinite(bz)
          )
            continue
          const idx = segments.length
          segments.push([ax, az, bx, bz])
          const cMinX = cellIndex(Math.min(ax, bx))
          const cMaxX = cellIndex(Math.max(ax, bx))
          const cMinZ = cellIndex(Math.min(az, bz))
          const cMaxZ = cellIndex(Math.max(az, bz))
          for (let r = cMinZ; r <= cMaxZ; r++) {
            for (let c = cMinX; c <= cMaxX; c++) {
              cellSegments[r][c].push(idx)
            }
          }
        }
      }
    }
  } catch (e) {
    console.warn('[grounding] build error:', e)
  }

  const depthGrid = (json as CollisionJson)?.depth_grid
  const hasDepth =
    !!depthGrid &&
    Number.isFinite(depthGrid.cell_size) &&
    Array.isArray(depthGrid.origin) &&
    Array.isArray(depthGrid.grid)

  const checkGrounding = (boat: [number, number]): GroundingResult => {
    try {
      const [x, z] = boat
      if (!Number.isFinite(x) || !Number.isFinite(z)) {
        return { distance: Infinity, depth: NaN }
      }

      const cx = cellIndex(x)
      const cz = cellIndex(z)
      const seen = new Set<number>()
      let minDist = Infinity
      for (let r = cz - 1; r <= cz + 1; r++) {
        if (r < 0 || r >= GRID_N) continue
        for (let c = cx - 1; c <= cx + 1; c++) {
          if (c < 0 || c >= GRID_N) continue
          const ids = cellSegments[r][c]
          for (const id of ids) {
            if (seen.has(id)) continue
            seen.add(id)
            const d = distanceToSegment(x, z, segments[id])
            if (d < minDist) minDist = d
          }
        }
      }

      let depth = NaN
      if (hasDepth) {
        const { cell_size, origin, grid } = depthGrid
        const col = Math.floor((x - origin[0]) / cell_size)
        const row = Math.floor((z - origin[1]) / cell_size)
        if (row >= 0 && row < grid.length) {
          const rowArr = grid[row]
          if (Array.isArray(rowArr) && col >= 0 && col < rowArr.length) {
            const v = rowArr[col]
            if (Number.isFinite(v)) depth = v
          }
        }
      }

      return { distance: minDist, depth }
    } catch (e) {
      console.warn('[grounding] check error:', e)
      return { distance: Infinity, depth: NaN }
    }
  }

  return { checkGrounding, segmentCount: segments.length }
}
