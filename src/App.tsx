import { GameViewport } from './components/GameViewport'
import { useGame } from './game/GameContext'
import { DialogueScene } from './scenes/DialogueScene'
import { EndingScene } from './scenes/EndingScene'
import { HubScene } from './scenes/HubScene'
import { IntroScene } from './scenes/IntroScene'
import { LabCompleteScene } from './scenes/LabCompleteScene'
import { LabInteriorScene } from './scenes/LabInteriorScene'
import { NameEntryScene } from './scenes/NameEntryScene'
import { CvLabScene } from './scenes/CvLabScene'
import { MlLabScene } from './scenes/MlLabScene'
import { NlpLabScene } from './scenes/NlpLabScene'
import { ResearchMapScene } from './scenes/ResearchMapScene'
import { TitleScreen } from './scenes/TitleScreen'

export default function App() {
  const { state } = useGame()
  return (
    <GameViewport>
      {state.screen === 'TITLE' && <TitleScreen />}
      {state.screen === 'INTRO' && <IntroScene />}
      {state.screen === 'NAME_ENTRY' && <NameEntryScene />}
      {state.screen === 'HUB' && <HubScene />}
      {state.screen === 'RESEARCH_MAP' && <ResearchMapScene />}
      {state.screen === 'LAB_INTERIOR' && <LabInteriorScene />}
      {state.screen === 'DIALOGUE' && <DialogueScene />}
      {state.screen === 'MINIGAME' && (
        state.currentLab === 'cv' ? <CvLabScene /> : state.currentLab === 'ml' ? <MlLabScene /> : <NlpLabScene />
      )}
      {state.screen === 'LAB_COMPLETE' && <LabCompleteScene />}
      {state.screen === 'ENDING' && <EndingScene />}
    </GameViewport>
  )
}
