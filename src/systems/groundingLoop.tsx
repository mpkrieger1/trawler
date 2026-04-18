import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

import { useGameStore } from '@/state/store'

import { createGrounding, type Grounding } from './grounding'
import { classifyZone, type GroundingZone, depthToClearanceFt } from './groundingZone'
import { getCollision } from './groundingState'

export default function GroundingLoop() {
  const prevZoneRef = useRef<GroundingZone>('safe')
  const groundingRef = useRef<{ portId: string; g: Grounding } | null>(null)

  useFrame(() => {
    try {
      const state = useGameStore.getState()
      if (state.paused) return
      const col = getCollision()

      if (!col) {
        groundingRef.current = null
        if (state.warningActive || Number.isFinite(state.nearestDistance)) {
          state.setWarningActive(false)
          state.setNearestDistance(Infinity)
          state.setDepthUnderKeel(Infinity)
        }
        prevZoneRef.current = 'safe'
        return
      }

      if (!groundingRef.current || groundingRef.current.portId !== col.portId) {
        groundingRef.current = { portId: col.portId, g: createGrounding(col.collision) }
      }
      const g = groundingRef.current.g

      if (state.fatalTriggered) return

      const [x, , z] = state.position
      const { distance, depth } = g.checkGrounding([x, z])
      const zone = classifyZone({ distance, depth })

      state.setNearestDistance(distance)
      state.setDepthUnderKeel(depthToClearanceFt(depth))
      state.setWarningActive(zone === 'warning' || zone === 'fatal')

      if (zone === 'warning' && prevZoneRef.current === 'safe') {
        try {
          navigator.vibrate?.(80)
        } catch {
          // unsupported — no-op
        }
      }

      if (zone === 'fatal' && prevZoneRef.current !== 'fatal') {
        state.setGroundingLocation([x, z])
        state.setGroundingPortId(col.portId)
        state.setFatalTriggered(true)
        state.setActiveScene('gameOver')
      }

      prevZoneRef.current = zone
    } catch (e) {
      console.warn('[GroundingLoop] frame error:', e)
    }
  })

  return null
}
