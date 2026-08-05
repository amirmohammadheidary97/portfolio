export interface Project {
  id: string
  /** Translation keys under projects.<id> */
  nameKey: string
  stack: string[]
  /** Fake or real demo — replace later */
  demoUrl?: string
  githubUrl?: string
  /** Placeholder screenshot path */
  image: string
  featured: boolean
  hasFakeDemo: boolean
}

export const projects: Project[] = [
  {
    id: 'bims',
    nameKey: 'bims',
    stack: ['React', 'TypeScript', 'React Query', 'Zustand'],
    demoUrl: 'https://demo.bims-lab.example.com',
    image: '/projects/bims.svg',
    featured: true,
    hasFakeDemo: true,
  },
  {
    id: 'ewano',
    nameKey: 'ewano',
    stack: ['React', 'Next.js', 'TypeScript', 'shadcn/ui'],
    demoUrl: 'https://giftcards.ewano-demo.example.com',
    image: '/projects/ewano.svg',
    featured: true,
    hasFakeDemo: true,
  },
  {
    id: 'tabrizi',
    nameKey: 'tabrizi',
    stack: ['React', 'TypeScript', 'Tailwind', 'Vite'],
    demoUrl: 'https://demo.tabrizigold.example.com',
    image: '/projects/tabrizi.svg',
    featured: true,
    hasFakeDemo: true,
  },
  {
    id: 'learnest',
    nameKey: 'learnest',
    stack: ['React', 'Next.js', 'TypeScript', 'GSAP'],
    demoUrl: 'https://app.learnest-demo.example.com',
    image: '/projects/learnest.svg',
    featured: true,
    hasFakeDemo: true,
  },
  {
    id: 'meeting',
    nameKey: 'meeting',
    stack: ['React', 'WebRTC', 'TypeScript', 'Zustand'],
    image: '/projects/meeting.svg',
    featured: true,
    hasFakeDemo: false,
  },
  {
    id: 'signage',
    nameKey: 'signage',
    stack: ['React', 'TypeScript', 'CSS', 'Vite'],
    image: '/projects/signage.svg',
    featured: true,
    hasFakeDemo: false,
  },
  {
    id: 'chatRag',
    nameKey: 'chatRag',
    stack: ['React', 'TypeScript', 'React Query', 'Next.js'],
    image: '/projects/chat-rag.svg',
    featured: true,
    hasFakeDemo: false,
  },
]

export const contact = {
  email: 'amirmohammadheidary97@gmail.com',
  github: 'https://github.com/amirmohammadheidary97',
  linkedin: 'https://www.linkedin.com/in/amirmohammadheidary/',
}
