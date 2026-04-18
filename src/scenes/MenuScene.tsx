import { useGameStore } from '@/state/store'

import MenuBackground from './MenuBackground'

import styles from './Menu.module.css'
import transitions from './transitions.module.css'

export default function MenuScene() {
  const setActiveScene = useGameStore((s) => s.setActiveScene)

  return (
    <div className={`${styles.menu} ${transitions.sceneFadeIn}`}>
      <div className={styles.background}>
        <MenuBackground />
      </div>
      <div className={styles.card}>
        <h1 className={styles.title}>Trawler Captain</h1>
        <p className={styles.subtitle}>Inside Passage · Seattle to Juneau</p>
        <button
          type="button"
          className={styles.startButton}
          onClick={() => setActiveScene('voyageSetup')}
        >
          New Voyage
        </button>
      </div>
    </div>
  )
}
