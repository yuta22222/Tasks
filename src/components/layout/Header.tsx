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
    <header
      className="h-14 flex items-center px-5 lg:px-7 sticky top-0 z-20 border-b"
      style={{
        background: 'rgba(6,6,10,0.82)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="flex items-baseline gap-2.5">
        <h1
          className="text-[17px] font-bold text-[var(--text-primary)] leading-tight"
          style={{ letterSpacing: '-0.025em' }}
        >
          {meta?.title ?? ''}
        </h1>
        {meta?.sub && (
          <span className="text-xs text-[var(--muted)] hidden sm:inline">{meta.sub}</span>
        )}
      </div>
    </header>
  )
}
