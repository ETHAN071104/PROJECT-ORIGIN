import { GameViewport } from './components/GameViewport'
import { useGame } from './game/GameContext'
import { DialogueScene } from './scenes/DialogueScene'
import { EndingScene } from './scenes/EndingScene'
import { HubScene } from './scenes/HubScene'
import { IntroScene } from './scenes/IntroScene'
import { LabCompleteScene } from './scenes/LabCompleteScene'
import { LabInteriorScene } from './scenes/LabInteriorScene'
import { NameEntryScene } from './scenes/NameEntryScene'
import { StagePlaceholderScene } from './scenes/StagePlaceholderScene'
import { CvLabScene } from './scenes/CvLabScene'
import { TitleScreen } from './scenes/TitleScreen'

export default function App() {
  const { state } = useGame()
  return (
    <GameViewport>
      {state.screen === 'TITLE' && <TitleScreen />}
      {state.screen === 'INTRO' && <IntroScene />}
      {state.screen === 'NAME_ENTRY' && <NameEntryScene />}
      {state.screen === 'HUB' && <HubScene />}
      {state.screen === 'LAB_INTERIOR' && <LabInteriorScene />}
      {state.screen === 'DIALOGUE' && <DialogueScene />}
      {state.screen === 'MINIGAME' && (state.currentLab === 'cv' ? <CvLabScene /> : <StagePlaceholderScene />)}
      {state.screen === 'LAB_COMPLETE' && <LabCompleteScene />}
      {state.screen === 'ENDING' && <EndingScene />}
    </GameViewport>
  )
}
