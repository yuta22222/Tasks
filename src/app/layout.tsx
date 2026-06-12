import type { Metadata } from 'next'
import { Inter, Noto_Sans_JP } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const notoSansJP = Noto_Sans_JP({ subsets: ['latin'], variable: '--font-noto-sans-jp', weight: ['400', '600', '700'] })

export const metadata: Metadata = {
  title: 'TaskFlow',
  description: 'タスクと予定をシンプルに管理',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={`${inter.variable} ${notoSansJP.variable} h-full antialiased dark`}>
      <body className="min-h-full flex flex-col font-[family-name:var(--font-inter),var(--font-noto-sans-jp),sans-serif]">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
