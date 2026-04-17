import { describe, it, expect } from 'vitest'

import { mpsToKnots, radiansToCompass, formatDepthFt } from './gauge-format'

describe('mpsToKnots', () => {
  it('converts 0 to 0', () => {
    expect(mpsToKnots(0)).toBe(0)
  })

  it('converts 1 m/s to ~1.94 knots', () => {
    expect(mpsToKnots(1)).toBeCloseTo(1.9438, 3)
  })

  it('handles negative values', () => {
    expect(mpsToKnots(-2)).toBeCloseTo(-3.8876, 3)
  })

  it('returns 0 for NaN', () => {
    expect(mpsToKnots(NaN)).toBe(0)
  })
})

describe('radiansToCompass', () => {
  it('0 rad → 0°', () => {
    expect(radiansToCompass(0)).toBe(0)
  })

  it('π/2 rad → 90°', () => {
    expect(radiansToCompass(Math.PI / 2)).toBe(90)
  })

  it('π rad → 180°', () => {
    expect(radiansToCompass(Math.PI)).toBe(180)
  })

  it('wraps negative headings to 270°', () => {
    expect(radiansToCompass(-Math.PI / 2)).toBe(270)
  })

  it('wraps values beyond 2π', () => {
    expect(radiansToCompass(Math.PI * 3)).toBe(180)
  })

  it('returns 0 for NaN', () => {
    expect(radiansToCompass(NaN)).toBe(0)
  })
})

describe('formatDepthFt', () => {
  it('formats finite depth as rounded integer', () => {
    expect(formatDepthFt(32.7)).toBe('33')
    expect(formatDepthFt(0)).toBe('0')
  })

  it('returns em-dash for Infinity', () => {
    expect(formatDepthFt(Infinity)).toBe('—')
  })

  it('returns em-dash for NaN', () => {
    expect(formatDepthFt(NaN)).toBe('—')
  })
})
