import { useGameStore } from '@/state/store'

import styles from './GroundingVignette.module.css'

export default function GroundingVignette() {
  const warningActive = useGameStore((s) => s.warningActive)
  return (
    <div
      className={`${styles.vignette} ${warningActive ? styles.active : ''}`}
      aria-hidden="true"
    />
  )
}
