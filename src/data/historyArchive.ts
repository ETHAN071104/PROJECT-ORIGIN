import type { LabId } from '../game/types'

export type HistorySection = 'lab-exhibit' | 'foundations' | 'surprising-systems' | 'modern-models'

export interface HistoryEntry {
  id: string
  year: string
  title: string
  shortText: string
  longText?: string
  category: string
  icon: string
  relatedLab?: LabId
  relatedNames?: string[]
  section: HistorySection
}

export interface PersonEntry {
  id: string
  name: string
  category: string
  contribution: string
  portraitKey: string
  section: 'foundations' | 'researchers' | 'modern-builders'
}

export interface ModernBuilderEntry {
  name: string
  category: string
  contribution: string
}

export const LAB_HISTORY_EXHIBITS: Record<LabId, readonly [HistoryEntry, HistoryEntry]> = {
  cv: [
    {
      id: 'cv-shakey-1966',
      year: '1966',
      title: 'SHAKEY THE ROBOT',
      shortText: 'An early mobile robot combined perception, planning, and movement to understand and navigate its surroundings.',
      longText: 'Shakey helped demonstrate that a machine could connect visual information with decisions and physical action.',
      category: 'ROBOT PERCEPTION',
      icon: 'shakey',
      relatedLab: 'cv',
      section: 'lab-exhibit',
    },
    {
      id: 'cv-alexnet-2012',
      year: '2012',
      title: 'ALEXNET',
      shortText: 'A deep convolutional network achieved a major breakthrough in large-scale image recognition.',
      longText: 'AlexNet showed how deep neural networks, large datasets, and powerful computing could dramatically improve computer vision.',
      category: 'IMAGE RECOGNITION',
      icon: 'alexnet',
      relatedLab: 'cv',
      section: 'lab-exhibit',
    },
  ],
  ml: [
    {
      id: 'ml-arthur-samuel-1959',
      year: '1959',
      title: 'ARTHUR SAMUEL',
      shortText: 'A checkers-playing program improved through experience and helped popularize the term “machine learning.”',
      longText: 'The project showed that computers could improve their performance without every decision being directly programmed.',
      category: 'MACHINE LEARNING',
      icon: 'checkers',
      relatedLab: 'ml',
      section: 'lab-exhibit',
    },
    {
      id: 'ml-alphago-2016',
      year: '2016',
      title: 'ALPHAGO',
      shortText: 'AlphaGo defeated a world champion in Go using neural networks, search, and learning from games.',
      longText: 'It demonstrated that machines could master extremely complex decision spaces once considered unreachable.',
      category: 'GAME-PLAYING AI',
      icon: 'go-board',
      relatedLab: 'ml',
      section: 'lab-exhibit',
    },
  ],
  nlp: [
    {
      id: 'nlp-eliza-1966',
      year: '1966',
      title: 'ELIZA',
      shortText: 'ELIZA used pattern-based responses to create one of the earliest widely known computer conversations.',
      longText: 'It revealed how easily people can interpret simple language patterns as understanding.',
      category: 'EARLY CONVERSATION',
      icon: 'terminal-chat',
      relatedLab: 'nlp',
      section: 'lab-exhibit',
    },
    {
      id: 'nlp-transformer-2017',
      year: '2017',
      title: 'THE TRANSFORMER',
      shortText: 'The paper “Attention Is All You Need” introduced the Transformer architecture.',
      longText: 'Transformers changed language AI by helping models connect important parts of a sequence efficiently.',
      category: 'LANGUAGE ARCHITECTURE',
      icon: 'attention',
      relatedLab: 'nlp',
      section: 'lab-exhibit',
    },
  ],
  dl: [
    {
      id: 'dl-backpropagation-1986',
      year: '1986',
      title: 'BACKPROPAGATION POPULARIZED',
      shortText: 'A landmark paper showed how multilayer neural networks could learn internal representations from error signals.',
      longText: 'Backpropagation became a central method for adjusting neural-network parameters during training.',
      category: 'NEURAL TRAINING',
      icon: 'backpropagation',
      relatedLab: 'dl',
      section: 'lab-exhibit',
    },
    {
      id: 'dl-deep-belief-nets-2006',
      year: '2006',
      title: 'DEEP BELIEF NETS',
      shortText: 'Layer-by-layer training methods helped renew interest in networks containing many hidden layers.',
      longText: 'This work contributed to the revival that eventually became modern deep learning.',
      category: 'DEEP LEARNING',
      icon: 'deep-network',
      relatedLab: 'dl',
      section: 'lab-exhibit',
    },
  ],
}

