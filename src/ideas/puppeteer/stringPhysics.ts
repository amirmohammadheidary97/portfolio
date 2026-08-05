import gsap from 'gsap'
import type { PendulumMotion } from './puppets'

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Independent pendulum on a fixed thread pivot.
 * Pure rotation only — no bob, no coupling to other pendulums.
 */
export function startPendulum(
  el: HTMLElement,
  motion: PendulumMotion,
): gsap.core.Tween {
  gsap.set(el, {
    transformOrigin: '50% 0%',
    force3D: true,
    rotation: -motion.angle,
    y: 0,
  })

  const tween = gsap.to(el, {
    rotation: motion.angle,
    duration: motion.period / 2,
    ease: 'sine.inOut',
    yoyo: true,
    repeat: -1,
    overwrite: false,
  })

  // Random phase so each pendulum is fully desynced
  tween.progress(Math.random())
  return tween
}
