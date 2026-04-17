import Throttle from './Throttle'
import Wheel from './Wheel'
import GaugeStrip from './GaugeStrip'

import styles from './Hud.module.css'

export default function Hud() {
  return (
    <div className={styles.hud}>
      <Throttle />
      <Wheel />
      <GaugeStrip />
    </div>
  )
}
