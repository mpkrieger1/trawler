import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'

import BoatPhysicsLoop from '@/systems/boatPhysicsLoop'
import FollowCamera from '@/boat/FollowCamera'
import KeyboardControls from '@/boat/KeyboardControls'
import Chartplotter from '@/nav/Chartplotter'
import Ocean from '@/world/Ocean'
import PortLoader from '@/world/PortLoader'
import SkyDome from '@/world/SkyDome'
import Trawler from '@/boat/Trawler'
import Hud from '@/ui/Hud'
import { useGameStore } from '@/state/store'

export default function VoyageScene() {
  const cameraMode = useGameStore((s) => s.cameraMode)

  return (
    <>
      {cameraMode === 'chart' ? (
        <Chartplotter />
      ) : (
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
            <PortLoader />
          </Suspense>
          <BoatPhysicsLoop />
          <FollowCamera />
        </Canvas>
      )}
      <KeyboardControls />
      <Hud />
    </>
  )
}
