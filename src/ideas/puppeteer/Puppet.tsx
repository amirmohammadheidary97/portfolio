import { useEffect, useRef, useState, type CSSProperties } from 'react'
import gsap from 'gsap'
import { useTranslation } from 'react-i18next'
import type { PendulumDef, PendulumId } from './puppets'
import {
  CURTAIN_CLOSE_DELAY,
  CURTAIN_CLOSE_DURATION,
  CURTAIN_OPEN_DELAY,
  CURTAIN_OPEN_DURATION,
} from './curtainMotion'
import { prefersReducedMotion, startPendulum } from './stringPhysics'

type PendulumProps = {
  def: PendulumDef
  focused: boolean
  /** Curtains open — this pendulum slides off its side */
  parted: boolean
  onFocus: (id: PendulumId) => void
  onBlur: (id: PendulumId) => void
  onToggle: (id: PendulumId) => void
}

function isFinePointer() {
  if (typeof window === 'undefined') return true
  return window.matchMedia('(pointer: fine)').matches
}

/** Skill bob on a thread — swings independently. */
export function Pendulum({
  def,
  focused,
  parted,
  onFocus,
  onBlur,
  onToggle,
}: PendulumProps) {
  const { t } = useTranslation()
  const rootRef = useRef<HTMLDivElement>(null)
  const swingRef = useRef<HTMLDivElement>(null)
  const stringLineRef = useRef<HTMLSpanElement>(null)
  const beadsRef = useRef<HTMLDivElement>(null)
  const skipFocusFromPointer = useRef(false)
  const [reduced, setReduced] = useState(prefersReducedMotion)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReduced(mq.matches)
    onChange()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  // Independent pendulum swing on the bob unit
  useEffect(() => {
    const swing = swingRef.current
    if (!swing) return

    if (reduced) {
      gsap.set(swing, { rotation: 0, y: 0, transformOrigin: '50% 0%' })
      return
    }

    const tween = startPendulum(swing, def.motion)
    return () => {
      tween.kill()
    }
  }, [def.motion, reduced])

  // Slide this pendulum off-stage with its curtain half (root only — swing keeps going)
  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const exitX = def.side === 'left' ? '-58vw' : '58vw'
    gsap.to(root, {
      x: parted ? exitX : 0,
      duration: reduced ? 0.01 : parted ? CURTAIN_OPEN_DURATION : CURTAIN_CLOSE_DURATION,
      delay: reduced ? 0 : parted ? CURTAIN_OPEN_DELAY : CURTAIN_CLOSE_DELAY,
      ease: parted ? 'power3.inOut' : 'power2.inOut',
      overwrite: 'auto',
    })
  }, [parted, def.side, reduced])

  // Focus reveals what the skill builds toward
  useEffect(() => {
    const stringLine = stringLineRef.current
    const beads = beadsRef.current
    if (!stringLine || !beads) return

    const beadEls = beads.querySelectorAll<HTMLElement>('[data-bead]')

    if (focused && !parted) {
      gsap.to(stringLine, {
        scaleX: 1.65,
        opacity: 1,
        duration: reduced ? 0.01 : 0.3,
        ease: 'power2.out',
      })
      gsap.fromTo(
        beadEls,
        { opacity: 0, scale: 0.55, y: 12 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: reduced ? 0.01 : 0.35,
          stagger: reduced ? 0 : 0.06,
          ease: 'power2.out',
          overwrite: true,
        },
      )
      beads.setAttribute('aria-hidden', 'false')
    } else {
      gsap.to(beadEls, {
        opacity: 0,
        scale: 0.65,
        y: 8,
        duration: reduced ? 0.01 : 0.22,
        stagger: reduced ? 0 : 0.03,
        ease: 'power1.in',
        overwrite: true,
      })
      gsap.to(stringLine, {
        scaleX: 1,
        opacity: 0.85,
        duration: reduced ? 0.01 : 0.28,
      })
      beads.setAttribute('aria-hidden', 'true')
    }
  }, [focused, parted, reduced])

  return (
    <div
      ref={rootRef}
      className={`pendulum${focused ? ' is-focused' : ''}${parted ? ' is-parted' : ''}`}
      style={
        {
          '--pendulum-x': `${def.x * 100}%`,
          '--pendulum-hang': `${def.hang * 100}%`,
        } as CSSProperties
      }
      data-pendulum={def.id}
      data-side={def.side}
    >
      <button
        type="button"
        className="pendulum__hit"
        aria-expanded={focused}
        aria-controls={`pendulum-techs-${def.id}`}
        aria-label={t('puppeteer.revealLabel', { name: def.label })}
        tabIndex={parted ? -1 : 0}
        onPointerDown={() => {
          if (!isFinePointer()) skipFocusFromPointer.current = true
        }}
        onPointerEnter={() => {
          if (isFinePointer() && !parted) onFocus(def.id)
        }}
        onPointerLeave={() => {
          if (isFinePointer()) onBlur(def.id)
        }}
        onFocus={() => {
          if (skipFocusFromPointer.current) {
            skipFocusFromPointer.current = false
            return
          }
          if (!parted) onFocus(def.id)
        }}
        onBlur={() => {
          if (isFinePointer()) onBlur(def.id)
        }}
        onClick={() => {
          if (!isFinePointer() && !parted) onToggle(def.id)
        }}
      >
        <div ref={swingRef} className="pendulum__swing">
          <div className="pendulum__thread" aria-hidden>
            <span ref={stringLineRef} className="pendulum__thread-line" />
          </div>

          <div
            ref={beadsRef}
            id={`pendulum-techs-${def.id}`}
            className="pendulum__beads"
            aria-hidden="true"
          >
            {def.reveals.map((item) => (
              <span key={item} className="pendulum__bead" data-bead>
                {item}
              </span>
            ))}
          </div>

          <div className="pendulum__bob">
            <div className="face face--skill">
              <span className="face__skill-label">{def.label}</span>
            </div>
          </div>
        </div>
      </button>
    </div>
  )
}
