import { describe, it, expect } from 'vitest'

import { classifyZone, depthToClearanceFt } from '@/systems/groundingZone'

describe('classifyZone', () => {
  it('is safe in deep water and far from coast', () => {
    expect(classifyZone({ distance: 100, depth: -30 })).toBe('safe')
  })

  it('is warning within 30 m of the coastline', () => {
    expect(classifyZone({ distance: 20, depth: -30 })).toBe('warning')
  })

  it('is warning when clearance is under 10 ft (depth=-8, draft=3 → 5 ft clearance)', () => {
    expect(classifyZone({ distance: 100, depth: -8 })).toBe('warning')
  })

  it('is fatal within 5 m of the coastline', () => {
    expect(classifyZone({ distance: 3, depth: -30 })).toBe('fatal')
  })

  it('is fatal when clearance is under 3 ft (depth=-2, draft=3 → -1 ft clearance)', () => {
    expect(classifyZone({ distance: 100, depth: -2 })).toBe('fatal')
  })

  it('is fatal on dry land (positive depth)', () => {
    expect(classifyZone({ distance: 100, depth: 5 })).toBe('fatal')
  })

  it('is fatal when both warning and fatal conditions hold', () => {
    expect(classifyZone({ distance: 3, depth: -2 })).toBe('fatal')
  })

  it('is safe for NaN distance or depth (defensive)', () => {
    expect(classifyZone({ distance: NaN, depth: -30 })).toBe('safe')
    expect(classifyZone({ distance: 100, depth: NaN })).toBe('safe')
  })

  it('respects a custom draft', () => {
    // depth=-6, draft=6 → clearance = 0 < 3 → fatal
    expect(classifyZone({ distance: 100, depth: -6, draftFeet: 6 })).toBe('fatal')
  })
})

describe('depthToClearanceFt', () => {
  it('returns positive clearance for water deeper than draft', () => {
    expect(depthToClearanceFt(-30)).toBe(27)
  })

  it('returns zero when water depth equals draft', () => {
    expect(depthToClearanceFt(-3)).toBe(0)
  })

  it('returns negative clearance on land (positive depth value)', () => {
    expect(depthToClearanceFt(5)).toBe(-8)
  })

  it('returns Infinity for non-finite input (no false alarms)', () => {
    expect(depthToClearanceFt(NaN)).toBe(Infinity)
  })
})
