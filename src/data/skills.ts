export type SkillId =
  | 'react'
  | 'next'
  | 'typescript'
  | 'gsap'
  | 'graphql'
  | 'css'
  | 'tailwind'
  | 'vite'
  | 'reactQuery'
  | 'zustand'

export interface Skill {
  id: SkillId
  label: string
  /** What this piece becomes during the morph phase */
  morphsTo: string
  /** Placement along the workbench arc (0–1) */
  t: number
  /** Vertical jitter on the bench */
  lift: number
}

/**
 * Loose parts on the workbench — not badges.
 * They wire into a circuit, then morph into UI.
 */
export const skills: Skill[] = [
  { id: 'react', label: 'React', morphsTo: 'Card', t: 0.04, lift: 0 },
  { id: 'typescript', label: 'TypeScript', morphsTo: 'Chart', t: 0.18, lift: 8 },
  { id: 'gsap', label: 'GSAP', morphsTo: 'Navbar', t: 0.32, lift: -2 },
  { id: 'graphql', label: 'GraphQL', morphsTo: 'Modal', t: 0.46, lift: 10 },
  { id: 'css', label: 'CSS', morphsTo: 'Button', t: 0.58, lift: 2 },
  { id: 'vite', label: 'Vite', morphsTo: 'Loader', t: 0.7, lift: 12 },
  { id: 'reactQuery', label: 'React Query', morphsTo: 'Feed', t: 0.84, lift: -4 },
  { id: 'zustand', label: 'Zustand', morphsTo: 'Dashboard', t: 0.96, lift: 6 },
]

/** Final morph ladder shown in the center before the product appears */
export const MORPH_STEPS = [
  'React',
  'Card',
  'Chart',
  'Navbar',
  'Dashboard',
  'Application',
] as const
