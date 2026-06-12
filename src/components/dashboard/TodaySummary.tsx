'use client'
import { useTasks } from '@/hooks/useTasks'
import { useCalendarEvents } from '@/hooks/useCalendarEvents'
import { format, isToday, parseISO, isPast, addDays } from 'date-fns'
import { ja } from 'date-fns/locale'
import { CheckSquare, Calendar, AlertTriangle, Clock } from 'lucide-react'

export function TodaySummary() {
  const { tasks } = useTasks()
  const { events } = useCalendarEvents()

  const pendingCount = tasks.filter((t) => !t.isCompletedToday).length
  const overdueCount = tasks.filter((t) => {
    if (t.isCompletedToday || !t.due_date) return false
    const d = new Date(t.due_date + 'T00:00:00')
    return isPast(d) && !isToday(d)
  }).length
  const dueSoonCount = tasks.filter((t) => {
    if (t.isCompletedToday || !t.due_date) return false
    const d = new Date(t.due_date + 'T00:00:00')
    return isToday(d) || (!isPast(d) && d <= addDays(new Date(), 3))
  }).length
  const upcomingEvents = events
    .filter((e) => isToday(parseISO(e.start_at)))
    .slice(0, 3)

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* メインカード */}
      <div
        className="col-span-2 p-5 rounded-2xl relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #3A3CC8 0%, #5B5EE8 50%, #7C7FFA 100%)' }}
      >
        {/* 装飾 */}
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/8 rounded-full pointer-events-none" />
        <div className="absolute right-6 bottom-0 w-24 h-24 bg-white/5 rounded-full pointer-events-none" />

        <div className="relative">
          <div className="flex items-center gap-1.5 text-indigo-200 mb-2">
            <CheckSquare size={13} />
            <span className="text-xs font-medium tracking-wide">未完了タスク</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-5xl font-black text-white" style={{ letterSpacing: '-0.04em' }}>
              {pendingCount}
            </span>
            <span className="text-indigo-200 text-sm font-medium">件</span>
          </div>

          {(overdueCount > 0 || dueSoonCount > 0) && (
            <div className="flex flex-wrap gap-2 mt-3">
              {overdueCount > 0 && (
                <span className="flex items-center gap-1 text-xs bg-red-500/25 text-red-100 border border-red-400/20 px-2.5 py-1 rounded-full font-medium">
                  <AlertTriangle size={10} />
                  遅延 {overdueCount}件
                </span>
              )}
              {dueSoonCount > 0 && (
                <span className="flex items-center gap-1 text-xs bg-amber-400/20 text-amber-100 border border-amber-400/20 px-2.5 py-1 rounded-full font-medium">
                  <Clock size={10} />
                  期限近い {dueSoonCount}件
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 今日の予定 */}
      <div className="col-span-2 p-4 rounded-2xl bg-[var(--surface-1)] border border-[var(--border)]">
        <div className="flex items-center gap-1.5 mb-3">
          <Calendar size={13} className="text-[var(--accent)]" />
          <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">今日の予定</span>
        </div>
        {upcomingEvents.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">予定はありません</p>
        ) : (
          <ul className="space-y-2">
            {upcomingEvents.map((e) => (
              <li key={e.id} className="flex items-center gap-2.5">
                <span className="text-[11px] font-mono font-semibold text-[var(--accent)] bg-[var(--accent-light)] px-1.5 py-0.5 rounded-md shrink-0">
                  {format(parseISO(e.start_at), 'HH:mm')}
                </span>
                <span className="text-sm text-[var(--text-primary)] truncate">{e.title}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
