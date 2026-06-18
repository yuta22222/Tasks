import { SidebarActive } from './SidebarActive'

export function SidebarStatic() {
  return (
    <aside
      className="hidden lg:flex flex-col h-screen fixed left-0 top-0 z-30 w-[232px] border-r"
      style={{ background: 'var(--surface-0)', borderColor: 'var(--border)' }}
    >
      {/* ロゴエリア */}
      <div
        className="flex items-center h-14 px-5 border-b shrink-0 gap-3"
        style={{ borderColor: 'var(--border)' }}
      >
        <div
          className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'var(--gradient-primary)', boxShadow: 'var(--glow-accent)' }}
        >
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
            <path d="M2 7L5.5 10.5L12 3.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <span
          className="font-extrabold text-[var(--text-primary)] text-[15px]"
          style={{ letterSpacing: '-0.03em' }}
        >
          TaskFlow
        </span>
        <div className="ml-auto">
          <SidebarActive />
        </div>
      </div>

      {/* ナビ */}
      <nav className="flex-1 py-2 overflow-y-auto">
        <SidebarActive showLabels />
      </nav>
    </aside>
  )
}
