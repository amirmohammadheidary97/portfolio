import { useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { useTranslation } from 'react-i18next'
import { MORPH_STEPS, skills } from '../../data/skills'
import { WorkshopAtmosphere } from './WorkshopAtmosphere'

gsap.registerPlugin(useGSAP)

type Phase = 'idle' | 'wiring' | 'morphing' | 'living' | 'dissolving'

/** Bench arc: pieces float low, slightly arched like parts on a workbench. */
function benchPosition(t: number, lift: number) {
  const x = 6 + t * 88
  const arc = Math.sin(t * Math.PI) * 10
  const y = 86 - arc - lift * 0.35
  return { x, y }
}

function LivingUI({ active }: { active: boolean }) {
  const { t } = useTranslation()

  return (
    <div className={`living-ui${active ? ' is-active' : ''}`} data-living-ui>
      <div className="living-ui__chrome" aria-hidden>
        <span />
        <span />
        <span />
      </div>
      <div className="living-ui__nav" data-living-nav>
        <div className="living-ui__logo">
          BIMS
          <span className="living-ui__badge" data-living-badge>
            {t('workshop.live.live')}
          </span>
        </div>
        <div className="living-ui__links">
          <span className="is-active">{t('workshop.live.overview')}</span>
          <span>{t('workshop.live.samples')}</span>
          <span>{t('workshop.live.reports')}</span>
        </div>
      </div>
      <div className="living-ui__body">
        <div className="living-card" data-living-card>
          <div className="living-card__label">{t('workshop.live.samplesLabel')}</div>
          <div className="living-card__value" data-living-value>
            1,284
          </div>
          <div className="chart" aria-hidden>
            {[0.45, 0.7, 0.55, 0.9, 0.65, 0.8, 0.5].map((h, i) => (
              <div
                key={i}
                className="chart__bar"
                data-chart-bar
                style={{ height: `${h * 100}%` }}
              />
            ))}
          </div>
        </div>
        <div className="living-card" data-living-card-b>
          <div className="living-card__label">{t('workshop.live.pipeline')}</div>
          <div className="living-card__row">
            <div className="living-card__value">98.2%</div>
            <div className="living-ring" data-living-ring aria-hidden>
              <svg viewBox="0 0 36 36">
                <circle className="living-ring__track" cx="18" cy="18" r="14" />
                <circle className="living-ring__prog" data-ring-prog cx="18" cy="18" r="14" />
              </svg>
            </div>
          </div>
          <div className="living-ui__actions">
            <button type="button" className="living-btn" data-living-btn>
              {t('workshop.live.openModal')}
            </button>
            <button type="button" className="living-btn living-btn--ghost">
              {t('workshop.live.export')}
            </button>
          </div>
          <div className="living-loader" data-living-loader>
            <span className="living-loader__spin" />
            {t('workshop.live.syncing')}
          </div>
        </div>
        <div className="living-feed" data-living-feed>
          <div className="living-feed__title">{t('workshop.live.activity')}</div>
          <ul>
            <li data-feed-item>
              <span className="dot" />
              {t('workshop.live.feed1')}
            </li>
            <li data-feed-item>
              <span className="dot" />
              {t('workshop.live.feed2')}
            </li>
            <li data-feed-item>
              <span className="dot" />
              {t('workshop.live.feed3')}
            </li>
          </ul>
        </div>
      </div>
      <div className="living-toast" data-living-toast>
        {t('workshop.live.toast')}
      </div>
      <div className="living-modal" data-living-modal>
        <div className="living-modal__panel" data-living-modal-panel>
          <h3>{t('workshop.live.modalTitle')}</h3>
          <p>{t('workshop.live.modalBody')}</p>
          <button type="button" className="living-btn">
            {t('workshop.live.confirm')}
          </button>
        </div>
      </div>
    </div>
  )
}

export function WorkshopHero() {
  const { t, i18n } = useTranslation()
  const rootRef = useRef<HTMLElement>(null)
  const [livingActive, setLivingActive] = useState(false)
  const [ctaVisible, setCtaVisible] = useState(false)
  const [phase, setPhase] = useState<Phase>('idle')
  const reduceMotion = useMemo(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  )

  const positions = useMemo(
    () => skills.map((s) => ({ ...s, ...benchPosition(s.t, s.lift) })),
    [],
  )

  const phaseLabel = t(`workshop.phases.${phase}`)

  useGSAP(
    () => {
      const root = rootRef.current
      if (!root) return

      const pieces = gsap.utils.toArray<HTMLElement>('[data-skill]', root)
      const lines = gsap.utils.toArray<SVGPathElement>('[data-circuit]', root)
      const pulses = gsap.utils.toArray<SVGCircleElement>('[data-pulse]', root)
      const brand = root.querySelector<HTMLElement>('[data-brand]')
      const role = root.querySelector<HTMLElement>('[data-role]')
      const morph = root.querySelector<HTMLElement>('[data-morph]')
      const morphChain = root.querySelector<HTMLElement>('[data-morph-chain]')
      const living = root.querySelector<HTMLElement>('[data-living-ui]')
      const bars = gsap.utils.toArray<HTMLElement>('[data-chart-bar]', root)
      const loader = root.querySelector<HTMLElement>('[data-living-loader]')
      const modal = root.querySelector<HTMLElement>('[data-living-modal]')
      const modalPanel = root.querySelector<HTMLElement>('[data-living-modal-panel]')
      const btn = root.querySelector<HTMLElement>('[data-living-btn]')
      const valueEl = root.querySelector<HTMLElement>('[data-living-value]')
      const manifesto = root.querySelector<HTMLElement>('[data-stage-manifesto]')
      const feedItems = gsap.utils.toArray<HTMLElement>('[data-feed-item]', root)
      const toast = root.querySelector<HTMLElement>('[data-living-toast]')
      const ring = root.querySelector<SVGCircleElement>('[data-ring-prog]')
      const hint = root.querySelector<HTMLElement>('[data-hint]')
      const stamp = root.querySelector<HTMLElement>('[data-stamp]')
      const traveler = root.querySelector<SVGCircleElement>('[data-traveler]')
      const labelEls = gsap.utils.toArray<HTMLElement>('[data-skill-label]', root)

      if (reduceMotion) {
        pieces.forEach((el) => el.classList.add('is-lit'))
        gsap.set(lines, { opacity: 0.55, strokeDashoffset: 0 })
        gsap.set(living, { opacity: 1, scale: 1 })
        gsap.set(brand, { opacity: 0.2 })
        gsap.set(role, { opacity: 0.5 })
        gsap.set(bars, { scaleY: 1 })
        gsap.set(feedItems, { opacity: 1, x: 0 })
        gsap.set(manifesto, { opacity: 1 })
        gsap.set(stamp, { opacity: 0.35 })
        setLivingActive(true)
        setCtaVisible(true)
        setPhase('living')
        return
      }

      gsap.set(pieces, { opacity: 0.32, y: 14 })
      gsap.set(lines, {
        opacity: 0,
        strokeDasharray: (_i, el) => {
          const len = (el as SVGPathElement).getTotalLength()
          return `${len} ${len}`
        },
        strokeDashoffset: (_i, el) => (el as SVGPathElement).getTotalLength(),
      })
      gsap.set(pulses, { opacity: 0, attr: { r: 0.5 } })
      gsap.set(traveler, { opacity: 0 })
      gsap.set(living, { opacity: 0, scale: 0.9 })
      gsap.set([morph, morphChain], { opacity: 0, y: 8 })
      gsap.set(bars, { scaleY: 0.12 })
      gsap.set([loader, modal, toast, manifesto], { opacity: 0 })
      gsap.set(modalPanel, { y: 16, scale: 0.96 })
      gsap.set(feedItems, { opacity: 0, x: -8 })
      gsap.set(role, { opacity: 0 })
      gsap.set(stamp, { opacity: 0.55, rotate: -8 })
      if (ring) {
        const len = 2 * Math.PI * 14
        gsap.set(ring, { strokeDasharray: len, strokeDashoffset: len })
      }

      const floatTweens = pieces.map((piece, i) =>
        gsap.to(piece, {
          y: `+=${5 + (i % 3) * 2}`,
          x: `+=${((i % 2) * 2 - 1) * 3}`,
          duration: 2.6 + (i % 4) * 0.4,
          yoyo: true,
          repeat: -1,
          ease: 'sine.inOut',
          delay: i * 0.1,
          paused: true,
        }),
      )

      const tl = gsap.timeline({
        repeat: -1,
        repeatDelay: 1.2,
        defaults: { ease: 'power2.out' },
      })

      tl.call(() => setPhase('idle'), undefined, 0)
      tl.call(() => floatTweens.forEach((tw) => tw.restart(true)), undefined, 0)

      // Name alone — brand first
      tl.fromTo(
        brand,
        { opacity: 0, scale: 0.94, filter: 'blur(12px)' },
        { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 1.55, ease: 'power3.out' },
        0,
      )
      tl.to(pieces, { opacity: 0.48, duration: 1, stagger: 0.05 }, 0.4)
      tl.fromTo(hint, { opacity: 0 }, { opacity: 1, duration: 0.55 }, 0.9)
      tl.fromTo(stamp, { opacity: 0, scale: 0.9 }, { opacity: 0.55, scale: 1, duration: 0.6 }, 1)

      // Event 1 — sequential circuit: light → next → next
      tl.call(
        () => {
          setPhase('wiring')
          floatTweens.forEach((tw) => tw.pause())
          gsap.set(pieces, { x: 0, y: 0 })
        },
        undefined,
        1.7,
      )
      tl.to(stamp, { opacity: 0.2, duration: 0.4 }, 1.7)

      pieces.forEach((piece, i) => {
        const at = 1.85 + i * 0.48
        tl.call(() => piece.classList.add('is-lit'), undefined, at)
        tl.to(
          piece,
          {
            opacity: 1,
            y: 0,
            x: 0,
            boxShadow: '0 0 28px rgba(232,184,109,0.32)',
            duration: 0.32,
          },
          at,
        )
        if (lines[i]) {
          tl.to(
            lines[i],
            { opacity: 0.85, strokeDashoffset: 0, duration: 0.46, ease: 'power2.inOut' },
            at + 0.05,
          )
        }
        if (pulses[i]) {
          tl.fromTo(
            pulses[i],
            { opacity: 1, attr: { r: 0.4 } },
            { opacity: 0, attr: { r: 2.4 }, duration: 0.5 },
            at + 0.18,
          )
        }
        // Energy traveler hops along each segment
        if (traveler && Number.isFinite(positions[i]?.x) && Number.isFinite(positions[i]?.y)) {
          tl.set(
            traveler,
            {
              opacity: 1,
              attr: { cx: positions[i].x, cy: positions[i].y },
            },
            at,
          )
          const nextPos = positions[i + 1]
          if (nextPos && Number.isFinite(nextPos.x) && Number.isFinite(nextPos.y)) {
            tl.to(
              traveler,
              {
                attr: { cx: nextPos.x, cy: nextPos.y },
                duration: 0.46,
                ease: 'power1.inOut',
              },
              at + 0.05,
            )
          }
        }
      })

      const afterCircuit = 1.85 + pieces.length * 0.48 + 0.35
      tl.to(traveler, { opacity: 0, duration: 0.25 }, afterCircuit - 0.1)
      tl.to(role, { opacity: 0.85, duration: 0.5 }, afterCircuit - 0.2)

      // Event 2 — pieces morph into UI vocabulary
      tl.call(() => setPhase('morphing'), undefined, afterCircuit)
      tl.to(hint, { opacity: 0, duration: 0.3 }, afterCircuit)
      tl.to(morphChain, { opacity: 1, y: 0, duration: 0.45 }, afterCircuit)

      pieces.forEach((piece, i) => {
        const skill = positions[i]
        const at = afterCircuit + 0.35 + i * 0.28
        tl.to(
          piece,
          {
            top: `${38 + (i % 4) * 8}%`,
            left: `${22 + (i % 4) * 16}%`,
            duration: 0.55,
            ease: 'power3.inOut',
          },
          at,
        )
        tl.call(
          () => {
            if (labelEls[i] && skill) labelEls[i].textContent = skill.morphsTo
          },
          undefined,
          at + 0.2,
        )
      })

      MORPH_STEPS.forEach((step, i) => {
        const at = afterCircuit + 0.2 + i * 0.48
        tl.call(
          () => {
            if (morph) morph.textContent = step
          },
          undefined,
          at,
        )
        tl.fromTo(
          morph,
          { opacity: 0, y: 12, scale: 0.94 },
          { opacity: 1, y: 0, scale: 1, duration: 0.28 },
          at,
        )
        if (i < MORPH_STEPS.length - 1) {
          tl.to(morph, { opacity: 0, y: -10, duration: 0.18 }, at + 0.3)
        }
      })

      const afterMorph = afterCircuit + MORPH_STEPS.length * 0.48 + 0.35

      tl.to(pieces, { opacity: 0, scale: 0.7, duration: 0.55, stagger: 0.03 }, afterMorph)
      tl.to(lines, { opacity: 0, duration: 0.4 }, afterMorph)
      tl.to(morphChain, { opacity: 0, duration: 0.3 }, afterMorph)
      tl.to(brand, { opacity: 0.06, scale: 0.97, duration: 0.65 }, afterMorph)
      tl.to(role, { opacity: 0, duration: 0.3 }, afterMorph)
      tl.to(morph, { opacity: 0, duration: 0.25 }, afterMorph + 0.1)
      tl.to(stamp, { opacity: 0, duration: 0.3 }, afterMorph)

      // Event 3 — product comes alive
      tl.call(() => setPhase('living'), undefined, afterMorph + 0.15)
      tl.to(
        living,
        {
          opacity: 1,
          scale: 1,
          duration: 0.95,
          ease: 'power3.out',
          onStart: () => setLivingActive(true),
        },
        afterMorph + 0.2,
      )

      const liveAt = afterMorph + 1.0
      tl.to(bars, { scaleY: 1, duration: 0.75, stagger: 0.05, ease: 'power2.out' }, liveAt)
      if (ring) {
        tl.to(ring, { strokeDashoffset: 2 * Math.PI * 14 * 0.018, duration: 1.1 }, liveAt + 0.2)
      }
      tl.to(feedItems, { opacity: 1, x: 0, duration: 0.4, stagger: 0.18 }, liveAt + 0.45)
      tl.to(loader, { opacity: 1, duration: 0.3 }, liveAt + 0.95)
      tl.to(loader, { opacity: 0, duration: 0.3 }, liveAt + 2.35)
      tl.call(
        () => {
          if (valueEl) valueEl.textContent = '1,312'
        },
        undefined,
        liveAt + 2.15,
      )
      tl.fromTo(
        toast,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.35 },
        liveAt + 2.45,
      )
      tl.to(toast, { opacity: 0, y: -6, duration: 0.3 }, liveAt + 4.1)
      tl.fromTo(
        btn,
        { scale: 1 },
        { scale: 1.06, duration: 0.22, yoyo: true, repeat: 1 },
        liveAt + 3.1,
      )
      tl.to(modal, { opacity: 1, duration: 0.3 }, liveAt + 3.5)
      tl.to(modalPanel, { y: 0, scale: 1, duration: 0.42, ease: 'power3.out' }, liveAt + 3.5)
      tl.to(modal, { opacity: 0, duration: 0.28 }, liveAt + 5.5)
      tl.to(modalPanel, { y: 12, scale: 0.96, duration: 0.22 }, liveAt + 5.5)
      tl.to(
        bars,
        {
          scaleY: () => 0.35 + Math.random() * 0.65,
          duration: 0.4,
          stagger: 0.04,
        },
        liveAt + 5.9,
      )
      tl.to(bars, { scaleY: 1, duration: 0.45, stagger: 0.04 }, liveAt + 6.5)

      tl.fromTo(
        manifesto,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.75, ease: 'power3.out' },
        liveAt + 7.0,
      )
      tl.call(() => setCtaVisible(true), undefined, liveAt + 4.8)

      // Dissolve — product breaks back into skills
      const dissolveAt = liveAt + 10.0
      tl.call(() => setPhase('dissolving'), undefined, dissolveAt)
      tl.to(manifesto, { opacity: 0, duration: 0.35 }, dissolveAt)
      tl.to(living, { opacity: 0, scale: 0.88, duration: 0.75 }, dissolveAt)
      tl.call(() => setLivingActive(false), undefined, dissolveAt + 0.4)
      tl.to(brand, { opacity: 1, scale: 1, duration: 0.75 }, dissolveAt + 0.4)
      tl.to(role, { opacity: 0, duration: 0.2 }, dissolveAt)
      tl.to(stamp, { opacity: 0.55, duration: 0.5 }, dissolveAt + 0.7)
      tl.call(
        () => {
          pieces.forEach((p, i) => {
            p.classList.remove('is-lit')
            if (labelEls[i] && positions[i]) {
              labelEls[i].textContent = positions[i].label
            }
          })
          if (valueEl) valueEl.textContent = '1,284'
        },
        undefined,
        dissolveAt + 0.5,
      )
      tl.set(
        pieces,
        {
          scale: 1,
          opacity: 0.28,
          left: (_i, el) => (el as HTMLElement).dataset.homeX + '%',
          top: (_i, el) => (el as HTMLElement).dataset.homeY + '%',
        },
        dissolveAt + 0.55,
      )
      tl.set(
        lines,
        {
          opacity: 0,
          strokeDashoffset: (_i, el) => (el as SVGPathElement).getTotalLength(),
        },
        dissolveAt + 0.55,
      )
      tl.set(bars, { scaleY: 0.12 }, dissolveAt + 0.55)
      tl.set(feedItems, { opacity: 0, x: -8 }, dissolveAt + 0.55)
      if (ring) {
        tl.set(ring, { strokeDashoffset: 2 * Math.PI * 14 }, dissolveAt + 0.55)
      }
      tl.to(pieces, { opacity: 0.48, duration: 0.5 }, dissolveAt + 0.7)
      tl.to(hint, { opacity: 1, duration: 0.4 }, dissolveAt + 0.85)
      tl.call(() => setPhase('idle'), undefined, dissolveAt + 1.05)
    },
    { scope: rootRef, dependencies: [reduceMotion, i18n.language] },
  )

  return (
    <section className="workshop" id="top" ref={rootRef} aria-label={t('workshop.aria')}>
      <WorkshopAtmosphere />

      <div className="workshop__phase" data-phase aria-live="polite">
        <span className="workshop__phase-dot" />
        {phaseLabel}
      </div>

      <div className="workshop__stamp" data-stamp aria-hidden>
        {t('workshop.underConstruction')}
      </div>

      <div className="workshop__stage">
        <svg
          className="workshop__svg"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden
        >
          {positions.slice(0, -1).map((p, i) => {
            const next = positions[i + 1]
            const midX = (p.x + next.x) / 2
            const midY = Math.min(p.y, next.y) - 8 - (i % 2) * 3
            const d = `M ${p.x} ${p.y} Q ${midX} ${midY} ${next.x} ${next.y}`
            return (
              <g key={p.id}>
                <path className="circuit-line" data-circuit d={d} />
                <circle
                  className="circuit-pulse"
                  data-pulse
                  cx={next.x}
                  cy={next.y}
                  r="0.5"
                  fill="var(--accent-bright)"
                />
              </g>
            )
          })}
          <circle
            className="circuit-traveler"
            data-traveler
            cx={positions[0]?.x ?? 50}
            cy={positions[0]?.y ?? 80}
            r="1.1"
            fill="var(--accent-bright)"
          />
        </svg>

        {positions.map((p) => (
          <div
            key={p.id}
            className="skill-piece"
            data-skill
            data-home-x={p.x}
            data-home-y={p.y}
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
          >
            <span className="skill-piece__pin" aria-hidden />
            <span className="skill-piece__label" data-skill-label>
              {p.label}
            </span>
          </div>
        ))}

        <div className="workshop__brand" data-brand>
          <h1 className="workshop__name">Amir Mohammad</h1>
          <p className="workshop__role" data-role>
            {t('workshop.role')}
          </p>
        </div>

        <div className="morph-label" data-morph aria-hidden>
          React
        </div>

        <ol className="morph-chain" data-morph-chain aria-hidden>
          {MORPH_STEPS.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>

        <p className="workshop__stage-manifesto" data-stage-manifesto>
          {t('workshop.manifesto')}
        </p>

        <LivingUI active={livingActive} />

        <p className="workshop__hint" data-hint>
          {t('workshop.hint')}
        </p>
      </div>

      <div className={`workshop__cta${ctaVisible ? ' is-visible' : ''}`}>
        <a className="btn btn--primary" href="#work">
          {t('nav.enter')}
        </a>
        <a className="btn btn--ghost" href="#about">
          {t('nav.about')}
        </a>
      </div>
    </section>
  )
}
