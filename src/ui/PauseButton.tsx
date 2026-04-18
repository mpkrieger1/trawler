import { useGameStore } from '@/state/store'

import styles from './Hud.module.css'

export default function PauseButton() {
  const setPaused = useGameStore((s) => s.setPaused)
  return (
    <button
      type="button"
      className={styles.pauseButton}
      onClick={() => setPaused(true)}
      aria-label="Pause"
    >
      ❙❙
    </button>
  )
}
