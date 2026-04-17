import { useRef } from 'react'

import { useGameStore } from '@/state/store'
import { DETENTS, snapToDetent } from './throttle-detents'

import styles from './Hud.module.css'

export default function Throttle() {
  const trackRef = useRef<HTMLDivElement>(null)
  const draggingRef = useRef(false)
  const throttle = useGameStore((s) => s.throttle)
  const setThrottle = useGameStore((s) => s.setThrottle)

  function positionToValue(clientY: number): number {
    const track = trackRef.current
    if (!track) return 0
    const rect = track.getBoundingClientRect()
    const ratio = (clientY - rect.top) / rect.height
    const raw = 1 - ratio * 2
    return Math.max(-1, Math.min(1, raw))
  }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId)
    draggingRef.current = true
    setThrottle(positionToValue(e.clientY))
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!draggingRef.current) return
    setThrottle(positionToValue(e.clientY))
  }

  function onPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    e.currentTarget.releasePointerCapture(e.pointerId)
    draggingRef.current = false
    setThrottle(snapToDetent(useGameStore.getState().throttle))
  }

  const thumbPosition = `${((1 - throttle) / 2) * 100}%`

  return (
    <div className={styles.throttle}>
      <div className={styles.throttleLabel}>THROTTLE</div>
      <div
        ref={trackRef}
        className={styles.throttleTrack}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {DETENTS.map((d) => (
          <div
            key={d}
            className={d === 0 ? styles.throttleCenter : styles.throttleDetent}
            style={{ top: `${((1 - d) / 2) * 100}%` }}
          />
        ))}
        <div className={styles.throttleThumb} style={{ top: thumbPosition }} />
      </div>
    </div>
  )
}
