import { Sky } from '@react-three/drei'

import { useGameStore } from '@/state/store'

import { weatherPreset } from './weatherPresets'

const SUN_POSITION: [number, number, number] = [700, 500, 300]

export default function SkyDome() {
  const weather = useGameStore((s) => s.weather)
  const preset = weatherPreset(weather)
  return (
    <Sky
      distance={450000}
      sunPosition={SUN_POSITION}
      inclination={preset.sky.sunInclination}
      azimuth={preset.sky.sunAzimuth}
      turbidity={preset.sky.turbidity}
      rayleigh={preset.sky.rayleigh}
      mieCoefficient={preset.sky.mieCoefficient}
      mieDirectionalG={0.8}
    />
  )
}
