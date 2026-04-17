import { useEffect } from 'react'

import { useGameStore } from '@/state/store'

const MOVE_SPEED = 0.5
const TURN_SPEED = 0.03

export default function DebugControls() {
  useEffect(() => {
    const keys = new Set<string>()

    const onKeyDown = (e: KeyboardEvent) => keys.add(e.key.toLowerCase())
    const onKeyUp = (e: KeyboardEvent) => keys.delete(e.key.toLowerCase())

    const interval = setInterval(() => {
      const state = useGameStore.getState()
      const [x, y, z] = state.position
      let heading = state.heading

      if (keys.has('a') || keys.has('arrowleft')) heading += TURN_SPEED
      if (keys.has('d') || keys.has('arrowright')) heading -= TURN_SPEED

      let dx = 0
      let dz = 0
      if (keys.has('w') || keys.has('arrowup')) {
        dx += Math.sin(heading) * MOVE_SPEED
        dz += Math.cos(heading) * MOVE_SPEED
      }
      if (keys.has('s') || keys.has('arrowdown')) {
        dx -= Math.sin(heading) * MOVE_SPEED * 0.3
        dz -= Math.cos(heading) * MOVE_SPEED * 0.3
      }

      if (dx !== 0 || dz !== 0 || heading !== state.heading) {
        state.setBoatPosition([x + dx, y, z + dz])
        state.setBoatHeading(heading)
      }
    }, 16)

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      clearInterval(interval)
    }
  }, [])

  return null
}