export const HALL_TIMELINE_ENTRIES: readonly HistoryEntry[] = [
  {
    id: 'hall-imitation-game-1950',
    year: '1950',
    title: 'THE IMITATION GAME',
    shortText: 'Alan Turing asked whether machines could think and proposed an imitation-based test of machine intelligence.',
    category: 'FOUNDATIONS',
    icon: 'turing-test',
    section: 'foundations',
  },
  {
    id: 'hall-dartmouth-1956',
    year: '1956',
    title: 'DARTMOUTH WORKSHOP',
    shortText: 'A summer research project helped establish artificial intelligence as a formal field of study.',
    category: 'FOUNDATIONS',
    icon: 'workshop',
    section: 'foundations',
  },
  {
    id: 'hall-machines-learn-1959',
    year: '1959',
    title: 'MACHINES THAT LEARN',
    shortText: 'Arthur Samuel’s checkers research demonstrated that a program could improve through experience.',
    category: 'FOUNDATIONS',
    icon: 'checkers',
    section: 'foundations',
  },
  {
    id: 'hall-move-talk-1966',
    year: '1966',
    title: 'MACHINES MOVE AND TALK',
    shortText: 'In separate milestones, Shakey connected perception with planning and movement, while ELIZA used text patterns to create an influential early computer conversation.',
    category: 'SYSTEMS THAT SURPRISED US',
    icon: 'move-talk',
    relatedNames: ['SHAKEY THE ROBOT', 'ELIZA'],
    section: 'surprising-systems',
  },
  {
    id: 'hall-backpropagation-1986',
    year: '1986',
    title: 'BACKPROPAGATION POPULARIZED',
    shortText: 'A landmark paper showed how multilayer neural networks could learn useful internal representations from error signals.',
    category: 'SYSTEMS THAT SURPRISED US',
    icon: 'backpropagation',
    section: 'surprising-systems',
  },
  {
    id: 'hall-deep-blue-1997',
    year: '1997',
    title: 'DEEP BLUE',
    shortText: 'IBM’s Deep Blue defeated world chess champion Garry Kasparov in a six-game match.',
    category: 'SYSTEMS THAT SURPRISED US',
    icon: 'chess',
    section: 'surprising-systems',
  },
  {
    id: 'hall-imagenet-2009',
    year: '2009',
    title: 'IMAGENET',
    shortText: 'A large-scale labeled image database helped researchers train and compare more capable vision systems.',
    category: 'SYSTEMS THAT SURPRISED US',
    icon: 'image-grid',
    section: 'surprising-systems',
  },
  {
    id: 'hall-alexnet-2012',
    year: '2012',
    title: 'ALEXNET',
    shortText: 'Deep neural networks produced a major leap in large-scale image recognition.',
    category: 'SYSTEMS THAT SURPRISED US',
    icon: 'alexnet',
    section: 'surprising-systems',
  },
  {
    id: 'hall-alphago-2016',
    year: '2016',
    title: 'ALPHAGO',
    shortText: 'AlphaGo combined learning and search to master one of the world’s most complex board games.',
    category: 'SYSTEMS THAT SURPRISED US',
    icon: 'go-board',
    section: 'surprising-systems',
  },
  {
    id: 'hall-attention-2017',
    year: '2017',
    title: 'ATTENTION IS ALL YOU NEED',
    shortText: 'The Transformer architecture reshaped language modeling and later influenced many modern AI systems.',
    category: 'THE MODERN MODEL ERA',
    icon: 'attention',
    section: 'modern-models',
  },
  {
    id: 'hall-chatgpt-2022',
    year: '2022',
    title: 'CHATGPT',
    shortText: 'Conversational generative AI reached a broad public audience and changed how many people interacted with language models.',
    category: 'THE MODERN MODEL ERA',
    icon: 'assistant',
    section: 'modern-models',
  },
  {
    id: 'hall-diverse-assistants-2023',
    year: '2023',
    title: 'A DIVERSE ASSISTANT ERA',
    shortText: 'Multiple AI laboratories introduced new general-purpose assistants and multimodal model families.',
    category: 'THE MODERN MODEL ERA',
    icon: 'text-display',
    relatedNames: ['CLAUDE', 'GEMINI'],
    section: 'modern-models',
  },
]

