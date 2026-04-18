import { describe, it, expect } from 'vitest'

import { formatElapsedTime } from '@/scenes/elapsedTime'

describe('formatElapsedTime', () => {
  it('formats zero as 0m 00s', () => {
    expect(formatElapsedTime(0)).toBe('0m 00s')
  })

  it('formats five seconds as 0m 05s', () => {
    expect(formatElapsedTime(5000)).toBe('0m 05s')
  })

  it('formats one minute five seconds as 1m 05s', () => {
    expect(formatElapsedTime(65_000)).toBe('1m 05s')
  })

  it('formats one hour two minutes five seconds as 1h 02m 05s', () => {
    expect(formatElapsedTime(3_725_000)).toBe('1h 02m 05s')
  })

  it('formats negative as 0m 00s (defensive)', () => {
    expect(formatElapsedTime(-1000)).toBe('0m 00s')
  })

  it('formats NaN as 0m 00s (defensive)', () => {
    expect(formatElapsedTime(NaN)).toBe('0m 00s')
  })

  it('formats Infinity as 0m 00s (defensive)', () => {
    expect(formatElapsedTime(Infinity)).toBe('0m 00s')
  })
})
