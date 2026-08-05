import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './i18n'
import i18n, { applyDocumentLanguage } from './i18n'
import './index.css'
import App from './App.tsx'

applyDocumentLanguage(i18n.language.startsWith('fa') ? 'fa' : 'en')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
