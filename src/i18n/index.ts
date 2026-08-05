import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import fa from './locales/fa.json'

const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('lang') : null

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fa: { translation: fa },
  },
  lng: saved === 'fa' || saved === 'en' ? saved : 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

export default i18n

export function applyDocumentLanguage(lng: string) {
  const html = document.documentElement
  html.lang = lng
  html.dir = lng === 'fa' ? 'rtl' : 'ltr'
  localStorage.setItem('lang', lng)
  document.title =
    lng === 'fa'
      ? 'امیرمحمد — مهندس فرانت‌اند'
      : 'Amir Mohammad — Frontend Engineer'
}
