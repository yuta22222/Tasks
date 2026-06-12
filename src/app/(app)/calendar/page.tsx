'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'

export default function CalendarPage() {
  const [CalendarView, setCalendarView] = useState<React.ComponentType | null>(null)

  useEffect(() => {
    import('@/components/calendar/CalendarView').then((m) => {
      setCalendarView(() => m.CalendarView)
    })
  }, [])

  if (!CalendarView) {
    return (
      <div className="h-[calc(100vh-10rem)] rounded-xl border border-[var(--border)] bg-[var(--surface)] animate-pulse" />
    )
  }

  return <CalendarView />
}
