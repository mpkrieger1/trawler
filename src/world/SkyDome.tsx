import { Sky } from '@react-three/drei'

const SUN_POSITION: [number, number, number] = [700, 500, 300]

export default function SkyDome() {
  return (
    <Sky
      distance={450000}
      sunPosition={SUN_POSITION}
      inclination={0.5}
      azimuth={0.25}
      turbidity={4}
      rayleigh={1.5}
      mieCoefficient={0.005}
      mieDirectionalG={0.8}
    />
  )
}