export const PEOPLE_OF_AI: readonly PersonEntry[] = [
  {
    id: 'person-alan-turing',
    name: 'ALAN TURING',
    category: 'FOUNDATIONS',
    contribution: 'Asked foundational questions about computation, intelligence, and machine thought.',
    portraitKey: 'turing',
    section: 'foundations',
  },
  {
    id: 'person-john-mccarthy',
    name: 'JOHN MCCARTHY',
    category: 'ARTIFICIAL INTELLIGENCE',
    contribution: 'Helped establish AI as a field and introduced the term “artificial intelligence.”',
    portraitKey: 'mccarthy',
    section: 'foundations',
  },
  {
    id: 'person-arthur-samuel',
    name: 'ARTHUR SAMUEL',
    category: 'MACHINE LEARNING',
    contribution: 'Developed a checkers program that learned from experience and popularized the term “machine learning.”',
    portraitKey: 'samuel',
    section: 'foundations',
  },
  {
    id: 'person-geoffrey-hinton',
    name: 'GEOFFREY HINTON',
    category: 'DEEP LEARNING',
    contribution: 'Advanced neural-network learning methods and helped renew interest in deep multilayer systems.',
    portraitKey: 'hinton',
    section: 'researchers',
  },
  {
    id: 'person-yoshua-bengio',
    name: 'YOSHUA BENGIO',
    category: 'DEEP LEARNING',
    contribution: 'Advanced representation learning and research into training deep neural networks.',
    portraitKey: 'bengio',
    section: 'researchers',
  },
  {
    id: 'person-yann-lecun',
    name: 'YANN LECUN',
    category: 'COMPUTER VISION',
    contribution: 'Pioneered convolutional neural networks for recognizing visual patterns such as handwritten characters.',
    portraitKey: 'lecun',
    section: 'researchers',
  },
  {
    id: 'person-fei-fei-li',
    name: 'FEI-FEI LI',
    category: 'COMPUTER VISION',
    contribution: 'Led the development of ImageNet and large-scale visual-data research.',
    portraitKey: 'li',
    section: 'researchers',
  },
  {
    id: 'person-demis-hassabis',
    name: 'DEMIS HASSABIS',
    category: 'GENERAL AI RESEARCH',
    contribution: 'Led research efforts including AlphaGo and later general-purpose AI systems.',
    portraitKey: 'hassabis',
    section: 'researchers',
  },
]

export const MODERN_BUILDERS: readonly ModernBuilderEntry[] = [
  {
    name: 'JENSEN HUANG',
    category: 'AI COMPUTING INFRASTRUCTURE',
    contribution: 'Helped expand the computing platforms used to train and run modern AI systems.',
  },
  {
    name: 'SAM ALTMAN',
    category: 'AI ORGANIZATION LEADERSHIP',
    contribution: 'Led an organization developing and deploying widely used generative AI systems.',
  },
  {
    name: 'DARIO AMODEI',
    category: 'AI SAFETY AND ORGANIZATION LEADERSHIP',
    contribution: 'Led work on general-purpose assistants, model behavior, and AI safety research.',
  },
]

export const MODERN_BUILDERS_NOTE = 'Modern AI is built by large communities of researchers, engineers, designers, policymakers, and users.'
export const ARCHIVE_TIMELINE_NOTE = 'AI history is larger than any single timeline.'
