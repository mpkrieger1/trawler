import { useGameStore } from '@/state/store'
import { clearCollision } from '@/systems/groundingState'

export function resume(): void {
  useGameStore.getState().setPaused(false)
}

// resetEverything() sets activeScene to 'menu' internally, so no explicit
// setActiveScene call is needed here. Matches the GameOverScene
// onMainMenu pattern (GameOverScene.tsx → onMainMenu).
export function returnToMenu(): void {
  clearCollision()
  useGameStore.getState().resetEverything()
}
