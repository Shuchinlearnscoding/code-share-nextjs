import './layout.css'
import { Suspense } from 'react'
import Header from './components/header'
import Footer from './components/footer'
import { StackProvider } from '@stackframe/stack'
import { stackServerApp } from '@/lib/stack'

export const metadata = {
  title: {
    template: '%s | 邀請碼大全',
    default: '邀請碼大全 - 最完整的MGM推薦碼分享平台'
  },
  description: '最完整的MGM推薦碼分享平台',
}

export default function RootLayout({ children }) {
  return (
    <html lang="zh-TW">
      <body>
        <StackProvider app={stackServerApp}>
          <Suspense fallback={<div className="header-placeholder" />}>
            <Header />
          </Suspense>
          <main className="main-container">
            {children}
          </main>
          <Footer />
        </StackProvider>
      </body>
    </html>
  )
}
