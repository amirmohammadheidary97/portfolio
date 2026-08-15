import { useCallback, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useTranslation } from 'react-i18next'
import { LanguageToggle } from '../../components/LanguageToggle'
import { contact, projects } from '../../data/projects'
import { Pendulum } from './Puppet'
import { pendulums, type PendulumId } from './puppets'
import {
  CURTAIN_CLOSE_DURATION,
  CURTAIN_OPEN_DURATION,
  gatheredBasis,
} from './curtainMotion'
import { prefersReducedMotion } from './stringPhysics'

/** Vertical pleats per curtain half — denser = more fabric-like gather */
const CURTAIN_FOLDS = 20

function setFoldsOpen(folds: NodeListOf<HTMLElement>, side: 'left' | 'right') {
  folds.forEach((fold, i) => {
    gsap.set(fold, {
      flexGrow: 0,
      flexShrink: 0,
      flexBasis: gatheredBasis(i, folds.length, side),
      skewX: 0,
      scaleY: 1,
      scaleX: 1,
    })
  })
}

function setFoldsClosed(folds: NodeListOf<HTMLElement>) {
  gsap.set(folds, {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    skewX: 0,
    scaleY: 1,
    scaleX: 1,
  })
}

export function PuppeteerHero() {
  const { t } = useTranslation()
  const stageRef = useRef<HTMLDivElement>(null)
  const curtainLeftRef = useRef<HTMLDivElement>(null)
  const curtainRightRef = useRef<HTMLDivElement>(null)
  const projectsRef = useRef<HTMLDivElement>(null)
  const curtainTlRef = useRef<gsap.core.Timeline | null>(null)
  const hasDrawnRef = useRef(false)
  const [focused, setFocused] = useState<PendulumId | null>(null)
  const [opened, setOpened] = useState(false)
  const [reduced, setReduced] = useState(prefersReducedMotion)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReduced(mq.matches)
    onChange()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const onFocus = useCallback((id: PendulumId) => {
    setFocused(id)
  }, [])

  const onBlur = useCallback((id: PendulumId) => {
    setFocused((current) => (current === id ? null : current))
  }, [])

  const onToggle = useCallback((id: PendulumId) => {
    setFocused((current) => (current === id ? null : id))
  }, [])

  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      const stage = stageRef.current
      if (!stage || opened) return
      if (!stage.contains(e.target as Node)) setFocused(null)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [opened])

  // Curtain gather / unfurl + projects reveal
  useEffect(() => {
    const left = curtainLeftRef.current
    const right = curtainRightRef.current
    const panel = projectsRef.current
    if (!left || !right || !panel) return

    const leftFolds = left.querySelectorAll<HTMLElement>('.puppeteer-curtain__fold')
    const rightFolds = right.querySelectorAll<HTMLElement>('.puppeteer-curtain__fold')
    if (!leftFolds.length || !rightFolds.length) return

    curtainTlRef.current?.kill()
    gsap.killTweensOf(leftFolds)
    gsap.killTweensOf(rightFolds)
    gsap.killTweensOf([left, right, panel])

    // First paint: snap to closed, no tween
    if (!hasDrawnRef.current) {
      hasDrawnRef.current = true
      if (!opened) {
        setFoldsClosed(leftFolds)
        setFoldsClosed(rightFolds)
        gsap.set([left, right], { x: 0 })
        gsap.set(panel, { opacity: 0, scale: 0.98 })
        panel.setAttribute('aria-hidden', 'true')
        return
      }
    }

    if (reduced) {
      if (opened) {
        setFoldsOpen(leftFolds, 'left')
        setFoldsOpen(rightFolds, 'right')
        gsap.set([left, right], { x: 0 })
        gsap.set(panel, { opacity: 1, scale: 1 })
        panel.setAttribute('aria-hidden', 'false')
      } else {
        setFoldsClosed(leftFolds)
        setFoldsClosed(rightFolds)
        gsap.set([left, right], { x: 0 })
        gsap.set(panel, { opacity: 0, scale: 0.98 })
        panel.setAttribute('aria-hidden', 'true')
      }
      return
    }

    const tl = gsap.timeline({
      defaults: { overwrite: 'auto' },
    })
    curtainTlRef.current = tl

    if (opened) {
      panel.setAttribute('aria-hidden', 'false')

      // —— OPEN: taut → cascade from center → pile at the walls → settle ——
      // Anticipation: fabric pulls slightly toward the seam
      tl.to(
        leftFolds,
        {
          skewX: -2.4,
          scaleY: 1.012,
          duration: 0.22,
          ease: 'power2.out',
          stagger: { each: 0.01, from: 'end' },
        },
        0,
      )
      tl.to(
        rightFolds,
        {
          skewX: 2.4,
          scaleY: 1.012,
          duration: 0.22,
          ease: 'power2.out',
          stagger: { each: 0.01, from: 'start' },
        },
        0.04,
      )

      // Main gather — center leads, weight accelerates into the pile
      tl.to(
        leftFolds,
        {
          flexGrow: 0,
          flexShrink: 0,
          flexBasis: (i: number) => gatheredBasis(i, leftFolds.length, 'left'),
          skewX: 4.5,
          scaleY: 0.985,
          duration: CURTAIN_OPEN_DURATION * 0.72,
          ease: 'power3.inOut',
          stagger: { each: 0.022, from: 'end' },
        },
        0.16,
      )
      tl.to(
        rightFolds,
        {
          flexGrow: 0,
          flexShrink: 0,
          flexBasis: (i: number) => gatheredBasis(i, rightFolds.length, 'right'),
          skewX: -4.5,
          scaleY: 0.985,
          duration: CURTAIN_OPEN_DURATION * 0.72,
          ease: 'power3.inOut',
          stagger: { each: 0.022, from: 'start' },
        },
        0.22,
      )

      // Soft outward drift of each half as fabric stacks
      tl.to(left, { x: -6, duration: CURTAIN_OPEN_DURATION * 0.7, ease: 'power2.inOut' }, 0.2)
      tl.to(right, { x: 6, duration: CURTAIN_OPEN_DURATION * 0.7, ease: 'power2.inOut' }, 0.26)

      // Settle: skew/scale ease out, pile breathes once
      tl.to(
        leftFolds,
        {
          skewX: 0,
          scaleY: 1,
          duration: 0.55,
          ease: 'power2.out',
          stagger: { each: 0.014, from: 'end' },
        },
        CURTAIN_OPEN_DURATION * 0.72,
      )
      tl.to(
        rightFolds,
        {
          skewX: 0,
          scaleY: 1,
          duration: 0.55,
          ease: 'power2.out',
          stagger: { each: 0.014, from: 'start' },
        },
        CURTAIN_OPEN_DURATION * 0.72 + 0.04,
      )

      // Projects emerge once the seam has clearly parted
      tl.fromTo(
        panel,
        { opacity: 0, scale: 0.94, y: 12 },
        { opacity: 1, scale: 1, y: 0, duration: 0.85, ease: 'power2.out' },
        0.55,
      )
    } else {
      panel.setAttribute('aria-hidden', 'true')

      // —— CLOSE: fade stage → unfurl from walls → meet at center → settle ——
      tl.to(
        panel,
        { opacity: 0, scale: 0.96, y: 8, duration: 0.32, ease: 'power2.in' },
        0,
      )

      // Billow as fabric leaves the pile
      tl.to(
        leftFolds,
        {
          skewX: 3.8,
          scaleY: 1.018,
          duration: 0.28,
          ease: 'power2.out',
          stagger: { each: 0.012, from: 'start' },
        },
        0.08,
      )
      tl.to(
        rightFolds,
        {
          skewX: -3.8,
          scaleY: 1.018,
          duration: 0.28,
          ease: 'power2.out',
          stagger: { each: 0.012, from: 'end' },
        },
        0.12,
      )

      // Unfurl — outer edge leads, decelerates into the seam
      tl.to(
        leftFolds,
        {
          flexGrow: 1,
          flexShrink: 1,
          flexBasis: 0,
          skewX: -1.5,
          scaleY: 0.992,
          duration: CURTAIN_CLOSE_DURATION * 0.78,
          ease: 'power3.inOut',
          stagger: { each: 0.02, from: 'start' },
        },
        0.18,
      )
      tl.to(
        rightFolds,
        {
          flexGrow: 1,
          flexShrink: 1,
          flexBasis: 0,
          skewX: 1.5,
          scaleY: 0.992,
          duration: CURTAIN_CLOSE_DURATION * 0.78,
          ease: 'power3.inOut',
          stagger: { each: 0.02, from: 'end' },
        },
        0.24,
      )

      tl.to(left, { x: 0, duration: CURTAIN_CLOSE_DURATION * 0.75, ease: 'power2.inOut' }, 0.2)
      tl.to(right, { x: 0, duration: CURTAIN_CLOSE_DURATION * 0.75, ease: 'power2.inOut' }, 0.26)

      // Meeting kiss — center folds land soft, then the whole drape rests
      const meetAt = 0.18 + CURTAIN_CLOSE_DURATION * 0.72
      const seamFolds = [leftFolds[leftFolds.length - 1], rightFolds[0]].filter(Boolean)
      tl.to(
        seamFolds,
        {
          scaleX: 1.05,
          duration: 0.2,
          ease: 'power2.out',
        },
        meetAt,
      )
      tl.to(
        [...leftFolds, ...rightFolds],
        {
          scaleX: 1,
          skewX: 0,
          scaleY: 1,
          duration: 0.55,
          ease: 'power2.out',
          stagger: { each: 0.008, from: 'center' },
        },
        meetAt + 0.12,
      )
    }

    return () => {
      tl.kill()
      if (curtainTlRef.current === tl) curtainTlRef.current = null
    }
  }, [opened, reduced])

  const openCurtains = () => {
    setFocused(null)
    setOpened(true)
  }

  const closeCurtains = () => {
    setOpened(false)
  }

  const featured = projects.filter((p) => p.featured).slice(0, 6)

  return (
    <section
      className={`puppeteer-hero${opened ? ' is-opened' : ''}`}
      id="top"
      aria-label={t('puppeteer.aria')}
    >
      <header className="puppeteer-header">
        <a href="#top" className="puppeteer-brand">
          Amir <span>Mohammad</span>
        </a>
        <LanguageToggle />
      </header>

      <div className="puppeteer-hero__copy">
        <p className="puppeteer-hero__role">{t('puppeteer.role')}</p>
        <h1 className="puppeteer-hero__brand-line">Amir Mohammad</h1>
        <p className="puppeteer-hero__tagline">{t('puppeteer.tagline')}</p>
        <div className="puppeteer-hero__cta">
          <a className="puppeteer-btn puppeteer-btn--primary" href={`mailto:${contact.email}`}>
            {t('puppeteer.ctaSecondary')}
          </a>
          {!opened ? (
            <button
              type="button"
              className="puppeteer-btn puppeteer-btn--ghost"
              onClick={openCurtains}
            >
              {t('puppeteer.ctaPrimary')}
            </button>
          ) : (
            <button
              type="button"
              className="puppeteer-btn puppeteer-btn--ghost"
              onClick={closeCurtains}
            >
              {t('puppeteer.ctaClose')}
            </button>
          )}
        </div>
        {!opened && <p className="puppeteer-hero__hint">{t('puppeteer.hint')}</p>}
      </div>

      <div ref={stageRef} id="stage" className="puppeteer-stage">
        {/* Projects wait behind the curtains */}
        <div
          ref={projectsRef}
          className="puppeteer-projects"
          aria-hidden="true"
          aria-label={t('puppeteer.projectsAria')}
        >
          <p className="puppeteer-projects__eyebrow">{t('puppeteer.projectsEyebrow')}</p>
          <ul className="puppeteer-projects__grid">
            {featured.map((project) => (
              <li key={project.id} className="puppeteer-projects__card">
                <div className="puppeteer-projects__thumb">
                  <img src={project.image} alt="" loading="lazy" decoding="async" />
                </div>
                <span className="puppeteer-projects__name">
                  {t(`projects.${project.nameKey}.name`)}
                </span>
                <span className="puppeteer-projects__stack">
                  {project.stack.slice(0, 3).join(' · ')}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Two-piece curtain — vertical pleats gather to the sides */}
        <div className="puppeteer-curtain" aria-hidden>
          <div ref={curtainLeftRef} className="puppeteer-curtain__panel puppeteer-curtain__panel--left">
            {Array.from({ length: CURTAIN_FOLDS }, (_, i) => (
              <span key={`L${i}`} className="puppeteer-curtain__fold" />
            ))}
          </div>
          <div
            ref={curtainRightRef}
            className="puppeteer-curtain__panel puppeteer-curtain__panel--right"
          >
            {Array.from({ length: CURTAIN_FOLDS }, (_, i) => (
              <span key={`R${i}`} className="puppeteer-curtain__fold" />
            ))}
          </div>
        </div>

        <div className="puppeteer-stage__void" aria-hidden />
        <div className="puppeteer-stage__rail">
          {pendulums.map((def) => (
            <Pendulum
              key={def.id}
              def={def}
              focused={focused === def.id}
              parted={opened}
              onFocus={onFocus}
              onBlur={onBlur}
              onToggle={onToggle}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
