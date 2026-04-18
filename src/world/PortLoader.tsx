import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

import { getPortById } from '@/data/ports'
import { useCoordinateBridge } from '@/nav/useCoordinateBridge'
import { useGameStore } from '@/state/store'
import {
  clearCollision,
  setCollision,
  type CollisionJson,
} from '@/systems/groundingState'

import { findNearestPortWithinRadius } from './portProximity'

const PROXIMITY_CHECK_EVERY_N_FRAMES = 30 // ~0.5 s at 60 fps

export default function PortLoader() {
  const bridge = useCoordinateBridge()
  const frameCountRef = useRef(0)
  const loadingRef = useRef(false)
  const loadedPortId = useGameStore((s) => s.loadedPortId)
  const setLoadedPortId = useGameStore((s) => s.setLoadedPortId)

  useFrame(() => {
    try {
      frameCountRef.current += 1
      if (frameCountRef.current % PROXIMITY_CHECK_EVERY_N_FRAMES !== 0) return
      if (loadingRef.current) return
      if (!bridge) return

      const { position, loadedPortId: currentId } = useGameStore.getState()
      const [lat, lng] = bridge.localToLatLng([position[0], position[2]])
      const nearest = findNearestPortWithinRadius([lat, lng])
      const nextId = nearest?.id ?? null

      if (currentId === nextId) return

      if (!nextId) {
        console.log(`[PortLoader] Unloaded ${currentId}`)
        clearCollision()
        setLoadedPortId(null)
        return
      }

      const port = getPortById(nextId)
      if (!port) return
      loadingRef.current = true
      fetch(`/assets/models/ports/${port.id}.collision.json`)
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          return res.json() as Promise<CollisionJson>
        })
        .then((json) => {
          setCollision(port.id, json)
          setLoadedPortId(port.id)
          const verts = (json.polygons ?? []).reduce((s, p) => s + p.length, 0)
          const rows = json.depth_grid?.grid?.length ?? 0
          const cols = json.depth_grid?.grid?.[0]?.length ?? 0
          console.log(
            `[PortLoader] Loaded ${port.id}: ${verts} vertices, ${rows}x${cols} depth grid`,
          )
        })
        .catch((e) => {
          console.warn(`[PortLoader] Failed to load collision for ${port.id}:`, e)
        })
        .finally(() => {
          loadingRef.current = false
        })
    } catch (e) {
      console.warn('[PortLoader] frame error:', e)
    }
  })

  // Dev placeholder: a translucent wireframe box hovering above the loaded
  // port's local origin, so the port is visible in the 3D scene until real
  // GLBs land. Distinct size/height so it doesn't overlap the boat.
  if (!loadedPortId || !bridge) return null
  const port = getPortById(loadedPortId)
  if (!port) return null
  const [x, z] = bridge.latLngToLocal([port.lat, port.lng])
  return (
    <mesh position={[x, 30, z]}>
      <boxGeometry args={[40, 4, 40]} />
      <meshStandardMaterial color="#6b7682" transparent opacity={0.3} wireframe />
    </mesh>
  )
}
