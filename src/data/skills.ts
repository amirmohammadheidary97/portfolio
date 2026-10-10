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
  | 'git'
  | 'js'
  | 'redux'

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
  { id: 'typescript', label: 'TypeScript', morphsTo: 'Chart', t: 0.14, lift: 8 },
  { id: 'js', label: 'JS', morphsTo: 'Widget', t: 0.24, lift: 4 },
  { id: 'gsap', label: 'GSAP', morphsTo: 'Navbar', t: 0.34, lift: -2 },
  { id: 'graphql', label: 'GraphQL', morphsTo: 'Modal', t: 0.44, lift: 10 },
  { id: 'css', label: 'CSS', morphsTo: 'Button', t: 0.54, lift: 2 },
  { id: 'redux', label: 'Redux', morphsTo: 'Store', t: 0.64, lift: -6 },
  { id: 'vite', label: 'Vite', morphsTo: 'Loader', t: 0.74, lift: 12 },
  { id: 'git', label: 'Git', morphsTo: 'Diff', t: 0.84, lift: 3 },
  { id: 'reactQuery', label: 'React Query', morphsTo: 'Feed', t: 0.9, lift: -4 },
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
