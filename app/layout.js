import './layout.css'
import Header from './components/header'
import Footer from './components/footer'

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
        <Header />
        <main className="main-container">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}