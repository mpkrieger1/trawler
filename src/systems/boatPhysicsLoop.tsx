import { useFrame } from '@react-three/fiber'

import { useGameStore } from '@/state/store'
import { stepPhysics } from '@/boat/physics'

const MAX_DT = 0.1

export default function BoatPhysicsLoop() {
  useFrame((_state, delta) => {
    try {
      const dt = Math.min(MAX_DT, delta)
      const s = useGameStore.getState()
      const next = stepPhysics(
        { position: s.position, heading: s.heading, velocity: s.velocity },
        { throttle: s.throttle, wheel: s.wheel, externalForce: [0, 0] },
        dt,
      )
      s.setBoatPosition(next.position)
      s.setBoatHeading(next.heading)
      s.setVelocity(next.velocity)
    } catch (e) {
      console.warn('BoatPhysicsLoop error:', e)
    }
  })
  return null
}
