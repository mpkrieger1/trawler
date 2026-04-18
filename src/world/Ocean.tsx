import { useMemo, useRef } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import { Water } from 'three/examples/jsm/objects/Water.js'

import { useGameStore } from '@/state/store'

import { weatherPreset } from './weatherPresets'

const INITIAL_WATER_COLOR = 0x5a7a8a
const SUN_DIRECTION = new THREE.Vector3(0.7, 0.5, 0.3).normalize()

export default function Ocean() {
  const waterRef = useRef<Water>(null)

  const waterNormals = useLoader(
    THREE.TextureLoader,
    '/assets/textures/waternormals.jpg',
  )
  waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping

  const geometry = useMemo(() => new THREE.PlaneGeometry(10000, 10000), [])

  const water = useMemo(() => {
    const w = new Water(geometry, {
      textureWidth: 512,
      textureHeight: 512,
      waterNormals,
      sunDirection: SUN_DIRECTION,
      sunColor: 0xffffff,
      waterColor: INITIAL_WATER_COLOR,
      distortionScale: 1.5,
      fog: false,
    })
    w.rotation.x = -Math.PI / 2
    return w
  }, [geometry, waterNormals])

  useFrame((_state, delta) => {
    try {
      if (!waterRef.current) return
      const material = waterRef.current.material as THREE.ShaderMaterial
      material.uniforms['time'].value += delta * 0.5
      const preset = weatherPreset(useGameStore.getState().weather)
      material.uniforms['distortionScale'].value = preset.water.distortionScale
      const color = material.uniforms['waterColor'].value as THREE.Color
      color.setHex(preset.water.colorHex)
    } catch (e) {
      console.warn('Ocean frame error:', e)
    }
  })

  return <primitive ref={waterRef} object={water} />
}
