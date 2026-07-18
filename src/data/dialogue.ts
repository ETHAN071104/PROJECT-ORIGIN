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
      text: 'Please keep your voice down. The dictionaries are conjugating.',
    },
    {
      speaker: 'LEXI-7',
      portrait: 'mentor',
      text: 'Words are small. Meaning is not.',
    },
    {
      speaker: 'LEXI-7',
      portrait: 'mentor',
      text: 'Let us teach this archive to follow language.',
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
      text: 'Context is the chapter everyone forgets to index. Open the language archive.',
    },
  ],
  'dl-intro': [
    {
      speaker: 'NODE-9',
      portrait: 'mentor',
      text: 'Three foundation signals detected. The sealed network can finally accept a student.',
    },
    {
      speaker: 'NODE-9',
      portrait: 'mentor',
      text: 'Deep learning builds useful representations through connected layers of artificial neurons.',
    },
    {
      speaker: '{{player}}',
      portrait: 'player',
      text: 'So one small signal can become a larger understanding?',
      choices: ['Connect the network', 'Power the neural core'],
    },
    {
      speaker: 'NODE-9',
      portrait: 'mentor',
      text: 'If the paths, strengths, and updates are tuned together. We begin with the connections.',
    },
  ],
  'research-locked': [
    {
      speaker: 'ACADEMY CORE',
      portrait: 'system',
      text: 'RESEARCH LAB SEALED. The Deep Learning neural core is required.',
    },
    {
      speaker: '{{player}}',
      portrait: 'player',
      text: 'Something behind that door feels familiar.',
    },
  ],
  'research-powered': [
    {
      speaker: 'ACADEMY CORE',
      portrait: 'system',
      text: 'FOUR ACADEMY SIGNALS SYNCHRONIZED. RESEARCH LAB POWERED. ACCESS SEQUENCE AWAITS PHASE 5.',
    },
    {
      speaker: '{{player}}',
      portrait: 'player',
      text: 'The door is awake. It is still keeping its secrets.',
    },
  ],
}
