import { lazy, Suspense } from 'react'

import { getPortById } from '@/data/ports'
import { formatDistanceNm } from '@/nav/routing'
import { useGameStore } from '@/state/store'
import { clearCollision } from '@/systems/groundingState'

import { formatElapsedTime } from './elapsedTime'
import styles from './GameOver.module.css'
import transitions from './transitions.module.css'

// Shares the same chunk as VoyageScene's lazy Chartplotter.
const Chartplotter = lazy(() => import('@/nav/Chartplotter'))

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
        <Suspense
          fallback={
            <div style={{ position: 'absolute', inset: 0, background: '#0f1419' }} />
          }
        >
          <Chartplotter />
        </Suspense>
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
