import { getPortById } from '@/data/ports'
import Chartplotter from '@/nav/Chartplotter'
import { formatDistanceNm } from '@/nav/routing'
import { useGameStore } from '@/state/store'
import { clearCollision } from '@/systems/groundingState'

import { formatElapsedTime } from './elapsedTime'
import styles from './GameOver.module.css'
import transitions from './transitions.module.css'

export default function GameOverScene() {
  const groundingPortId = useGameStore((s) => s.groundingPortId)
  const distanceTraveled = useGameStore((s) => s.distanceTraveled)
  const voyageStartTime = useGameStore((s) => s.voyageStartTime)
  const resetVoyageRuntime = useGameStore((s) => s.resetVoyageRuntime)
  const resetEverything = useGameStore((s) => s.resetEverything)
  const setActiveScene = useGameStore((s) => s.setActiveScene)

  const port = groundingPortId ? getPortById(groundingPortId) : null
  const portName = port?.name ?? 'an unknown port'
  const elapsedMs = voyageStartTime ? Date.now() - voyageStartTime : 0

  const onTryAgain = () => {
    clearCollision()
    resetVoyageRuntime()
    setActiveScene('voyage')
  }

  const onMainMenu = () => {
    clearCollision()
    resetEverything()
  }

  return (
    <div className={`${styles.scene} ${transitions.sceneFadeIn}`}>
      <div className={styles.chartLayer}>
        <Chartplotter />
      </div>
      <div className={styles.overlay}>
        <div className={styles.card}>
          <h1 className={styles.title}>Ran Aground</h1>
          <p className={styles.subtitle}>near {portName}</p>

          <dl className={styles.stats}>
            <div className={styles.stat}>
              <dt>Distance</dt>
              <dd>{formatDistanceNm(distanceTraveled)}</dd>
            </div>
            <div className={styles.stat}>
              <dt>Time</dt>
              <dd>{formatElapsedTime(elapsedMs)}</dd>
            </div>
          </dl>

          <div className={styles.buttons}>
            <button type="button" className={styles.tryAgain} onClick={onTryAgain}>
              Try Again
            </button>
            <button type="button" className={styles.mainMenu} onClick={onMainMenu}>
              Return to Main Menu
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
