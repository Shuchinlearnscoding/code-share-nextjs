import './layout.css'
import '@neondatabase/auth-ui/css'
import { LanguageProvider } from '../lib/i18n/LanguageContext'
import Header from './components/header'
import Footer from './components/footer'
import Providers from './providers'

export const metadata = {
  title: {
    template: '%s | InviteBee',
    default: 'InviteBee - 最完整的推薦碼分享平台'
  },
  description: '最完整的推薦碼分享平台',
}

export default function RootLayout({ children }) {
  return (
    <html lang="zh-TW" suppressHydrationWarning>
      <body>
        <LanguageProvider>
          <Providers>
            <Header />
            <main className="main-container">
              {children}
            </main>
            <Footer />
          </Providers>
        </LanguageProvider>
      </body>
    </html>
  )
}
