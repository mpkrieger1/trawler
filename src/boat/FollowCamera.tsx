import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

import { useGameStore } from '@/state/store'

const OFFSET_BEHIND = 15
const OFFSET_ABOVE = 8
const LERP_FACTOR = 0.05
const LOOK_AHEAD = 5

const _targetPos = new THREE.Vector3()
const _cameraTarget = new THREE.Vector3()
const _lookAt = new THREE.Vector3()

export default function FollowCamera() {
  const { camera } = useThree()
  const initialized = useRef(false)

  useFrame(() => {
    try {
      const { position, heading } = useGameStore.getState()

      const behindX = Math.sin(heading + Math.PI) * OFFSET_BEHIND
      const behindZ = Math.cos(heading + Math.PI) * OFFSET_BEHIND
      _targetPos.set(
        position[0] + behindX,
        position[1] + OFFSET_ABOVE,
        position[2] + behindZ,
      )

      if (!initialized.current) {
        camera.position.copy(_targetPos)
        initialized.current = true
      } else {
        camera.position.lerp(_targetPos, LERP_FACTOR)
      }

      const aheadX = Math.sin(heading) * LOOK_AHEAD
      const aheadZ = Math.cos(heading) * LOOK_AHEAD
      _lookAt.set(position[0] + aheadX, position[1] + 1, position[2] + aheadZ)
      _cameraTarget.lerp(_lookAt, LERP_FACTOR * 2)
      camera.lookAt(_cameraTarget)
    } catch (e) {
      console.warn('FollowCamera frame error:', e)
    }
  })

  return null
}
