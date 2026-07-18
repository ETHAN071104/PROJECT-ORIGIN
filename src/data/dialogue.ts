import type { DialogueLine } from '../game/types'

export const dialogueScripts: Record<string, DialogueLine[]> = {
  'cv-intro': [
    {
      speaker: 'LENS-01',
      portrait: 'mentor',
      text: 'My cameras work perfectly.',
    },
    {
      speaker: 'LENS-01',
      portrait: 'mentor',
      text: 'My understanding does not.',
    },
    {
      speaker: 'LENS-01',
      portrait: 'mentor',
      text: 'Teach me how to see.',
    },
    {
      speaker: '{{player}}',
      portrait: 'player',
      text: 'We learn by looking first?',
      choices: ['Focus the lens', 'Start training'],
    },
    {
      speaker: 'LENS-01',
      portrait: 'mentor',
      text: 'Precisely. Four tests. Short explanations. Excellent lighting.',
    },
  ],
  'ml-intro': [
    {
      speaker: 'PROFESSOR PATTERN',
      portrait: 'mentor',
      text: 'I do not need perfect memory.',
    },
    {
      speaker: 'PROFESSOR PATTERN',
      portrait: 'mentor',
      text: 'I need examples.',
    },
    {
      speaker: 'PROFESSOR PATTERN',
      portrait: 'mentor',
      text: 'Preferably many examples.',
    },
    {
      speaker: '{{player}}',
      portrait: 'player',
      text: 'Then let us find the pattern.',
      choices: ['Show me the data', 'Recalculate dramatically'],
    },
    {
      speaker: 'PROFESSOR PATTERN',
      portrait: 'mentor',
      text: 'Excellent. Wrong guesses are data wearing a fake moustache.',
    },
  ],
  'nlp-intro': [
    {
      speaker: 'LEXI-7',
      portrait: 'mentor',
      text: 'Welcome. Please keep your voice down. The dictionaries are conjugating.',
    },
    {
      speaker: 'LEXI-7',
      portrait: 'mentor',
      text: 'I am LEXI-7. You will connect phrases to intent before we discuss how machines process language.',
    },
    {
      speaker: '{{player}}',
      portrait: 'player',
      text: 'Can machines understand every word?',
      choices: ['Read between the lines', 'Start with the words'],
    },
    {
      speaker: 'LEXI-7',
      portrait: 'mentor',
      text: 'Not quite. Context is the chapter everyone forgets to index. Open the language archive.',
    },
  ],
  'research-locked': [
    {
      speaker: 'ACADEMY CORE',
      portrait: 'system',
      text: 'RESEARCH LAB SEALED. Three foundation lab signals are required.',
    },
    {
      speaker: '{{player}}',
      portrait: 'player',
      text: 'Something behind that door feels familiar.',
    },
  ],
}
