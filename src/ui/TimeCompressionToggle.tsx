import { useGameStore } from '@/state/store'
import {
  COMPRESSION_LEVELS,
  effectiveCompression,
} from '@/systems/timeCompression'

import styles from './Hud.module.css'

export default function TimeCompressionToggle() {
  const selected = useGameStore((s) => s.timeCompression)
  const weather = useGameStore((s) => s.weather)
  const loadedPortId = useGameStore((s) => s.loadedPortId)
  const setTimeCompression = useGameStore((s) => s.setTimeCompression)

  const isStormy = weather === 'stormy'
  const isNearPort = loadedPortId !== null
  const effective = effectiveCompression(selected, { isStormy, isNearPort })
  const capped = effective !== selected
  const reason = isNearPort ? 'near port' : isStormy ? 'stormy' : null

  return (
    <div className={styles.timeCompression} role="radiogroup" aria-label="Time compression">
      <div className={styles.timeCompressionRow}>
        {COMPRESSION_LEVELS.map((level) => {
          const isSelected = selected === level
          const isActive = effective === level
          return (
            <button
              type="button"
              key={level}
              role="radio"
              aria-checked={isSelected}
              className={`${styles.compressionSegment} ${isSelected ? styles.compressionSegmentSelected : ''} ${!isSelected && isActive ? styles.compressionSegmentEffective : ''}`}
              onClick={() => setTimeCompression(level)}
            >
              {level}×
            </button>
          )
        })}
      </div>
      {capped && reason ? (
        <div className={styles.compressionCapLabel}>
          Capped to {effective}× ({reason})
        </div>
      ) : null}
    </div>
  )
}
