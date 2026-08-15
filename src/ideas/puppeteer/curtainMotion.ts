/** Shared timing so pendulums stay in sync with the drape */
export const CURTAIN_OPEN_DURATION = 1.65
export const CURTAIN_CLOSE_DURATION = 1.5
export const CURTAIN_OPEN_DELAY = 0.06
export const CURTAIN_CLOSE_DELAY = 0.1

/** Thicker near the wall, thinner at the free edge — reads as a real pile */
export function gatheredBasis(index: number, total: number, side: 'left' | 'right') {
  const outerT = side === 'left' ? 1 - index / Math.max(total - 1, 1) : index / Math.max(total - 1, 1)
  return `${2.5 + outerT * 6.5}px`
}
