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
        className="p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-all duration-150"
        aria-label="サイドバー切り替え"
      >
        <PanelLeft size={16} />
      </button>
    )
  }

  return (
    <div className="flex flex-col h-full justify-between px-2 py-1">
      <ul className="space-y-0.5">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <li key={href} className="relative">
              {/* アクティブ left bar */}
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full bg-[var(--accent)]" />
              )}
              <Link
                href={href}
                className={cn(
                  'flex items-center gap-2.5 pl-4 pr-3 py-2.5 rounded-xl text-sm transition-all duration-150 min-h-[40px]',
                  active
                    ? 'text-[var(--text-primary)] bg-[var(--surface-2)] font-semibold'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--surface-1)] hover:text-[var(--text-primary)] font-medium'
                )}
              >
                <Icon size={16} className="shrink-0" strokeWidth={active ? 2.2 : 1.8} />
                {sidebarOpen && <span>{label}</span>}
              </Link>
            </li>
          )
        })}
      </ul>

      <button
        onClick={signOut}
        className="flex items-center gap-2.5 pl-4 pr-3 py-2.5 rounded-xl text-sm text-[var(--muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--danger)] transition-all duration-150 mb-2 min-h-[40px] group font-medium"
      >
        <LogOut size={16} className="shrink-0 group-hover:translate-x-0.5 transition-transform duration-150" />
        {sidebarOpen && <span>ログアウト</span>}
      </button>
    </div>
  )
}
