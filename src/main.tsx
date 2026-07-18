import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { GameProvider } from './game/GameContext'
import './styles/index.css'
import './styles/cv.css'
import './styles/ml.css'
import './styles/nlp.css'
import './styles/dl.css'
import './styles/maps.css'
import './styles/title.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GameProvider>
      <App />
    </GameProvider>
  </StrictMode>,
)
