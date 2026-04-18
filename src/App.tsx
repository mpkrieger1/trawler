import GameOverScene from '@/scenes/GameOverScene'
import MenuScene from '@/scenes/MenuScene'
import VoyageScene from '@/scenes/VoyageScene'
import VoyageSetupScene from '@/scenes/VoyageSetupScene'
import { useGameStore } from '@/state/store'

export default function App() {
  const activeScene = useGameStore((s) => s.activeScene)

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
}
