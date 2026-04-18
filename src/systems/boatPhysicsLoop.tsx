import { useFrame } from '@react-three/fiber'

import { stepPhysics } from '@/boat/physics'
import { useCoordinateBridge } from '@/nav/useCoordinateBridge'
import { getCurrentAt } from '@/nav/tides'
import { useGameStore } from '@/state/store'
import { weatherPreset } from '@/world/weatherPresets'

const MAX_DT = 0.1

export default function BoatPhysicsLoop() {
  const bridge = useCoordinateBridge()

  useFrame((_state, delta) => {
    try {
      const dt = Math.min(MAX_DT, delta)
      const s = useGameStore.getState()

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
        dt,
      )
      s.setBoatPosition(next.position)
      s.setBoatHeading(next.heading)
      s.setVelocity(next.velocity)
      s.setDistanceTraveled(s.distanceTraveled + Math.abs(next.velocity) * dt)
    } catch (e) {
      console.warn('BoatPhysicsLoop error:', e)
    }
  })
  return null
}
