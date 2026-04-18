import { create } from 'zustand'

import type { Vector3Tuple } from 'three'

export type WeatherState = 'clear' | 'overcast' | 'stormy'
export type CameraMode = '3d' | 'chart'
export type ActiveScene = 'menu' | 'voyageSetup' | 'voyage' | 'gameOver'

interface VoyageSlice {
  startPortId: string | null
  destinationPortId: string | null
  weather: WeatherState
  // hours since midnight, 0–24 (float allowed)
  departureTime: number
  timeCompression: number
  // Runtime fields set on Start Voyage, reset on Try Again / Return to Main Menu
  voyageStartTime: number | null
  distanceTraveled: number
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
  // True when the boat is within 1 nm (~1852 m) of any port center.
  // Authoritative source: boatPhysicsLoop updates this every 30 frames.
  // Distinct from loadedPortId !== null, which is a 5 km radius check.
  isNearPort: boolean
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
  groundingLocation: [number, number] | null
  groundingPortId: string | null
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
  setStartPortId: (id: string | null) => void
  setDestinationPortId: (id: string | null) => void
  setWeather: (weather: WeatherState) => void
  setDepartureTime: (hours: number) => void
  setTimeCompression: (level: number) => void
  setLoadedPortId: (id: string | null) => void
  setIsNearPort: (near: boolean) => void
  setWarningActive: (active: boolean) => void
  setFatalTriggered: (triggered: boolean) => void
  setNearestDistance: (distance: number) => void
  setDepthUnderKeel: (clearance: number) => void
  setGroundingLocation: (location: [number, number] | null) => void
  setGroundingPortId: (id: string | null) => void
  setVoyageStartTime: (ts: number | null) => void
  setDistanceTraveled: (meters: number) => void
  setGameTime: (t: number) => void
  resetVoyageRuntime: () => void
  resetEverything: () => void
}

export interface GameState extends VoyageSlice, BoatSlice, WorldSlice, UiSlice, GroundingSlice, GameActions {}

export const useGameStore = create<GameState>()((set) => ({
  // Voyage
  startPortId: null,
  destinationPortId: null,
  weather: 'clear',
  departureTime: 8,
  timeCompression: 1,
  voyageStartTime: null,
  distanceTraveled: 0,

  // Boat
  position: [0, 0, 0],
  heading: 0,
  velocity: 0,
  throttle: 0,
  wheel: 0,

  // World
  gameTime: 0,
  loadedPortId: null,
  isNearPort: false,

  // UI
  activeScene: 'menu',
  cameraMode: '3d',
  paused: false,

  // Grounding
  warningActive: false,
  fatalTriggered: false,
  nearestDistance: Infinity,
  depthUnderKeel: Infinity,
  groundingLocation: null,
  groundingPortId: null,

  // Actions
  setBoatPosition: (position) => set({ position }),
  setBoatHeading: (heading) => set({ heading }),
  setVelocity: (velocity) => set({ velocity }),
  setThrottle: (throttle) => set({ throttle }),
  setWheel: (wheel) => set({ wheel }),
  setActiveScene: (scene) => set({ activeScene: scene }),
  setCameraMode: (mode) => set({ cameraMode: mode }),
  setPaused: (paused) => set({ paused }),
  setStartPortId: (startPortId) => set({ startPortId }),
  setDestinationPortId: (destinationPortId) => set({ destinationPortId }),
  setWeather: (weather) => set({ weather }),
  setDepartureTime: (departureTime) => set({ departureTime }),
  setTimeCompression: (timeCompression) => set({ timeCompression }),
  setLoadedPortId: (loadedPortId) => set({ loadedPortId }),
  setIsNearPort: (isNearPort) => set({ isNearPort }),
  setWarningActive: (warningActive) => set({ warningActive }),
  setFatalTriggered: (fatalTriggered) => set({ fatalTriggered }),
  setNearestDistance: (nearestDistance) => set({ nearestDistance }),
  setDepthUnderKeel: (depthUnderKeel) => set({ depthUnderKeel }),
  setGroundingLocation: (groundingLocation) => set({ groundingLocation }),
  setGroundingPortId: (groundingPortId) => set({ groundingPortId }),
  setVoyageStartTime: (voyageStartTime) => set({ voyageStartTime }),
  setDistanceTraveled: (distanceTraveled) => set({ distanceTraveled }),
  setGameTime: (gameTime) => set({ gameTime }),
  resetVoyageRuntime: () =>
    set({
      position: [0, 0, 0],
      heading: 0,
      velocity: 0,
      throttle: 0,
      wheel: 0,
      warningActive: false,
      fatalTriggered: false,
      nearestDistance: Infinity,
      depthUnderKeel: Infinity,
      groundingLocation: null,
      groundingPortId: null,
      loadedPortId: null,
      isNearPort: false,
      distanceTraveled: 0,
      voyageStartTime: Date.now(),
    }),
  resetEverything: () =>
    set({
      startPortId: null,
      destinationPortId: null,
      weather: 'clear',
      departureTime: 8,
      timeCompression: 1,
      voyageStartTime: null,
      distanceTraveled: 0,
      position: [0, 0, 0],
      heading: 0,
      velocity: 0,
      throttle: 0,
      wheel: 0,
      loadedPortId: null,
      isNearPort: false,
      warningActive: false,
      fatalTriggered: false,
      nearestDistance: Infinity,
      depthUnderKeel: Infinity,
      groundingLocation: null,
      groundingPortId: null,
      activeScene: 'menu',
      cameraMode: '3d',
      paused: false,
    }),
}))
