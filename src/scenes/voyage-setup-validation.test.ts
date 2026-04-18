import { describe, it, expect } from 'vitest'

import { canStartVoyage } from '@/scenes/voyage-setup-validation'

describe('canStartVoyage', () => {
  it('rejects when start is unset', () => {
    expect(canStartVoyage({ startId: null, destId: null })).toEqual({
      ok: false,
      reason: 'SELECT_START',
    })
    expect(canStartVoyage({ startId: null, destId: 'juneau' })).toEqual({
      ok: false,
      reason: 'SELECT_START',
    })
  })

  it('rejects when destination is unset but start is set', () => {
    expect(canStartVoyage({ startId: 'seattle', destId: null })).toEqual({
      ok: false,
      reason: 'SELECT_DEST',
    })
  })

  it('rejects when start and destination are the same', () => {
    expect(canStartVoyage({ startId: 'seattle', destId: 'seattle' })).toEqual({
      ok: false,
      reason: 'SAME_PORT',
    })
  })

  it('accepts distinct start and destination', () => {
    expect(canStartVoyage({ startId: 'seattle', destId: 'juneau' })).toEqual({
      ok: true,
    })
  })
})
