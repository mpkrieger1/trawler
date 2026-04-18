import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App'
import { useGameStore } from './state/store'

import './index.css'

if (import.meta.env.DEV) {
  ;(window as unknown as { __store: typeof useGameStore }).__store = useGameStore
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
