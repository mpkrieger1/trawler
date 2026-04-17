import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'

import Ocean from '@/world/Ocean'
import SkyDome from '@/world/SkyDome'
import Trawler from '@/boat/Trawler'
import FollowCamera from '@/boat/FollowCamera'
import DebugControls from '@/boat/DebugControls'

export default function App() {
  return (
    <>
      <Canvas
        gl={{ antialias: true }}
        dpr={[1, 2]}
        camera={{ fov: 60, near: 0.1, far: 20000 }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 20, 10]} intensity={1} />
        <Suspense fallback={null}>
          <Ocean />
          <SkyDome />
          <Trawler />
        </Suspense>
        <FollowCamera />
      </Canvas>
      <DebugControls />
    </>
  )
}
