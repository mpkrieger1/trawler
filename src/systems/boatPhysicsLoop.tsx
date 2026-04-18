import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

import { stepPhysics } from '@/boat/physics'
import { useCoordinateBridge } from '@/nav/useCoordinateBridge'
import { getCurrentAt } from '@/nav/tides'
import { useGameStore } from '@/state/store'
import { findNearestPortWithinRadius } from '@/world/portProximity'
import { weatherPreset } from '@/world/weatherPresets'

import { effectiveCompression } from './timeCompression'

const MAX_DT = 0.1
const NEAR_PORT_METERS = 1852 // 1 nautical mile
const NEAR_PORT_CHECK_EVERY_N_FRAMES = 30

export default function BoatPhysicsLoop() {
  const bridge = useCoordinateBridge()
  const frameCountRef = useRef(0)
  const isNearPortRef = useRef(false)

  useFrame((_state, delta) => {
    try {
      const s = useGameStore.getState()
      if (s.paused) return
      const dt = Math.min(MAX_DT, delta)

      frameCountRef.current += 1
      if (bridge && frameCountRef.current % NEAR_PORT_CHECK_EVERY_N_FRAMES === 0) {
        const [lat, lng] = bridge.localToLatLng([s.position[0], s.position[2]])
        isNearPortRef.current = findNearestPortWithinRadius([lat, lng], NEAR_PORT_METERS) !== null
      }

      const compression = effectiveCompression(s.timeCompression, {
        isStormy: s.weather === 'stormy',
        isNearPort: isNearPortRef.current,
      })
      const scaledDt = dt * compression

      let fx = 0
      let fz = 0
      if (bridge) {
        const [lat, lng] = bridge.localToLatLng([s.position[0], s.position[2]])
        const current = getCurrentAt([lat, lng], s.gameTime)
        fx += current.vx
        fz += current.vz
      }

      const preset = weatherPreset(s.weather)
      fx += Math.sin(preset.wind.bearingRad) * preset.wind.magnitudeMps
      fz += Math.cos(preset.wind.bearingRad) * preset.wind.magnitudeMps

      const next = stepPhysics(
        { position: s.position, heading: s.heading, velocity: s.velocity },
        { throttle: s.throttle, wheel: s.wheel, externalForce: [fx, fz] },
        scaledDt,
      )
      s.setBoatPosition(next.position)
      s.setBoatHeading(next.heading)
      s.setVelocity(next.velocity)
      s.setDistanceTraveled(s.distanceTraveled + Math.abs(next.velocity) * scaledDt)
      s.setGameTime(s.gameTime + scaledDt)
    } catch (e) {
      console.warn('BoatPhysicsLoop error:', e)
    }
  })
  return null
}
