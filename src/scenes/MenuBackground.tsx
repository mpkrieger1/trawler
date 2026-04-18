import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'

import Trawler from '@/boat/Trawler'
import Ocean from '@/world/Ocean'
import SkyDome from '@/world/SkyDome'

// Cinematic framing: offshore-quarter view of the trawler at rest.
// Store defaults (weather='clear', position=[0,0,0], heading=0) are the
// correct menu state; resetEverything() restores them on return from voyage.
const CAMERA_POSITION: [number, number, number] = [35, 14, 35]
const CAMERA_TARGET: [number, number, number] = [0, 2, 0]

export default function MenuBackground() {
  return (
    <Canvas gl={{ antialias: true }} dpr={[1, 2]}>
      <PerspectiveCamera
        makeDefault
        position={CAMERA_POSITION}
        fov={50}
        near={0.1}
        far={20000}
        onUpdate={(self) => self.lookAt(...CAMERA_TARGET)}
      />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 20, 10]} intensity={1} />
      <Suspense fallback={null}>
        <Ocean />
        <SkyDome />
        <Trawler />
      </Suspense>
    </Canvas>
  )
}
