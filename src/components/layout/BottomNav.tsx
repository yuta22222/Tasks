'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Calendar, CheckSquare, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/stores/uiStore'

const navItems = [
  { href: '/dashboard', label: 'ホーム',     icon: LayoutDashboard },
  { href: '/calendar',  label: 'カレンダー', icon: Calendar },
  null,
  { href: '/tasks',     label: 'タスク',     icon: CheckSquare },
]

function useFABConfig(pathname: string) {
  if (pathname.startsWith('/calendar')) return { label: '予定を追加', ariaLabel: '予定を追加' }
  return { label: 'タスクを追加', ariaLabel: 'タスクを追加' }
}

export function BottomNav() {
  const pathname = usePathname()
  const { openTaskModal, openCalendarEventModal } = useUIStore()
  const fab = useFABConfig(pathname)

  const handleFAB = () => {
    if (pathname.startsWith('/calendar')) openCalendarEventModal()
    else openTaskModal()
  }

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-30 border-t pb-safe"
      style={{
        background: 'rgba(11,17,13,0.92)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        borderColor: 'var(--border)',
      }}
      aria-label="メインナビゲーション"
    >
      <div className="flex items-center h-[60px] max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          if (!item) {
            return (
              <div key="fab" className="flex-1 flex justify-center">
                <button
                  onClick={handleFAB}
                  className="group flex items-center gap-1.5 h-10 rounded-2xl text-white active:scale-90 transition-all duration-200 px-4 text-xs font-bold"
                  style={{
                    background: 'var(--gradient-primary)',
                    boxShadow: 'var(--shadow-accent)',
                  }}
                  aria-label={fab.ariaLabel}
                >
                  <Plus size={16} strokeWidth={2.5} aria-hidden="true" />
                  <span style={{ letterSpacing: '-0.01em' }}>{fab.label}</span>
                </button>
              </div>
            )
          }
          const active = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex-1 flex flex-col items-center justify-center gap-1 min-h-[44px] text-[10px] font-medium transition-all duration-150"
              style={{ color: active ? 'var(--accent)' : 'var(--muted)', fontWeight: active ? 600 : 500 }}
              aria-current={active ? 'page' : undefined}
            >
              <item.icon size={19} strokeWidth={active ? 2.2 : 1.6} aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
