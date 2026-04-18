import { describe, it, expect } from 'vitest'

import { COMPRESSION_LEVELS, effectiveCompression } from '@/systems/timeCompression'

describe('effectiveCompression', () => {
  it('passes through selected value when no caps apply', () => {
    expect(effectiveCompression(1, { isStormy: false, isNearPort: false })).toBe(1)
    expect(effectiveCompression(5, { isStormy: false, isNearPort: false })).toBe(5)
    expect(effectiveCompression(15, { isStormy: false, isNearPort: false })).toBe(15)
    expect(effectiveCompression(30, { isStormy: false, isNearPort: false })).toBe(30)
  })

  it('caps at 5× when stormy', () => {
    expect(effectiveCompression(30, { isStormy: true, isNearPort: false })).toBe(5)
    expect(effectiveCompression(15, { isStormy: true, isNearPort: false })).toBe(5)
    expect(effectiveCompression(5, { isStormy: true, isNearPort: false })).toBe(5)
    expect(effectiveCompression(1, { isStormy: true, isNearPort: false })).toBe(1)
  })

  it('forces 1× when near a port', () => {
    expect(effectiveCompression(30, { isStormy: false, isNearPort: true })).toBe(1)
    expect(effectiveCompression(15, { isStormy: false, isNearPort: true })).toBe(1)
    expect(effectiveCompression(1, { isStormy: false, isNearPort: true })).toBe(1)
  })

  it('near-port wins over stormy (both force down, near-port is stricter)', () => {
    expect(effectiveCompression(30, { isStormy: true, isNearPort: true })).toBe(1)
  })

  it('falls back to 1× for non-finite or nonsense inputs', () => {
    expect(effectiveCompression(NaN, { isStormy: false, isNearPort: false })).toBe(1)
    expect(effectiveCompression(Infinity, { isStormy: false, isNearPort: false })).toBe(1)
    expect(effectiveCompression(0, { isStormy: false, isNearPort: false })).toBe(1)
    expect(effectiveCompression(-10, { isStormy: false, isNearPort: false })).toBe(1)
  })

  it('exports the canonical level set', () => {
    expect(COMPRESSION_LEVELS).toEqual([1, 5, 15, 30])
  })
})
