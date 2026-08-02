'use client';

import { useLanguage } from '../../lib/i18n/LanguageContext'

export default function Footer() {
  const { t } = useLanguage()

  return (
    <footer className="footer">
      <p>{t('footer.copyright')}</p>
    </footer>
  )
}
