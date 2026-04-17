import { useEffect } from 'react'

import { useGameStore } from '@/state/store'
import { wheelInputState } from '@/ui/wheelInputState'

const THROTTLE_RAMP_PER_SEC = 0.5
const WHEEL_HOLD_VALUE = 0.5
const SPRING_BACK_RATE = 4

export default function KeyboardControls() {
  useEffect(() => {
    const keys = new Set<string>()

    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      if (keys.has(key)) return
      keys.add(key)

      const s = useGameStore.getState()
      if (key === ' ') {
        e.preventDefault()
        s.setCameraMode(s.cameraMode === '3d' ? 'chart' : '3d')
      } else if (key === 'escape') {
        s.setPaused(!s.paused)
      } else if (key === '1') {
        useGameStore.setState({ timeCompression: 1 })
      } else if (key === '2') {
        useGameStore.setState({ timeCompression: 5 })
      } else if (key === '3') {
        useGameStore.setState({ timeCompression: 15 })
      } else if (key === '4') {
        useGameStore.setState({ timeCompression: 30 })
      }
    }

    const onKeyUp = (e: KeyboardEvent) => {
      keys.delete(e.key.toLowerCase())
    }

    let rafId: number
    let last = performance.now()
    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000)
      last = now

      const s = useGameStore.getState()
      const upHeld = keys.has('w') || keys.has('arrowup')
      const downHeld = keys.has('s') || keys.has('arrowdown')
      const leftHeld = keys.has('a') || keys.has('arrowleft')
      const rightHeld = keys.has('d') || keys.has('arrowright')

      if (upHeld && !downHeld) {
        s.setThrottle(Math.min(1, s.throttle + THROTTLE_RAMP_PER_SEC * dt))
      } else if (downHeld && !upHeld) {
        s.setThrottle(Math.max(-1, s.throttle - THROTTLE_RAMP_PER_SEC * dt))
      }

      const kbHolding = (leftHeld || rightHeld) && !(leftHeld && rightHeld)
      wheelInputState.keyboardHolding = kbHolding

      if (leftHeld && !rightHeld) {
        s.setWheel(-WHEEL_HOLD_VALUE)
      } else if (rightHeld && !leftHeld) {
        s.setWheel(WHEEL_HOLD_VALUE)
      } else if (!wheelInputState.pointerDragging && s.wheel !== 0) {
        // Centralized spring-back when no input source is active
        const decayed = s.wheel * Math.exp(-SPRING_BACK_RATE * dt)
        const next = Math.abs(decayed) < 0.01 ? 0 : decayed
        s.setWheel(next)
      }

      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return null
}
