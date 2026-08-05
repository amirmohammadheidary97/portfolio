import { useCallback, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useTranslation } from 'react-i18next'
import { LanguageToggle } from '../../components/LanguageToggle'
import { contact, projects } from '../../data/projects'
import { Pendulum } from './Puppet'
import { pendulums, type PendulumId } from './puppets'
import { prefersReducedMotion } from './stringPhysics'

export function PuppeteerHero() {
  const { t } = useTranslation()
  const stageRef = useRef<HTMLDivElement>(null)
  const curtainLeftRef = useRef<HTMLDivElement>(null)
  const curtainRightRef = useRef<HTMLDivElement>(null)
  const projectsRef = useRef<HTMLDivElement>(null)
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

  // Curtain + projects reveal
  useEffect(() => {
    const left = curtainLeftRef.current
    const right = curtainRightRef.current
    const panel = projectsRef.current
    if (!left || !right || !panel) return

    const duration = reduced ? 0.01 : 1.2

    if (opened) {
      gsap.to(left, {
        xPercent: -100,
        duration,
        ease: 'power3.inOut',
        overwrite: true,
      })
      gsap.to(right, {
        xPercent: 100,
        duration,
        ease: 'power3.inOut',
        overwrite: true,
      })
      gsap.fromTo(
        panel,
        { opacity: 0, scale: 0.96 },
        {
          opacity: 1,
          scale: 1,
          duration: reduced ? 0.01 : 0.7,
          delay: reduced ? 0 : 0.45,
          ease: 'power2.out',
          overwrite: true,
        },
      )
      panel.setAttribute('aria-hidden', 'false')
    } else {
      gsap.to([left, right], {
        xPercent: 0,
        duration: reduced ? 0.01 : 0.9,
        ease: 'power3.inOut',
        overwrite: true,
      })
      gsap.to(panel, {
        opacity: 0,
        scale: 0.98,
        duration: reduced ? 0.01 : 0.35,
        ease: 'power1.in',
        overwrite: true,
      })
      panel.setAttribute('aria-hidden', 'true')
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

        {/* Two-piece curtain */}
        <div className="puppeteer-curtain" aria-hidden>
          <div ref={curtainLeftRef} className="puppeteer-curtain__panel puppeteer-curtain__panel--left" />
          <div
            ref={curtainRightRef}
            className="puppeteer-curtain__panel puppeteer-curtain__panel--right"
          />
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
