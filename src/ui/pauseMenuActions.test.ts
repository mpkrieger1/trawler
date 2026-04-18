import { beforeEach, describe, expect, it } from 'vitest'

import { useGameStore } from '@/state/store'

import { resume, returnToMenu } from './pauseMenuActions'

describe('pauseMenuActions', () => {
  beforeEach(() => {
    useGameStore.getState().resetEverything()
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
})
