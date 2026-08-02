import './layout.css'
import { Suspense } from 'react'
import Header from './components/header'
import Footer from './components/footer'
import { StackProvider } from '@stackframe/stack'
import { isStackAuthConfigured, stackServerApp } from '@/lib/stack'

export const metadata = {
  title: {
    template: '%s | 邀請碼大全',
    default: '邀請碼大全 - 最完整的MGM推薦碼分享平台'
  },
  description: '最完整的MGM推薦碼分享平台',
}

export default function RootLayout({ children }) {
  const authEnabled = isStackAuthConfigured()
  const content = (
    <>
      <Suspense fallback={<div className="header-placeholder" />}>
        <Header authEnabled={authEnabled} />
      </Suspense>
      <main className="main-container">
        {children}
      </main>
      <Footer />
    </>
  )

  return (
    <html lang="zh-TW">
      <body>
        {authEnabled ? (
          <StackProvider app={stackServerApp}>{content}</StackProvider>
        ) : (
          content
        )}
      </body>
    </html>
  )
}
