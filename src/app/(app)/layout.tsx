import { SidebarStatic } from '@/components/layout/SidebarStatic'
import { BottomNav } from '@/components/layout/BottomNav'
import { Header } from '@/components/layout/Header'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <SidebarStatic />
      <div className="lg:pl-[240px] flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 p-4 lg:p-6 pb-20 lg:pb-6">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
