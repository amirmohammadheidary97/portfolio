import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useTranslation } from 'react-i18next'
import { LanguageToggle } from '../../components/LanguageToggle'
import { contact, projects, type Project } from '../../data/projects'
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
const PROJECT_DETAIL_MS = 0.45

type CardRect = { top: number; left: number; width: number; height: number }

function readRect(el: Element): CardRect {
  const r = el.getBoundingClientRect()
  return { top: r.top, left: r.left, width: r.width, height: r.height }
}

function ProjectCardFace({
  project,
  name,
  fullStack = false,
  titleId,
}: {
  project: Project
  name: string
  fullStack?: boolean
  titleId?: string
}) {
  const stack = fullStack ? project.stack : project.stack.slice(0, 3)
  return (
    <>
      <div className="puppeteer-projects__thumb">
        <img src={project.image} alt="" loading="lazy" decoding="async" />
      </div>
      <span className="puppeteer-projects__name" id={titleId}>
        {name}
      </span>
      <span className="puppeteer-projects__stack">{stack.join(' · ')}</span>
    </>
  )
}

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
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [closing, setClosing] = useState(false)
  const [reduced, setReduced] = useState(prefersReducedMotion)
  const cardRefs = useRef(new Map<string, HTMLLIElement>())
  const gridRef = useRef<HTMLUListElement | null>(null)
  const expandRootRef = useRef<HTMLDivElement | null>(null)
  const expandedRef = useRef<HTMLElement | null>(null)
  const scrimRef = useRef<HTMLButtonElement | null>(null)
  const extraRef = useRef<HTMLDivElement | null>(null)
  const sourceRectRef = useRef<CardRect | null>(null)
  const flipTlRef = useRef<gsap.core.Timeline | null>(null)

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

  const killFlip = useCallback(() => {
    flipTlRef.current?.kill()
    flipTlRef.current = null
  }, [])

  /** Keep the maximized card locked to the projects grid box. */
  const pinExpandedToGrid = useCallback(() => {
    const expanded = expandedRef.current
    const grid = gridRef.current
    const root = expandRootRef.current
    if (!expanded || !grid || !root) return

    const g = grid.getBoundingClientRect()
    const r = root.getBoundingClientRect()
    gsap.set(expanded, {
      position: 'absolute',
      top: g.top - r.top,
      left: g.left - r.left,
      width: g.width,
      height: g.height,
      margin: 0,
      overflow: 'auto',
      x: 0,
      y: 0,
      scaleX: 1,
      scaleY: 1,
      transformOrigin: '0 0',
      zIndex: 6,
    })
  }, [])

  const closeCurtains = () => {
    killFlip()
    sourceRectRef.current = null
    setClosing(false)
    setSelectedId(null)
    setOpened(false)
  }

  const openProject = useCallback(
    (id: string) => {
      if (closing || selectedId) return
      const card = cardRefs.current.get(id)
      if (!card) return
      killFlip()
      sourceRectRef.current = readRect(card)
      setClosing(false)
      setSelectedId(id)
    },
    [closing, killFlip, selectedId],
  )

  const finishClose = useCallback(() => {
    killFlip()
    sourceRectRef.current = null
    setSelectedId(null)
    setClosing(false)
  }, [killFlip])

  const closeProject = useCallback(() => {
    if (!selectedId || closing) return

    if (reduced) {
      finishClose()
      return
    }

    const expanded = expandedRef.current
    const placeholder = cardRefs.current.get(selectedId)
    const scrim = scrimRef.current
    const extra = extraRef.current
    if (!expanded || !placeholder) {
      finishClose()
      return
    }

    setClosing(true)
    killFlip()

    const from = readRect(expanded)
    const to = readRect(placeholder)

    gsap.set(expanded, {
      position: 'fixed',
      top: from.top,
      left: from.left,
      width: from.width,
      height: from.height,
      margin: 0,
      overflow: 'hidden',
      x: 0,
      y: 0,
      scaleX: 1,
      scaleY: 1,
      transformOrigin: '0 0',
      zIndex: 6,
    })

    const tl = gsap.timeline({
      defaults: { overwrite: 'auto' },
      onComplete: finishClose,
    })
    flipTlRef.current = tl

    if (extra) tl.to(extra, { opacity: 0, duration: 0.14, ease: 'power1.out' }, 0)
    if (scrim) tl.to(scrim, { opacity: 0, duration: PROJECT_DETAIL_MS * 0.85, ease: 'power2.out' }, 0)
    tl.to(
      expanded,
      {
        top: to.top,
        left: to.left,
        width: to.width,
        height: to.height,
        duration: PROJECT_DETAIL_MS,
        ease: 'power3.inOut',
      },
      0,
    )
  }, [closing, finishClose, killFlip, reduced, selectedId])

  useLayoutEffect(() => {
    if (!selectedId) return

    const expanded = expandedRef.current
    const grid = gridRef.current
    const scrim = scrimRef.current
    const extra = extraRef.current
    const source = sourceRectRef.current
    if (!expanded || !grid || !source) return

    if (reduced) {
      pinExpandedToGrid()
      gsap.set(scrim, { opacity: 1 })
      gsap.set(extra, { opacity: 1 })
      sourceRectRef.current = null
      return
    }

    killFlip()
    if (extra) gsap.set(extra, { clearProps: 'opacity' })
    if (scrim) gsap.set(scrim, { clearProps: 'opacity' })

    // Destination is the grid box — maximized card matches it exactly
    const dest = readRect(grid)

    gsap.set(expanded, {
      position: 'fixed',
      top: source.top,
      left: source.left,
      width: source.width,
      height: source.height,
      margin: 0,
      overflow: 'hidden',
      x: 0,
      y: 0,
      scaleX: 1,
      scaleY: 1,
      transformOrigin: '0 0',
      zIndex: 6,
    })
    if (extra) gsap.set(extra, { opacity: 0 })
    if (scrim) gsap.set(scrim, { opacity: 0 })

    const tl = gsap.timeline({
      defaults: { overwrite: 'auto' },
      onComplete: () => {
        pinExpandedToGrid()
        sourceRectRef.current = null
        if (extra) gsap.set(extra, { clearProps: 'opacity' })
      },
    })
    flipTlRef.current = tl

    tl.to(
      expanded,
      {
        top: dest.top,
        left: dest.left,
        width: dest.width,
        height: dest.height,
        duration: PROJECT_DETAIL_MS,
        ease: 'power3.inOut',
      },
      0,
    )
    if (scrim) {
      tl.to(scrim, { opacity: 1, duration: PROJECT_DETAIL_MS * 0.75, ease: 'power2.out' }, 0)
    }
    if (extra) {
      tl.to(extra, { opacity: 1, duration: 0.22, ease: 'power2.out' }, PROJECT_DETAIL_MS * 0.55)
    }

    return () => {
      killFlip()
    }
  }, [killFlip, pinExpandedToGrid, reduced, selectedId])

  useEffect(() => {
    if (!selectedId || closing) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        closeProject()
      }
    }
    document.addEventListener('keydown', onKey)
    const closeBtn = projectsRef.current?.querySelector<HTMLButtonElement>(
      '.puppeteer-projects__expanded .puppeteer-projects__back',
    )
    closeBtn?.focus()
    return () => document.removeEventListener('keydown', onKey)
  }, [closeProject, closing, selectedId])

  const featured = projects.filter((p) => p.featured)
  const selected = selectedId
    ? (featured.find((p) => p.id === selectedId) ?? null)
    : null
  const detailActive = Boolean(selected)

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
        <div className="puppeteer-header__actions">
          {opened && (
            <button
              type="button"
              className="puppeteer-btn puppeteer-btn--ghost puppeteer-btn--compact"
              onClick={closeCurtains}
            >
              {t('puppeteer.ctaClose')}
            </button>
          )}
          <LanguageToggle />
        </div>
      </header>

      <div className="puppeteer-hero__copy" aria-hidden={opened || undefined}>
        <p className="puppeteer-hero__role">{t('puppeteer.role')}</p>
        <h1 className="puppeteer-hero__brand-line">Amir Mohammad</h1>
        <p className="puppeteer-hero__tagline">{t('puppeteer.tagline')}</p>
        <div className="puppeteer-hero__cta">
          <a className="puppeteer-btn puppeteer-btn--primary" href={`mailto:${contact.email}`}>
            {t('puppeteer.ctaSecondary')}
          </a>
          <button
            type="button"
            className="puppeteer-btn puppeteer-btn--ghost"
            onClick={openCurtains}
            tabIndex={opened ? -1 : undefined}
          >
            {t('puppeteer.ctaPrimary')}
          </button>
        </div>
        <p className="puppeteer-hero__hint">{t('puppeteer.hint')}</p>
      </div>

      <div ref={stageRef} id="stage" className="puppeteer-stage">
        {/* Projects wait behind the curtains */}
        <div
          ref={projectsRef}
          className={[
            'puppeteer-projects',
            detailActive ? 'is-detail' : '',
            closing ? 'is-closing' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          aria-hidden={!opened}
          aria-label={t('puppeteer.projectsAria')}
        >
          <p className="puppeteer-projects__eyebrow">{t('puppeteer.projectsEyebrow')}</p>
          <ul ref={gridRef} className="puppeteer-projects__grid">
            {featured.map((project) => {
              const isPlaceholder = selectedId === project.id
              const isDimmed = Boolean(selectedId && !isPlaceholder)
              return (
                <li
                  key={project.id}
                  ref={(node) => {
                    if (node) cardRefs.current.set(project.id, node)
                    else cardRefs.current.delete(project.id)
                  }}
                  className={[
                    'puppeteer-projects__card',
                    isPlaceholder ? 'is-placeholder' : '',
                    isDimmed ? 'is-dimmed' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  aria-hidden={isPlaceholder || undefined}
                >
                  <button
                    type="button"
                    className="puppeteer-projects__hit"
                    onClick={() => openProject(project.id)}
                    aria-expanded={isPlaceholder}
                    aria-controls={isPlaceholder ? 'project-expanded' : undefined}
                    tabIndex={opened && !selectedId ? 0 : -1}
                    disabled={Boolean(selectedId)}
                  >
                    <ProjectCardFace
                      project={project}
                      name={t(`projects.${project.nameKey}.name`)}
                    />
                  </button>
                </li>
              )
            })}
          </ul>

          {selected ? (
            <div
              ref={expandRootRef}
              className={`puppeteer-projects__expand${closing ? ' is-closing' : ''}`}
              role="dialog"
              aria-modal="true"
              aria-labelledby="project-expanded-title"
              id="project-expanded"
            >
              <button
                ref={scrimRef}
                type="button"
                className="puppeteer-projects__scrim"
                onClick={closeProject}
                tabIndex={-1}
                aria-label={t('puppeteer.projectBack')}
              />
              <article ref={expandedRef} className="puppeteer-projects__expanded">
                <button
                  type="button"
                  className="puppeteer-btn puppeteer-btn--ghost puppeteer-btn--compact puppeteer-projects__back"
                  onClick={closeProject}
                  tabIndex={opened && !closing ? 0 : -1}
                >
                  {t('puppeteer.projectBack')}
                </button>
                <div className="puppeteer-projects__expanded-face">
                  <ProjectCardFace
                    project={selected}
                    name={t(`projects.${selected.nameKey}.name`)}
                    fullStack
                    titleId="project-expanded-title"
                  />
                </div>
                <div ref={extraRef} className="puppeteer-projects__extra">
                  <p className="puppeteer-projects__summary">
                    {t(`projects.${selected.nameKey}.summary`)}
                  </p>
                  <div className="puppeteer-projects__links">
                    {selected.demoUrl ? (
                      <a
                        className="puppeteer-btn puppeteer-btn--primary puppeteer-btn--compact"
                        href={selected.demoUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        tabIndex={opened && !closing ? 0 : -1}
                      >
                        {selected.hasFakeDemo ? t('work.demoFake') : t('work.demo')}
                      </a>
                    ) : (
                      <span className="puppeteer-projects__private">{t('work.private')}</span>
                    )}
                    {selected.githubUrl ? (
                      <a
                        className="puppeteer-btn puppeteer-btn--ghost puppeteer-btn--compact"
                        href={selected.githubUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        tabIndex={opened && !closing ? 0 : -1}
                      >
                        {t('work.code')}
                      </a>
                    ) : null}
                  </div>
                </div>
              </article>
            </div>
          ) : null}
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
