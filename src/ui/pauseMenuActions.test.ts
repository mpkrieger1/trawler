import { beforeEach, describe, expect, it } from 'vitest'

import { useGameStore } from '@/state/store'
import {
  clearCollision,
  getCollision,
  setCollision,
  type CollisionJson,
} from '@/systems/groundingState'

import { resume, returnToMenu } from './pauseMenuActions'

const STUB_COLLISION: CollisionJson = {
  port: 'seattle',
  polygons: [],
  depth_grid: { cell_size: 50, origin: [-5000, -5000], grid: [] },
}

describe('pauseMenuActions', () => {
  beforeEach(() => {
    useGameStore.getState().resetEverything()
    clearCollision()
  })

  it('resume clears the paused flag', () => {
    useGameStore.getState().setPaused(true)
    expect(useGameStore.getState().paused).toBe(true)
    resume()
    expect(useGameStore.getState().paused).toBe(false)
  })

  it('returnToMenu resets voyage state and sends the user to the menu', () => {
    const s = useGameStore.getState()
    s.setStartPortId('seattle')
    s.setDestinationPortId('friday-harbor')
    s.setBoatPosition([123, 0, 456])
    s.setPaused(true)
    s.setActiveScene('voyage')

    returnToMenu()

    const after = useGameStore.getState()
    expect(after.activeScene).toBe('menu')
    expect(after.paused).toBe(false)
    expect(after.startPortId).toBeNull()
    expect(after.destinationPortId).toBeNull()
    expect(after.position).toEqual([0, 0, 0])
  })

  it('returnToMenu clears module-level collision state (not just the store)', () => {
    setCollision('seattle', STUB_COLLISION)
    expect(getCollision()).not.toBeNull()
    returnToMenu()
    expect(getCollision()).toBeNull()
  })
})
