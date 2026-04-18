import { describe, it, expect } from 'vitest'

import { createGrounding } from '@/systems/grounding'
import type { CollisionJson } from '@/systems/groundingState'

function emptyDepthGrid(): CollisionJson['depth_grid'] {
  return {
    cell_size: 500,
    origin: [-2500, -2500],
    grid: Array.from({ length: 10 }, () => Array(10).fill(-60)),
  }
}

function makeJson(
  polygons: [number, number][][],
  depthOverride?: number[][],
): CollisionJson {
  const dg = emptyDepthGrid()
  if (depthOverride) dg.grid = depthOverride
  return { port: 'test', polygons, depth_grid: dg }
}

function bruteDistance(
  p: [number, number],
  a: [number, number],
  b: [number, number],
): number {
  const abx = b[0] - a[0]
  const abz = b[1] - a[1]
  const apx = p[0] - a[0]
  const apz = p[1] - a[1]
  const abLenSq = abx * abx + abz * abz
  const t = abLenSq === 0 ? 0 : Math.max(0, Math.min(1, (apx * abx + apz * abz) / abLenSq))
  const cx = a[0] + t * abx
  const cz = a[1] + t * abz
  const dx = p[0] - cx
  const dz = p[1] - cz
  return Math.sqrt(dx * dx + dz * dz)
}

describe('createGrounding — distance', () => {
  it('is ~0 when boat is on a segment', () => {
    const g = createGrounding(makeJson([[[0, 0], [500, 0]]]))
    expect(g.checkGrounding([100, 0]).distance).toBeLessThan(0.5)
  })

  it('equals the perpendicular distance off the side of a segment', () => {
    const g = createGrounding(makeJson([[[0, 0], [500, 0]]]))
    expect(g.checkGrounding([100, 30]).distance).toBeCloseTo(30, 0)
  })

  it('equals the distance to the nearest endpoint past segment end', () => {
    const g = createGrounding(makeJson([[[0, 0], [500, 0]]]))
    expect(g.checkGrounding([600, 0]).distance).toBeCloseTo(100, 0)
  })

  it('picks the minimum distance across multiple segments', () => {
    const g = createGrounding(
      makeJson([
        [[0, 0], [500, 0]], // near: 50m perpendicular
        [[0, 1000], [500, 1000]], // far: 950m away
      ]),
    )
    expect(g.checkGrounding([100, 50]).distance).toBeCloseTo(50, 0)
  })

  it('finds a segment via the 8-neighbor lookup when boat is one cell away', () => {
    // Segment entirely in one cell; boat in adjacent cell (within 100 m).
    const g = createGrounding(makeJson([[[50, 0], [80, 0]]]))
    expect(g.checkGrounding([-30, 0]).distance).toBeCloseTo(80, 0)
  })

  it('returns Infinity when far from everything', () => {
    const g = createGrounding(makeJson([[[0, 0], [100, 0]]]))
    expect(g.checkGrounding([2400, 2400]).distance).toBe(Infinity)
  })

  it('matches brute-force for boat positions that have a nearby segment', () => {
    const polygons: [number, number][][] = []
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        const x0 = -1000 + i * 400
        const z0 = -1000 + j * 400
        polygons.push([
          [x0, z0],
          [x0 + 200, z0],
          [x0 + 200, z0 + 200],
          [x0, z0 + 200],
          [x0, z0],
        ])
      }
    }
    const g = createGrounding(makeJson(polygons))
    const testPoints: [number, number][] = [
      [-950, -950],
      [100, 100],
      [-700, 50],
    ]
    for (const p of testPoints) {
      let brute = Infinity
      for (const poly of polygons) {
        for (let i = 0; i < poly.length - 1; i++) {
          const d = bruteDistance(p, poly[i], poly[i + 1])
          if (d < brute) brute = d
        }
      }
      if (brute < 100) {
        expect(g.checkGrounding(p).distance).toBeCloseTo(brute, 0)
      }
    }
  })
})

describe('createGrounding — depth', () => {
  it('returns correct depth for in-bounds position', () => {
    const grid = Array.from({ length: 10 }, () => Array(10).fill(-60))
    grid[5][5] = -30
    const g = createGrounding(makeJson([], grid))
    // Center of cell (row=5, col=5): x = z = -2500 + 5.5 * 500 = 250
    expect(g.checkGrounding([250, 250]).depth).toBe(-30)
  })

  it('returns NaN for out-of-bounds position', () => {
    const g = createGrounding(makeJson([]))
    const { depth } = g.checkGrounding([10_000, 10_000])
    expect(Number.isNaN(depth)).toBe(true)
  })
})

describe('createGrounding — defensive', () => {
  it('returns safe defaults for malformed JSON', () => {
    const g = createGrounding({ port: 'x' } as unknown as CollisionJson)
    const result = g.checkGrounding([0, 0])
    expect(result.distance).toBe(Infinity)
    expect(Number.isNaN(result.depth)).toBe(true)
  })

  it('returns safe defaults for NaN boat position', () => {
    const g = createGrounding(makeJson([[[0, 0], [100, 0]]]))
    const result = g.checkGrounding([NaN, NaN])
    expect(result.distance).toBe(Infinity)
    expect(Number.isNaN(result.depth)).toBe(true)
  })

  it('skips malformed polygons without throwing', () => {
    const bad = [
      [[0, 0], [100, 0]] as [number, number][],
      null as unknown as [number, number][],
      [[NaN, 0], [100, 0]] as [number, number][],
    ]
    const g = createGrounding(makeJson(bad as [number, number][][]))
    // Valid segment still works
    expect(g.checkGrounding([50, 10]).distance).toBeCloseTo(10, 0)
  })
})
