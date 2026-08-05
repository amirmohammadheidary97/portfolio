import { useTranslation } from 'react-i18next'
import { contact } from '../../data/projects'
import { Reveal } from './Reveal'

export function ContactSection() {
  const { t } = useTranslation()

  return (
    <section className="section" id="contact">
      <div className="container">
        <Reveal>
          <p className="eyebrow">{t('contact.eyebrow')}</p>
          <h2 className="section-title">{t('contact.title')}</h2>
          <p className="section-subtitle">{t('contact.subtitle')}</p>
          <div className="contact-links">
            <a className="btn btn--primary" href={`mailto:${contact.email}`}>
              {t('contact.email')}
            </a>
            <a
              className="btn btn--ghost"
              href={contact.github}
              target="_blank"
              rel="noreferrer noopener"
            >
              {t('contact.github')}
            </a>
            <a
              className="btn btn--ghost"
              href={contact.linkedin}
              target="_blank"
              rel="noreferrer noopener"
            >
              {t('contact.linkedin')}
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
