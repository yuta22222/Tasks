import { SidebarActive } from './SidebarActive'

export function SidebarStatic() {
  return (
    <aside className="hidden lg:flex flex-col h-screen fixed left-0 top-0 z-30 w-[240px] bg-[var(--surface-0)] border-r border-[var(--border)]">
      {/* ロゴエリア */}
      <div className="flex items-center h-16 px-5 border-b border-[var(--border)] shrink-0 gap-2.5">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--gradient-primary)' }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 7L5.5 10.5L12 3.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <span className="font-bold text-[var(--text-primary)] tracking-tight" style={{ letterSpacing: '-0.02em' }}>
          TaskFlow
        </span>
        <div className="ml-auto">
          <SidebarActive />
        </div>
      </div>

      {/* ナビ */}
      <nav className="flex-1 py-3 overflow-y-auto">
        <SidebarActive showLabels />
      </nav>
    </aside>
  )
}
