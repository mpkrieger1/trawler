#!/usr/bin/env node
// Generates synthetic collision.json files for all 21 Inside Passage ports so
// PortLoader can verify grounding at every port before real Blender-exported
// assets arrive. Each port gets the same layout (simplest possible baseline):
//
//   Polygon: 2 km × 4 km rectangle of "land" starting 500 m east of origin.
//   Depth grid: 100×100 at 50 m/cell, deep water west of x=450, ramping
//   through shallow (-8 ft) and very-shallow (-2 ft) bands, land (+5 ft) at x≥500.
//
// Run: node scripts/generate-synthetic-port.mjs

import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'

// Keep in sync with src/data/ports.ts. Duplicated here because this is a
// build-time script run outside the Vite toolchain.
const PORT_IDS = [
  'seattle',
  'bainbridge',
  'kingston',
  'port-townsend',
  'anacortes',
  'friday-harbor',
  'roche-harbor',
  'deer-harbor',
  'sidney',
  'nanaimo',
  'pender-harbour',
  'campbell-river',
  'refuge-cove',
  'port-mcneill',
  'shearwater',
  'prince-rupert',
  'ketchikan',
  'wrangell',
  'petersburg',
  'sitka',
  'juneau',
]

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

const outDir = 'public/assets/models/ports'
mkdirSync(outDir, { recursive: true })

const vertCount = polygons.reduce((s, p) => s + p.length, 0)
const flat = grid.flat()
const min = Math.min(...flat)
const max = Math.max(...flat)

for (const portId of PORT_IDS) {
  const output = {
    port: portId,
    polygons,
    depth_grid: {
      cell_size: CELL_SIZE,
      origin: [-PORT_RADIUS, -PORT_RADIUS],
      grid,
    },
  }
  const path = `${outDir}/${portId}.collision.json`
  writeFileSync(path, JSON.stringify(output))
  console.log(`Wrote ${path}`)
}

console.log('')
console.log(`Generated ${PORT_IDS.length} collision files`)
console.log(`  polygons per port: ${polygons.length}, vertices: ${vertCount}`)
console.log(`  depth grid: ${GRID_N}x${GRID_N} = ${flat.length} cells at ${CELL_SIZE} m`)
console.log(`  depth range: ${min} to ${max} ft`)
