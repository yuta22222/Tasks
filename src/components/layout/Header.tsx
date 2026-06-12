'use client'
import { usePathname } from 'next/navigation'

const pageMeta: Record<string, { title: string; sub: string }> = {
  '/dashboard': { title: 'ダッシュボード', sub: '今日のタスクと予定' },
  '/calendar':  { title: 'カレンダー',     sub: 'スケジュール管理' },
  '/tasks':     { title: 'タスク',         sub: 'すべてのタスク' },
}

export function Header() {
  const pathname = usePathname()
  const meta = Object.entries(pageMeta).find(([key]) => pathname.startsWith(key))?.[1]

  return (
    <header className="h-16 flex items-center px-5 lg:px-7 sticky top-0 z-20 bg-[var(--bg)]/95 backdrop-blur-md border-b border-[var(--border)]">
      <div>
        <h1
          className="text-xl font-bold text-[var(--text-primary)] leading-tight"
          style={{ letterSpacing: '-0.02em' }}
        >
          {meta?.title ?? ''}
        </h1>
        {meta?.sub && (
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">{meta.sub}</p>
        )}
      </div>
    </header>
  )
}
