import type { WeatherState } from '@/state/store'

// Pure mapping from weather state to rendering + physics parameters.
// Per PRD §9 and §10.2: clear = #5a7a8a water, calm; stormy = #2b3a42 water,
// strong wind + swell.

export type WeatherPreset = {
  water: {
    distortionScale: number
    colorHex: number
  }
  sky: {
    turbidity: number
    rayleigh: number
    mieCoefficient: number
    sunInclination: number // drei Sky prop (0..1)
    sunAzimuth: number // drei Sky prop (0..1)
  }
  wind: {
    magnitudeMps: number
    bearingRad: number // compass direction wind pushes toward (0 = north, π/2 = east)
  }
  pitchRollScale: number // 0 = still; 1 = stormy
}

const CLEAR: WeatherPreset = {
  water: { distortionScale: 1.0, colorHex: 0x5a7a8a },
  sky: {
    turbidity: 4,
    rayleigh: 1.5,
    mieCoefficient: 0.005,
    sunInclination: 0.5,
    sunAzimuth: 0.25,
  },
  wind: { magnitudeMps: 0.3, bearingRad: Math.PI / 4 },
  pitchRollScale: 0.1,
}

const OVERCAST: WeatherPreset = {
  water: { distortionScale: 3.0, colorHex: 0x4a6670 },
  sky: {
    turbidity: 10,
    rayleigh: 2,
    mieCoefficient: 0.01,
    sunInclination: 0.55,
    sunAzimuth: 0.25,
  },
  wind: { magnitudeMps: 1.5, bearingRad: Math.PI / 4 },
  pitchRollScale: 0.35,
}

const STORMY: WeatherPreset = {
  water: { distortionScale: 6.0, colorHex: 0x2b3a42 },
  sky: {
    turbidity: 20,
    rayleigh: 3,
    mieCoefficient: 0.02,
    sunInclination: 0.6,
    sunAzimuth: 0.3,
  },
  wind: { magnitudeMps: 4.0, bearingRad: Math.PI / 2 },
  pitchRollScale: 1.0,
}

export function weatherPreset(state: WeatherState): WeatherPreset {
  switch (state) {
    case 'clear':
      return CLEAR
    case 'overcast':
      return OVERCAST
    case 'stormy':
      return STORMY
    default:
      return CLEAR
  }
}
