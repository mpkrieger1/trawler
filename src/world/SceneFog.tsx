import { useGameStore } from '@/state/store'

import { weatherPreset } from './weatherPresets'

// Scene-level linear fog, color + distances driven by the current weather
// preset. Mount inside a <Canvas> so R3F attaches to scene.fog.
export default function SceneFog() {
  const weather = useGameStore((s) => s.weather)
  const { fog } = weatherPreset(weather)
  return <fog attach="fog" args={[fog.colorHex, fog.near, fog.far]} />
}
