import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { applyDocumentLanguage } from '../i18n'

export function LanguageToggle() {
  const { i18n } = useTranslation()
  const [lng, setLng] = useState(i18n.language)

  useEffect(() => {
    applyDocumentLanguage(i18n.language.startsWith('fa') ? 'fa' : 'en')
    setLng(i18n.language.startsWith('fa') ? 'fa' : 'en')
  }, [i18n.language])

  const toggle = () => {
    const next = lng === 'en' ? 'fa' : 'en'
    void i18n.changeLanguage(next)
    applyDocumentLanguage(next)
    setLng(next)
  }

  return (
    <button
      type="button"
      className="lang-toggle"
      onClick={toggle}
      aria-label={lng === 'en' ? 'Switch to Persian' : 'Switch to English'}
    >
      {lng === 'en' ? 'FA' : 'EN'}
    </button>
  )
}
