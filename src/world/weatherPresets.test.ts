import { describe, it, expect } from 'vitest'

import { weatherPreset } from '@/world/weatherPresets'

describe('weatherPreset', () => {
  it('returns the full preset shape for every weather state', () => {
    for (const state of ['clear', 'overcast', 'stormy'] as const) {
      const p = weatherPreset(state)
      expect(p.water.distortionScale).toBeGreaterThan(0)
      expect(typeof p.water.colorHex).toBe('number')
      expect(p.sky.turbidity).toBeGreaterThan(0)
      expect(Number.isFinite(p.sky.rayleigh)).toBe(true)
      expect(Number.isFinite(p.sky.mieCoefficient)).toBe(true)
      expect(Number.isFinite(p.sky.sunInclination)).toBe(true)
      expect(Number.isFinite(p.sky.sunAzimuth)).toBe(true)
      expect(Number.isFinite(p.wind.magnitudeMps)).toBe(true)
      expect(Number.isFinite(p.wind.bearingRad)).toBe(true)
      expect(p.pitchRollScale).toBeGreaterThanOrEqual(0)
    }
  })

  it('orders distortion scale Clear < Overcast < Stormy', () => {
    const c = weatherPreset('clear').water.distortionScale
    const o = weatherPreset('overcast').water.distortionScale
    const s = weatherPreset('stormy').water.distortionScale
    expect(c).toBeLessThan(o)
    expect(o).toBeLessThan(s)
  })

  it('Stormy water color is darker than Clear (lower luminance)', () => {
    const lum = (hex: number) => {
      const r = (hex >> 16) & 0xff
      const g = (hex >> 8) & 0xff
      const b = hex & 0xff
      return 0.2126 * r + 0.7152 * g + 0.0722 * b
    }
    expect(lum(weatherPreset('stormy').water.colorHex)).toBeLessThan(
      lum(weatherPreset('clear').water.colorHex),
    )
  })

  it('orders wind magnitude Clear < Overcast < Stormy', () => {
    expect(weatherPreset('clear').wind.magnitudeMps).toBeLessThan(
      weatherPreset('overcast').wind.magnitudeMps,
    )
    expect(weatherPreset('overcast').wind.magnitudeMps).toBeLessThan(
      weatherPreset('stormy').wind.magnitudeMps,
    )
  })

  it('orders pitchRollScale Clear < Overcast < Stormy', () => {
    expect(weatherPreset('clear').pitchRollScale).toBeLessThan(
      weatherPreset('overcast').pitchRollScale,
    )
    expect(weatherPreset('overcast').pitchRollScale).toBeLessThan(
      weatherPreset('stormy').pitchRollScale,
    )
  })

  it('falls back to Clear preset for unknown weather (defensive)', () => {
    const fallback = weatherPreset('unknown' as unknown as 'clear')
    expect(fallback).toEqual(weatherPreset('clear'))
  })

  it('uses PRD palette water colors (#5a7a8a clear, #2b3a42 stormy)', () => {
    expect(weatherPreset('clear').water.colorHex).toBe(0x5a7a8a)
    expect(weatherPreset('stormy').water.colorHex).toBe(0x2b3a42)
  })
})
