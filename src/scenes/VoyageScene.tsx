import { lazy, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'

import BoatPhysicsLoop from '@/systems/boatPhysicsLoop'
import FollowCamera from '@/boat/FollowCamera'
import GroundingLoop from '@/systems/groundingLoop'
import KeyboardControls from '@/boat/KeyboardControls'
import Ocean from '@/world/Ocean'
import PortLoader from '@/world/PortLoader'
import SceneFog from '@/world/SceneFog'
import SkyDome from '@/world/SkyDome'
import Trawler from '@/boat/Trawler'
import GroundingVignette from '@/ui/GroundingVignette'
import Hud from '@/ui/Hud'
import { useGameStore } from '@/state/store'

import transitions from './transitions.module.css'

// Code-split: MapLibre (~800 KB) ships in its own chunk, loaded only
// when the user switches to chart mode (or lands on GameOverScene).
const Chartplotter = lazy(() => import('@/nav/Chartplotter'))

export default function VoyageScene() {
  const cameraMode = useGameStore((s) => s.cameraMode)

  return (
    <div
      className={transitions.sceneFadeIn}
      style={{ position: 'fixed', inset: 0 }}
    >
      {cameraMode === 'chart' ? (
        <Suspense
          fallback={
            <div style={{ position: 'absolute', inset: 0, background: '#0f1419' }} />
          }
        >
          <Chartplotter />
        </Suspense>
      ) : (
        <Canvas
          gl={{
            antialias: true,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.0,
          }}
          dpr={[1, 2]}
          camera={{ fov: 60, near: 0.1, far: 20000 }}
        >
          <SceneFog />
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 20, 10]} intensity={1} />
          <Suspense fallback={null}>
            <Ocean />
            <SkyDome />
            <Trawler />
            <PortLoader />
          </Suspense>
          <BoatPhysicsLoop />
          <GroundingLoop />
          <FollowCamera />
        </Canvas>
      )}
      <KeyboardControls />
      <GroundingVignette />
      <Hud />
    </div>
  )
}
