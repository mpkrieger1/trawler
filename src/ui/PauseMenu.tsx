import { useGameStore } from '@/state/store'

import { resume, returnToMenu } from './pauseMenuActions'
import styles from './PauseMenu.module.css'

export default function PauseMenu() {
  const paused = useGameStore((s) => s.paused)
  if (!paused) return null

  return (
    <div
      className={styles.backdrop}
      role="dialog"
      aria-modal="true"
      aria-label="Paused"
    >
      <div className={styles.card}>
        <h2 className={styles.title}>Paused</h2>
        <button type="button" className={styles.button} onClick={resume}>
          Resume
        </button>
        <button
          type="button"
          className={`${styles.button} ${styles.buttonSecondary}`}
          onClick={returnToMenu}
        >
          Return to Main Menu
        </button>
      </div>
    </div>
  )
}
