import { useRef } from 'react'

import { useGameStore } from '@/state/store'
import { wheelInputState } from './wheelInputState'

import styles from './Hud.module.css'

const MAX_VISUAL_ROTATION_DEG = 45

export default function Wheel() {
  const wheelRef = useRef<HTMLDivElement>(null)
  const startAngleRef = useRef<number | null>(null)
  const startValueRef = useRef(0)
  const wheel = useGameStore((s) => s.wheel)
  const setWheel = useGameStore((s) => s.setWheel)

  function angleFromPointer(e: React.PointerEvent<HTMLDivElement>): number {
    const body = wheelRef.current
    if (!body) return 0
    const rect = body.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    return Math.atan2(e.clientX - cx, -(e.clientY - cy))
  }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId)
    wheelInputState.pointerDragging = true
    startAngleRef.current = angleFromPointer(e)
    startValueRef.current = useGameStore.getState().wheel
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!wheelInputState.pointerDragging || startAngleRef.current === null) return
    const current = angleFromPointer(e)
    const delta = current - startAngleRef.current
    const deltaValue = delta / ((MAX_VISUAL_ROTATION_DEG * Math.PI) / 180)
    const next = Math.max(-1, Math.min(1, startValueRef.current + deltaValue))
    setWheel(next)
  }

  function onPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    e.currentTarget.releasePointerCapture(e.pointerId)
    wheelInputState.pointerDragging = false
    startAngleRef.current = null
  }

  const spokeRotation = wheel * MAX_VISUAL_ROTATION_DEG

  return (
    <div className={styles.wheel}>
      <div className={styles.wheelLabel}>WHEEL</div>
      <div
        ref={wheelRef}
        className={styles.wheelBody}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div
          className={styles.wheelSpoke}
          style={{ transform: `translate(-50%, 0) rotate(${spokeRotation}deg)` }}
        />
        <div className={styles.wheelCenter} />
      </div>
    </div>
  )
}
