import { useGameStore } from '@/state/store'
import { mpsToKnots, radiansToCompass, formatDepthFt } from './gauge-format'

import styles from './Hud.module.css'

export default function GaugeStrip() {
  const velocity = useGameStore((s) => s.velocity)
  const heading = useGameStore((s) => s.heading)
  const depthUnderKeel = useGameStore((s) => s.depthUnderKeel)

  const speedKnots = mpsToKnots(velocity).toFixed(1)
  const compass = radiansToCompass(heading).toString().padStart(3, '0')
  const depth = formatDepthFt(depthUnderKeel)

  return (
    <div className={styles.gaugeStrip}>
      <div className={styles.gauge}>
        <div className={styles.gaugeLabel}>SPEED</div>
        <div className={styles.gaugeValue}>
          {speedKnots}
          <span className={styles.gaugeUnit}>kt</span>
        </div>
      </div>
      <div className={styles.gauge}>
        <div className={styles.gaugeLabel}>HEADING</div>
        <div className={styles.gaugeValue}>
          {compass}
          <span className={styles.gaugeUnit}>°</span>
        </div>
      </div>
      <div className={styles.gauge}>
        <div className={styles.gaugeLabel}>DEPTH</div>
        <div className={styles.gaugeValue}>
          {depth}
          <span className={styles.gaugeUnit}>ft</span>
        </div>
      </div>
    </div>
  )
}
