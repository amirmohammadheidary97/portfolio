import { useTranslation } from 'react-i18next'
import { Reveal } from './Reveal'

export function Manifesto() {
  const { t } = useTranslation()

  return (
    <section className="manifesto" aria-label={t('workshop.manifestoAria')}>
      <div className="container">
        <Reveal>
          <p className="manifesto__line">{t('workshop.manifesto')}</p>
          <p className="manifesto__sub">{t('workshop.manifestoSub')}</p>
          <p className="manifesto__sub manifesto__sub--tag">{t('meta.tagline')}</p>
        </Reveal>
      </div>
    </section>
  )
}
