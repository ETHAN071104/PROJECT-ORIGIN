import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { GameProvider } from './game/GameContext'
import { AtmosphereProvider } from './world/atmosphere/AtmosphereProvider'
import './styles/index.css'
import './styles/cv.css'
import './styles/ml.css'
import './styles/nlp.css'
import './styles/dl.css'
import './styles/maps.css'
import './styles/title.css'
import './styles/ending.css'
import './styles/music.css'
import './styles/atmosphere.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GameProvider>
      <AtmosphereProvider>
        <App />
      </AtmosphereProvider>
    </GameProvider>
  </StrictMode>,
)

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Installation remains optional; the online game should still launch.
    })
  })
}
