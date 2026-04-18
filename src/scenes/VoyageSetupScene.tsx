import { useMemo } from 'react'

import { PORT_REGIONS, type Port, type PortRegion, ports } from '@/data/ports'
import { useGameStore, type WeatherState } from '@/state/store'

import { canStartVoyage } from './voyage-setup-validation'
import styles from './VoyageSetup.module.css'

type PortColumn = 'start' | 'destination'

const REGION_LABELS: Record<PortRegion, string> = {
  'puget-sound': 'Puget Sound',
  'san-juans': 'San Juan Islands',
  'gulf-islands': 'Gulf Islands & Georgia Strait',
  desolation: 'Desolation Sound & Johnstone Strait',
  'central-bc': 'Central Inside Passage',
  'southeast-ak': 'Southeast Alaska',
}

const WEATHER_OPTIONS: { value: WeatherState; label: string }[] = [
  { value: 'clear', label: 'Clear' },
  { value: 'overcast', label: 'Overcast' },
  { value: 'stormy', label: 'Stormy' },
]

const COMPRESSION_OPTIONS = [1, 5, 15, 30]

function formatHours(h: number): string {
  const hours = Math.floor(h)
  const minutes = Math.round((h - hours) * 60)
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

function groupPortsByRegion(): { region: PortRegion; ports: Port[] }[] {
  return PORT_REGIONS.map((region) => ({
    region,
    ports: ports.filter((p) => p.region === region),
  })).filter((g) => g.ports.length > 0)
}

export default function VoyageSetupScene() {
  const {
    startPortId,
    destinationPortId,
    weather,
    departureTime,
    timeCompression,
    setStartPortId,
    setDestinationPortId,
    setWeather,
    setDepartureTime,
    setTimeCompression,
    setActiveScene,
  } = useGameStore()

  const grouped = useMemo(groupPortsByRegion, [])
  const start = canStartVoyage({ startId: startPortId, destId: destinationPortId })

  const onStart = () => {
    if (!start.ok) return
    setActiveScene('voyage')
  }

  const renderColumn = (column: PortColumn) => {
    const selectedId = column === 'start' ? startPortId : destinationPortId
    const setter = column === 'start' ? setStartPortId : setDestinationPortId
    const heading = column === 'start' ? 'Starting Port' : 'Destination'
    return (
      <section className={styles.column}>
        <h2 className={styles.columnHeading}>{heading}</h2>
        <div className={styles.columnScroll}>
          {grouped.map((g) => (
            <div key={g.region} className={styles.regionGroup}>
              <h3 className={styles.regionHeading}>{REGION_LABELS[g.region]}</h3>
              {g.ports.map((p) => {
                const isSelected = selectedId === p.id
                return (
                  <button
                    type="button"
                    key={p.id}
                    className={`${styles.portRow} ${isSelected ? styles.portRowSelected : ''}`}
                    onClick={() => setter(p.id)}
                  >
                    <span className={styles.portName}>{p.name}</span>
                    <span className={styles.portCoord}>
                      {p.lat.toFixed(2)}°N, {Math.abs(p.lng).toFixed(2)}°W
                    </span>
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </section>
    )
  }

  const startHelp =
    start.ok
      ? 'Ready to depart'
      : start.reason === 'SELECT_START'
        ? 'Pick a starting port'
        : start.reason === 'SELECT_DEST'
          ? 'Pick a destination'
          : 'Start and destination must differ'

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <h1 className={styles.title}>Plan Your Voyage</h1>
        <button
          type="button"
          className={styles.backButton}
          onClick={() => setActiveScene('menu')}
        >
          ← Menu
        </button>
      </header>

      <div className={styles.columns}>
        {renderColumn('start')}
        {renderColumn('destination')}
      </div>

      <section className={styles.controls}>
        <div className={styles.controlGroup}>
          <label className={styles.label}>Weather</label>
          <div className={styles.radioRow}>
            {WEATHER_OPTIONS.map((o) => (
              <label
                key={o.value}
                className={`${styles.radio} ${weather === o.value ? styles.radioSelected : ''}`}
              >
                <input
                  type="radio"
                  name="weather"
                  value={o.value}
                  checked={weather === o.value}
                  onChange={() => setWeather(o.value)}
                />
                <span>{o.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className={styles.controlGroup}>
          <label className={styles.label} htmlFor="departure">
            Departure <span className={styles.valueMono}>{formatHours(departureTime)}</span>
          </label>
          <input
            id="departure"
            type="range"
            min={0}
            max={24}
            step={0.5}
            value={departureTime}
            onChange={(e) => setDepartureTime(Number(e.target.value))}
            className={styles.slider}
          />
        </div>

        <div className={styles.controlGroup}>
          <label className={styles.label}>Time compression</label>
          <div className={styles.segmented}>
            {COMPRESSION_OPTIONS.map((level) => (
              <button
                type="button"
                key={level}
                className={`${styles.segment} ${timeCompression === level ? styles.segmentSelected : ''}`}
                onClick={() => setTimeCompression(level)}
              >
                {level}×
              </button>
            ))}
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <span className={styles.help}>{startHelp}</span>
        <button
          type="button"
          className={styles.startButton}
          disabled={!start.ok}
          onClick={onStart}
        >
          Start Voyage
        </button>
      </footer>
    </div>
  )
}
