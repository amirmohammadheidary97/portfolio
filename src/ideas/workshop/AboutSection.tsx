import { useTranslation } from 'react-i18next'
import { Reveal } from './Reveal'

export function AboutSection() {
  const { t } = useTranslation()

  return (
    <section className="section" id="about">
      <div className="container">
        <Reveal>
          <p className="eyebrow">{t('about.eyebrow')}</p>
          <h2 className="section-title">{t('about.title')}</h2>
        </Reveal>
        <div className="about-layout">
          <Reveal delay={0.08}>
            <div className="about-stat">
              <div className="about-stat__years">{t('about.years')}</div>
              <p className="about-stat__label">{t('about.yearsLabel')}</p>
            </div>
          </Reveal>
          <Reveal delay={0.12}>
            <div>
              <p className="about-copy">{t('about.body')}</p>
              <ul className="about-highlights">
                <li>
                  <span>01</span>
                  {t('about.h1')}
                </li>
                <li>
                  <span>02</span>
                  {t('about.h2')}
                </li>
                <li>
                  <span>03</span>
                  {t('about.h3')}
                </li>
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
