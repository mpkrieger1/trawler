import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

import { useGameStore } from '@/state/store'
import { weatherPreset } from '@/world/weatherPresets'

const HULL_COLOR = '#e8e0d4'
const CABIN_COLOR = '#f5f0e8'
const TRIM_COLOR = '#2C2E73'

const ROLL_FREQ_HZ = 0.35
const PITCH_FREQ_HZ = 0.55
const ROLL_AMP_RAD = 0.15
const PITCH_AMP_RAD = 0.08

export default function Trawler() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((_state, delta) => {
    try {
      if (!groupRef.current) return
      const { position, heading, weather } = useGameStore.getState()
      const preset = weatherPreset(weather)
      const t = _state.clock.elapsedTime

      groupRef.current.position.set(position[0], position[1], position[2])
      groupRef.current.rotation.y = heading
      groupRef.current.rotation.z =
        Math.sin(t * 2 * Math.PI * ROLL_FREQ_HZ) * ROLL_AMP_RAD * preset.pitchRollScale
      groupRef.current.rotation.x =
        Math.sin(t * 2 * Math.PI * PITCH_FREQ_HZ) * PITCH_AMP_RAD * preset.pitchRollScale

      void delta
    } catch (e) {
      console.warn('Trawler frame error:', e)
    }
  })

  return (
    <group ref={groupRef}>
      {/* Hull */}
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[3, 1.2, 10]} />
        <meshStandardMaterial color={HULL_COLOR} />
      </mesh>
      {/* Bow taper */}
      <mesh position={[0, 0.3, -5.5]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[2, 0.8, 2]} />
        <meshStandardMaterial color={HULL_COLOR} />
      </mesh>
      {/* Cabin */}
      <mesh position={[0, 1.6, 0.5]}>
        <boxGeometry args={[2.4, 1.8, 4]} />
        <meshStandardMaterial color={CABIN_COLOR} />
      </mesh>
      {/* Pilothouse */}
      <mesh position={[0, 3, 0]}>
        <boxGeometry args={[2, 1, 2.5]} />
        <meshStandardMaterial color={CABIN_COLOR} />
      </mesh>
      {/* Trim stripe */}
      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[3.05, 0.15, 10.05]} />
        <meshStandardMaterial color={TRIM_COLOR} />
      </mesh>
      {/* Mast */}
      <mesh position={[0, 4.5, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 2, 8]} />
        <meshStandardMaterial color="#555" />
      </mesh>
    </group>
  )
}
