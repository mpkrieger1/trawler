import { useGameStore } from '@/state/store'

import styles from './Hud.module.css'

export default function CameraToggle() {
  const cameraMode = useGameStore((s) => s.cameraMode)
  const setCameraMode = useGameStore((s) => s.setCameraMode)

  const nextLabel = cameraMode === '3d' ? 'Chart' : '3D View'

  return (
    <button
      type="button"
      className={styles.cameraToggle}
      onClick={() => setCameraMode(cameraMode === '3d' ? 'chart' : '3d')}
      aria-label={`Switch to ${nextLabel}`}
    >
      {nextLabel}
    </button>
  )
}
