import type { DialogueLine } from '../game/types'

export const dialogueScripts: Record<string, DialogueLine[]> = {
  'cv-intro': [
    {
      speaker: 'LENS-01',
      portrait: 'mentor',
      text: 'Freeze! Hold that pose. The lighting is extremely educational.',
    },
    {
      speaker: 'LENS-01',
      portrait: 'mentor',
      text: 'I am LENS-01. In this lab, you will sort what you see before I explain how a machine does it.',
    },
    {
      speaker: '{{player}}',
      portrait: 'player',
      text: 'So I look first, then learn why it worked?',
      choices: ['Focus the lens', 'Ready when you are'],
    },
    {
      speaker: 'LENS-01',
      portrait: 'mentor',
      text: 'Precisely. Very photogenic reasoning. Approach the visual console.',
    },
  ],
  'ml-intro': [
    {
      speaker: 'PROFESSOR PATTERN',
      portrait: 'mentor',
      text: 'A visitor! I predicted this. Admittedly, after I saw you walk in.',
    },
    {
      speaker: 'PROFESSOR PATTERN',
      portrait: 'mentor',
      text: 'I am Professor Pattern. You will study examples, guess the hidden rule, and test your guess.',
    },
    {
      speaker: '{{player}}',
      portrait: 'player',
      text: 'What if my first guess is wrong?',
      choices: ['Try another pattern', 'Recalculate dramatically'],
    },
    {
      speaker: 'PROFESSOR PATTERN',
      portrait: 'mentor',
      text: 'Excellent. Wrong guesses are data wearing a fake moustache. Let us begin.',
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
