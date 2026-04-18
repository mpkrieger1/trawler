import { useEffect, useMemo, useState } from 'react'
import * as THREE from 'three'

import { getCollision } from '@/systems/groundingState'
import { isDebugActive, toggleDebug } from '@/systems/debugFlags'
import { useGameStore } from '@/state/store'

// Renders collision polygons as red line loops at y=1 so they sit just above
// the water surface. Reads the module-singleton collision state so it picks up
// whatever port PortLoader has hot. PRD §14.6.
export default function CollisionDebugOverlay() {
  const loadedPortId = useGameStore((s) => s.loadedPortId)
  const [active, setActive] = useState<boolean>(() => isDebugActive('collision'))
  const [version, setVersion] = useState(0)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'F3') {
        e.preventDefault()
        setActive(toggleDebug('collision'))
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Re-read collision whenever the loaded port changes.
  useEffect(() => {
    setVersion((v) => v + 1)
  }, [loadedPortId])

  const geometries = useMemo(() => {
    void version
    if (!active) return []
    const col = getCollision()
    if (!col) return []
    return col.collision.polygons.map((poly) => {
      const points = poly.map(([x, z]) => new THREE.Vector3(x, 1, z))
      return new THREE.BufferGeometry().setFromPoints(points)
    })
  }, [active, version, loadedPortId])

  if (!active || geometries.length === 0) return null

  return (
    <group>
      {geometries.map((geom, i) => (
        <lineLoop key={i} geometry={geom}>
          <lineBasicMaterial color="#ff2a2a" linewidth={2} />
        </lineLoop>
      ))}
    </group>
  )
}
