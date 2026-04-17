import { describe, it, expect } from 'vitest'

import { snapToDetent } from './throttle-detents'

describe('snapToDetent', () => {
  it('snaps values near 0 to 0', () => {
    expect(snapToDetent(0.03)).toBe(0)
    expect(snapToDetent(-0.04)).toBe(0)
  })

  it('snaps to exact detent values', () => {
    expect(snapToDetent(0.25)).toBe(0.25)
    expect(snapToDetent(-0.75)).toBe(-0.75)
    expect(snapToDetent(1)).toBe(1)
  })

  it('does not snap beyond tolerance', () => {
    expect(snapToDetent(0.4)).toBe(0.4)
    expect(snapToDetent(-0.6)).toBe(-0.6)
  })

  it('clamps out-of-range to ±1', () => {
    expect(snapToDetent(1.5)).toBe(1)
    expect(snapToDetent(-2)).toBe(-1)
  })

  it('handles NaN and Infinity safely', () => {
    expect(snapToDetent(NaN)).toBe(0)
    expect(snapToDetent(Infinity)).toBe(0)
  })
})
