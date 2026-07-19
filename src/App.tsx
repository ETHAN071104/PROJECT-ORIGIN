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
import { DlLabScene } from './scenes/DlLabScene'
import { ResearchMapScene } from './scenes/ResearchMapScene'
import { HistoryMapScene } from './scenes/HistoryMapScene'
import { PeopleMapScene } from './scenes/PeopleMapScene'
import { TitleScreen } from './scenes/TitleScreen'
import { MusicController } from './components/MusicController'
import { MusicTestPanel } from './components/MusicTestPanel'
import { AtmosphereDebugPanel } from './world/atmosphere/AtmosphereDebugPanel'

export default function App() {
  const { state } = useGame()
  return (
    <GameViewport>
      <MusicController />
      {state.screen === 'TITLE' && <TitleScreen />}
      {state.screen === 'INTRO' && <IntroScene />}
      {state.screen === 'NAME_ENTRY' && <NameEntryScene />}
      {state.screen === 'HUB' && <HubScene />}
      {state.screen === 'HISTORY_MAP' && <HistoryMapScene />}
      {state.screen === 'PEOPLE_MAP' && <PeopleMapScene />}
      {state.screen === 'RESEARCH_MAP' && <ResearchMapScene />}
      {state.screen === 'LAB_INTERIOR' && <LabInteriorScene />}
      {state.screen === 'DIALOGUE' && <DialogueScene />}
      {state.screen === 'MINIGAME' && (
        state.currentLab === 'cv' ? <CvLabScene /> : state.currentLab === 'ml' ? <MlLabScene /> : state.currentLab === 'nlp' ? <NlpLabScene /> : state.currentLab === 'dl' ? <DlLabScene /> : null
      )}
      {state.screen === 'LAB_COMPLETE' && <LabCompleteScene />}
      {state.screen === 'ENDING' && <EndingScene />}
      <MusicTestPanel />
      <AtmosphereDebugPanel />
    </GameViewport>
  )
}
