import CameraToggle from './CameraToggle'
import GaugeStrip from './GaugeStrip'
import Throttle from './Throttle'
import TimeCompressionToggle from './TimeCompressionToggle'
import Wheel from './Wheel'

import styles from './Hud.module.css'

export default function Hud() {
  return (
    <div className={styles.hud}>
      <CameraToggle />
      <TimeCompressionToggle />
      <Throttle />
      <Wheel />
      <GaugeStrip />
    </div>
  )
}
