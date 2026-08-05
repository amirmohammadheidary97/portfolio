import { useTranslation } from 'react-i18next'

export function Footer() {
  const { t } = useTranslation()
  const year = new Date().getFullYear()

  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <p>{t('footer.crafted', { year })}</p>
        <p>Amir Mohammad</p>
      </div>
    </footer>
  )
}
