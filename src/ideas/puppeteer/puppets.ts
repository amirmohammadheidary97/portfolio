import { skills, type SkillId } from '../../data/skills'

export type PendulumId = SkillId

export type PendulumMotion = {
  /** Max swing angle in degrees (each side) */
  angle: number
  /** Full swing period in seconds (left → right → left) */
  period: number
}

export type PendulumDef = {
  id: PendulumId
  label: string
  /** What this skill becomes — shown on the thread when focused */
  reveals: string[]
  motion: PendulumMotion
  /** Horizontal placement 0–1 */
  x: number
  /** Thread length as fraction of stage height */
  hang: number
  /** Which way this pendulum exits when curtains open */
  side: 'left' | 'right'
}

/** Pick six skills for a clean stage */
const STAGE_SKILLS: SkillId[] = [
  'react',
  'typescript',
  'gsap',
  'graphql',
  'css',
  'zustand',
]

const MOTION: Record<string, PendulumMotion> = {
  react: { angle: 11, period: 5.2 },
  typescript: { angle: 8, period: 6.0 },
  gsap: { angle: 13, period: 4.2 },
  graphql: { angle: 9, period: 5.5 },
  css: { angle: 12, period: 4.8 },
  zustand: { angle: 7, period: 6.4 },
}

const LAYOUT: Record<string, { x: number; hang: number }> = {
  react: { x: 0.1, hang: 0.6 },
  typescript: { x: 0.26, hang: 0.72 },
  gsap: { x: 0.42, hang: 0.64 },
  graphql: { x: 0.58, hang: 0.78 },
  css: { x: 0.74, hang: 0.58 },
  zustand: { x: 0.9, hang: 0.7 },
}

export const pendulums: PendulumDef[] = STAGE_SKILLS.map((id, index) => {
  const skill = skills.find((s) => s.id === id)
  if (!skill) throw new Error(`Missing skill for pendulum: ${id}`)
  const side: 'left' | 'right' = index < STAGE_SKILLS.length / 2 ? 'left' : 'right'
  return {
    id,
    label: skill.label,
    reveals: [skill.morphsTo],
    motion: MOTION[id],
    side,
    ...LAYOUT[id],
  }
})
