#!/usr/bin/env node
// Generates a synthetic collision.json for Seattle so Sprint 4 can verify
// PortLoader and grounding before real Blender-exported assets are ready.
//
// Polygon: one 2 km × 4 km rectangle of "land" starting 500 m east of origin.
// Depth grid: 100×100 at 50 m per cell, deep water west of x=450, ramping
// through shallow (-8 ft) and very-shallow (-2 ft) bands, land (+5 ft) at x≥500.
//
// Run: node scripts/generate-synthetic-port.mjs

import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'

const PORT_RADIUS = 2500 // half the 5 km × 5 km port area, in meters
const CELL_SIZE = 50
const GRID_N = Math.round((2 * PORT_RADIUS) / CELL_SIZE) // 100

const polygons = [
  [
    [500, -2000],
    [500, 2000],
    [2500, 2000],
    [2500, -2000],
    [500, -2000],
  ],
]

const grid = []
for (let row = 0; row < GRID_N; row++) {
  const rowArr = []
  for (let col = 0; col < GRID_N; col++) {
    const x = -PORT_RADIUS + (col + 0.5) * CELL_SIZE
    let depth
    if (x >= 500) depth = 5
    else if (x >= 480) depth = -2
    else if (x >= 450) depth = -8
    else depth = -60
    rowArr.push(depth)
  }
  grid.push(rowArr)
}

const output = {
  port: 'seattle',
  polygons,
  depth_grid: {
    cell_size: CELL_SIZE,
    origin: [-PORT_RADIUS, -PORT_RADIUS],
    grid,
  },
}

const path = 'public/assets/models/ports/seattle.collision.json'
mkdirSync(dirname(path), { recursive: true })
writeFileSync(path, JSON.stringify(output))

const vertCount = polygons.reduce((s, p) => s + p.length, 0)
const flat = grid.flat()
const min = Math.min(...flat)
const max = Math.max(...flat)
console.log(`Wrote ${path}`)
console.log(`  polygons: ${polygons.length}, vertices: ${vertCount}`)
console.log(`  depth grid: ${GRID_N}x${GRID_N} = ${flat.length} cells at ${CELL_SIZE} m`)
console.log(`  depth range: ${min} to ${max} ft`)
