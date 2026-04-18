// Module-singleton handoff for collision JSON between PortLoader (writes) and
// the grounding loop (reads). Kept out of Zustand because the depth grid is
// large (100×100 = 10k cells) and changes only on port load/unload.

export type CollisionPolygon = [number, number][]

export type DepthGrid = {
  cell_size: number
  origin: [number, number]
  grid: number[][]
}

export type CollisionJson = {
  port: string
  polygons: CollisionPolygon[]
  depth_grid: DepthGrid
}

let currentPortId: string | null = null
let currentCollision: CollisionJson | null = null

export function setCollision(portId: string, json: CollisionJson): void {
  currentPortId = portId
  currentCollision = json
}

export function getCollision(): { portId: string; collision: CollisionJson } | null {
  if (!currentPortId || !currentCollision) return null
  return { portId: currentPortId, collision: currentCollision }
}

export function clearCollision(): void {
  currentPortId = null
  currentCollision = null
}
