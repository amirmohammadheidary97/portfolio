import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LanguageToggle } from '../../components/LanguageToggle'

export function Header() {
  const { t } = useTranslation()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`site-header${scrolled ? ' is-scrolled' : ''}`}>
      <div className="site-header__inner">
        <a href="#top" className="brand">
          Amir <span>Mohammad</span>
        </a>
        <nav className="nav" aria-label="Primary">
          <a href="#work">{t('nav.work')}</a>
          <a href="#about">{t('nav.about')}</a>
          <a href="#contact">{t('nav.contact')}</a>
        </nav>
        <div className="header-actions">
          <LanguageToggle />
        </div>
      </div>
    </header>
  )
}
