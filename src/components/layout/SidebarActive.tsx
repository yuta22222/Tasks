'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Calendar, CheckSquare, PanelLeft, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/stores/uiStore'
import { useAuth } from '@/hooks/useAuth'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'ダッシュボード', icon: LayoutDashboard },
  { href: '/calendar',  label: 'カレンダー',     icon: Calendar },
  { href: '/tasks',     label: 'タスク',          icon: CheckSquare },
]

type Props = { showLabels?: boolean }

export function SidebarActive({ showLabels }: Props) {
  const pathname = usePathname()
  const { sidebarOpen, toggleSidebar } = useUIStore()
  const { signOut } = useAuth()

  if (!showLabels) {
    return (
      <button
        onClick={toggleSidebar}
        className="p-1.5 rounded-lg transition-all duration-150"
        style={{ color: 'var(--muted)' }}
        aria-label="サイドバー切り替え"
      >
        <PanelLeft size={15} />
      </button>
    )
  }

  return (
    <div className="flex flex-col h-full justify-between px-3 py-2">
      <ul className="space-y-0.5">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 min-h-[40px]',
                  active
                    ? 'text-white font-semibold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-2)]',
                )}
                style={active ? {
                  background: 'var(--gradient-primary)',
                  boxShadow: '0 4px 16px rgba(139,124,248,0.3)',
                } : undefined}
              >
                <Icon size={15} className="shrink-0" strokeWidth={active ? 2.2 : 1.8} />
                {sidebarOpen && <span>{label}</span>}
              </Link>
            </li>
          )
        })}
      </ul>

      <button
        onClick={signOut}
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 mb-2 min-h-[40px] group"
        style={{ color: 'var(--muted)' }}
      >
        <LogOut size={15} className="shrink-0 group-hover:translate-x-0.5 transition-transform duration-150" />
        {sidebarOpen && <span>ログアウト</span>}
      </button>
    </div>
  )
}
