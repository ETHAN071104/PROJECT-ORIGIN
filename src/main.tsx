import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { GameProvider } from './game/GameContext'
import './styles/index.css'
import './styles/cv.css'
import './styles/ml.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GameProvider>
      <App />
    </GameProvider>
  </StrictMode>,
)
