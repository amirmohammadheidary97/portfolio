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

/**
 * Quick puppet jump on the bob — crouch, spring up the string, bounce land.
 * Leaves the swing rotation tween alone.
 */
export function jumpPendulum(
  bob: HTMLElement,
  thread?: HTMLElement | null,
  reduced = false,
): gsap.core.Timeline | null {
  if (reduced) return null

  gsap.killTweensOf(bob, 'y,scaleX,scaleY')
  if (thread) gsap.killTweensOf(thread, 'scaleY')

  const tl = gsap.timeline({ defaults: { overwrite: 'auto' } })

  // Anticipation crouch
  tl.to(bob, {
    y: 7,
    scaleY: 0.9,
    scaleX: 1.08,
    duration: 0.09,
    ease: 'power2.in',
  })

  // Launch up the string
  tl.to(bob, {
    y: -38,
    scaleY: 1.1,
    scaleX: 0.92,
    duration: 0.24,
    ease: 'power3.out',
  })
  if (thread) {
    tl.to(
      thread,
      { scaleY: 0.86, duration: 0.24, ease: 'power3.out' },
      '<',
    )
  }

  // Land with a soft bounce
  tl.to(bob, {
    y: 0,
    scaleY: 1,
    scaleX: 1,
    duration: 0.48,
    ease: 'bounce.out',
  })
  if (thread) {
    tl.to(
      thread,
      { scaleY: 1, duration: 0.48, ease: 'bounce.out' },
      '<',
    )
  }

  return tl
}
