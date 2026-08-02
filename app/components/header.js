'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { UserButton } from '@neondatabase/auth-ui'
import { authClient } from '@/lib/auth-client'
import { useLanguage } from '../../lib/i18n/LanguageContext'
import LanguageSwitcher from './LanguageSwitcher'
import BeeIcon from './BeeIcon'

function AuthButtons({ mobile = false, t }) {
  const session = authClient.useSession()
  const user = session.data?.user
  const className = mobile ? 'mobile-auth-buttons' : 'auth-buttons'

  if (user) {
    return (
      <div className={className}>
        {/* disableDefaultLinks hides the built-in Settings item, which points at
            an account view path this app has no route for (404). Sign out stays. */}
        <UserButton disableDefaultLinks />
      </div>
    )
  }

  return (
    <div className={className}>
      <Link href="/auth/login" className="btn-login">
        {t('header.nav.login')}
      </Link>
      <Link href="/auth/signup" className="btn-register">
        {t('header.nav.register')}
      </Link>
    </div>
  )
}

export default function Header() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobileMemberOpen, setIsMobileMemberOpen] = useState(false)
  const pathname = usePathname()
  const { t } = useLanguage()

  useEffect(() => {
    setIsMobileMenuOpen(false)
    setIsMobileMemberOpen(false)
  }, [pathname])

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileMenuOpen])

  return (
    <header className="header">
      <div className="header-container">
        <Link href="/" className="logo-group">
          <span className="logo">
            <BeeIcon size={26} className="logo-bee" />
            Invite<span className="logo-accent">Bee</span>
          </span>
          <span className="logo-tagline">
            {t('header.tagline')}
            <BeeIcon size={15} className="tagline-bee" />
          </span>
        </Link>

        <nav className="nav">
          <ul className="nav-links">
            <li>
              <Link
                href="/"
                className={pathname === '/' ? 'active' : ''}
              >
                {t('header.nav.home')}
              </Link>
            </li>
            <li
              className="member-dropdown"
              onMouseEnter={() => setIsDropdownOpen(true)}
              onMouseLeave={() => setIsDropdownOpen(false)}
            >
              <Link href="#" onClick={(e) => e.preventDefault()}>
                {t('header.nav.memberArea')}
              </Link>
              <div className={`dropdown-menu ${isDropdownOpen ? 'show' : ''}`}>
                <Link
                  href="/profile"
                  className={pathname === '/profile' ? 'active' : ''}
                >
                  {t('header.nav.profileEdit')}
                </Link>
                <Link
                  href="/manageCode"
                  className={pathname === '/manageCode' ? 'active' : ''}
                >
                  {t('header.nav.manageCode')}
                </Link>
              </div>
            </li>
            <li>
              <Link
                href="/aboutUs"
                className={pathname === '/aboutUs' ? 'active' : ''}
              >
                {t('header.nav.aboutUs')}
              </Link>
            </li>
          </ul>

          <LanguageSwitcher variant="desktop" />

          <AuthButtons t={t} />
        </nav>

        <button
          type="button"
          className={`mobile-menu-toggle ${isMobileMenuOpen ? 'open' : ''}`}
          aria-label={isMobileMenuOpen ? t('header.closeMenu') : t('header.openMenu')}
          aria-expanded={isMobileMenuOpen}
          onClick={() => setIsMobileMenuOpen((v) => !v)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      <div className={`mobile-menu-overlay ${isMobileMenuOpen ? 'show' : ''}`} onClick={() => setIsMobileMenuOpen(false)} />

      <div className={`mobile-menu-panel ${isMobileMenuOpen ? 'show' : ''}`}>
        <Link href="/" className={pathname === '/' ? 'active' : ''}>
          {t('header.nav.home')}
        </Link>

        <button
          type="button"
          className={`mobile-member-toggle ${isMobileMemberOpen ? 'open' : ''}`}
          onClick={() => setIsMobileMemberOpen((v) => !v)}
        >
          {t('header.nav.memberArea')}
          <span className="mobile-member-caret">▾</span>
        </button>
        <div className={`mobile-submenu ${isMobileMemberOpen ? 'show' : ''}`}>
          <Link href="/profile" className={pathname === '/profile' ? 'active' : ''}>
            {t('header.nav.profileEdit')}
          </Link>
          <Link href="/manageCode" className={pathname === '/manageCode' ? 'active' : ''}>
            {t('header.nav.manageCode')}
          </Link>
        </div>

        <Link href="/aboutUs" className={pathname === '/aboutUs' ? 'active' : ''}>
          {t('header.nav.aboutUs')}
        </Link>

        <AuthButtons mobile t={t} />

        <LanguageSwitcher variant="mobile" />
      </div>
    </header>
  )
}
