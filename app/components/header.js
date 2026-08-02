'use client'

import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { UserButton, useUser } from '@stackframe/stack'

export default function Header() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const pathname = usePathname()
  const user = useUser()

  return (
    <header className="header">
      <div className="header-container">
        <Link href="/" className="logo">
          邀請碼大全
        </Link>
        
        <nav className="nav">
          <ul className="nav-links">
            <li>
              <Link 
                href="/" 
                className={pathname === '/' ? 'active' : ''}
              >
                首頁
              </Link>
            </li>
            <li 
              className="member-dropdown"
              onMouseEnter={() => setIsDropdownOpen(true)}
              onMouseLeave={() => setIsDropdownOpen(false)}
            >
              <Link href="#" onClick={(e) => e.preventDefault()}>
                會員專區
              </Link>
              <div className={`dropdown-menu ${isDropdownOpen ? 'show' : ''}`}>
                <Link 
                  href="/profile"
                  className={pathname === '/profile' ? 'active' : ''}
                >
                  個人資料編輯
                </Link>
                <Link 
                  href="/manageCode"
                  className={pathname === '/manageCode' ? 'active' : ''}
                >
                  管理我的邀請碼
                </Link>
              </div>
            </li>
            <li>
              <Link 
                href="/aboutUs"
                className={pathname === '/aboutUs' ? 'active' : ''}
              >
                關於我們
              </Link>
            </li>
          </ul>
          
          {user ? (
            <div className="auth-buttons">
              <UserButton />
            </div>
          ) : (
            <div className="auth-buttons">
              <Link href="/handler/sign-in" className="btn-login">
                登入
              </Link>
              <Link href="/handler/sign-up" className="btn-register">
                註冊
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}
