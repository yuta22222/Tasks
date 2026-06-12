'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Calendar, CheckSquare, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/stores/uiStore'

const navItems = [
  { href: '/dashboard', label: 'ホーム',     icon: LayoutDashboard },
  { href: '/calendar',  label: 'カレンダー', icon: Calendar },
  null, // FABプレースホルダー
  { href: '/tasks',     label: 'タスク',     icon: CheckSquare },
]

// FABの見た目・ラベルをパスによって変える
function useFABConfig(pathname: string) {
  if (pathname.startsWith('/calendar')) {
    return { label: '予定を追加', ariaLabel: '予定を追加' }
  }
  return { label: 'タスクを追加', ariaLabel: 'タスクを追加' }
}

export function BottomNav() {
  const pathname = usePathname()
  const { openTaskModal, openCalendarEventModal } = useUIStore()
  const fab = useFABConfig(pathname)

  const handleFAB = () => {
    if (pathname.startsWith('/calendar')) {
      openCalendarEventModal()
    } else {
      openTaskModal()
    }
  }

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-[var(--surface-0)]/95 backdrop-blur-md border-t border-[var(--border)] pb-safe"
      aria-label="メインナビゲーション"
    >
      <div className="flex items-center h-14 max-w-lg mx-auto px-2">
        {navItems.map((item, i) => {
          if (!item) {
            // FAB（コンテキスト依存）
            return (
              <div key="fab" className="flex-1 flex justify-center">
                <button
                  onClick={handleFAB}
                  className="group relative flex items-center gap-2 h-11 rounded-2xl text-white shadow-lg shadow-indigo-500/30 active:scale-90 transition-all duration-200 px-4"
                  style={{ background: 'var(--gradient-primary)' }}
                  aria-label={fab.ariaLabel}
                >
                  <Plus size={18} strokeWidth={2.5} aria-hidden="true" />
                  {/* Extended FAB label — visible to show context */}
                  <span className="text-xs font-bold tracking-tight">{fab.label}</span>
                </button>
              </div>
            )
          }
          const active = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-1 min-h-[44px] text-[10px] font-medium transition-all duration-150',
                active ? 'text-[var(--accent)]' : 'text-[var(--muted)]',
              )}
              aria-current={active ? 'page' : undefined}
            >
              <item.icon size={19} strokeWidth={active ? 2.2 : 1.8} aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
