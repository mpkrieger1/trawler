import GameOverScene from '@/scenes/GameOverScene'
import MenuScene from '@/scenes/MenuScene'
import VoyageScene from '@/scenes/VoyageScene'
import VoyageSetupScene from '@/scenes/VoyageSetupScene'
import { useGameStore } from '@/state/store'

// Keying on activeScene forces React to remount the subtree on change,
// which retriggers the fade-in animation from scenes/transitions.module.css.
export default function App() {
  const activeScene = useGameStore((s) => s.activeScene)

  const scene = (() => {
    switch (activeScene) {
      case 'menu':
        return <MenuScene />
      case 'voyageSetup':
        return <VoyageSetupScene />
      case 'gameOver':
        return <GameOverScene />
      case 'voyage':
      default:
        return <VoyageScene />
    }
  })()

  return <div key={activeScene}>{scene}</div>
}
