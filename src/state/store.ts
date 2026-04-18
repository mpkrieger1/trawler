import { create } from 'zustand'

import type { Vector3Tuple } from 'three'

export type WeatherState = 'clear' | 'overcast' | 'stormy'
export type CameraMode = '3d' | 'chart'
export type ActiveScene = 'menu' | 'voyageSetup' | 'voyage' | 'gameOver'

interface VoyageSlice {
  startPortId: string | null
  destinationPortId: string | null
  weather: WeatherState
  departureTime: number
  timeCompression: number
}

interface BoatSlice {
  position: Vector3Tuple
  heading: number
  velocity: number
  throttle: number
  wheel: number
}

interface WorldSlice {
  gameTime: number
  loadedPortId: string | null
}

interface UiSlice {
  activeScene: ActiveScene
  cameraMode: CameraMode
  paused: boolean
}

interface GroundingSlice {
  warningActive: boolean
  fatalTriggered: boolean
  nearestDistance: number
  depthUnderKeel: number
}

interface GameActions {
  setBoatPosition: (position: Vector3Tuple) => void
  setBoatHeading: (heading: number) => void
  setVelocity: (velocity: number) => void
  setThrottle: (throttle: number) => void
  setWheel: (wheel: number) => void
  setActiveScene: (scene: ActiveScene) => void
  setCameraMode: (mode: CameraMode) => void
  setPaused: (paused: boolean) => void
}

export interface GameState extends VoyageSlice, BoatSlice, WorldSlice, UiSlice, GroundingSlice, GameActions {}

export const useGameStore = create<GameState>()((set) => ({
  // Voyage
  startPortId: null,
  destinationPortId: null,
  weather: 'clear',
  departureTime: 8,
  timeCompression: 1,

  // Boat
  position: [0, 0, 0],
  heading: 0,
  velocity: 0,
  throttle: 0,
  wheel: 0,

  // World
  gameTime: 0,
  loadedPortId: null,

  // UI
  activeScene: 'menu',
  cameraMode: '3d',
  paused: false,

  // Grounding
  warningActive: false,
  fatalTriggered: false,
  nearestDistance: Infinity,
  depthUnderKeel: Infinity,

  // Actions
  setBoatPosition: (position) => set({ position }),
  setBoatHeading: (heading) => set({ heading }),
  setVelocity: (velocity) => set({ velocity }),
  setThrottle: (throttle) => set({ throttle }),
  setWheel: (wheel) => set({ wheel }),
  setActiveScene: (scene) => set({ activeScene: scene }),
  setCameraMode: (mode) => set({ cameraMode: mode }),
  setPaused: (paused) => set({ paused }),
}))
