'use client'
import { X } from 'lucide-react'
import { useOffDaysStore } from '@/stores/offDaysStore'

const WEEKDAYS = [
  { label: '月', day: 1 },
  { label: '火', day: 2 },
  { label: '水', day: 3 },
  { label: '木', day: 4 },
  { label: '金', day: 5 },
  { label: '土', day: 6 },
  { label: '日', day: 0 },
]

type Props = { onClose: () => void }

export function OffDaysSettings({ onClose }: Props) {
  const { offWeekdays, offDates, toggleWeekday, toggleDate } = useOffDaysStore()

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-sm rounded-2xl p-5 space-y-5"
        style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-elevated)' }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-bold text-[var(--text-primary)]" style={{ letterSpacing: '-0.02em' }}>
            オフ日の設定
          </h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg" style={{ color: 'var(--muted)' }}>
            <X size={15} />
          </button>
        </div>

        {/* 曜日設定 */}
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
            毎週オフの曜日
          </p>
          <div className="flex gap-2">
            {WEEKDAYS.map(({ label, day }) => {
              const active = offWeekdays.includes(day)
              return (
                <button
                  key={day}
                  onClick={() => toggleWeekday(day)}
                  className="flex-1 h-10 rounded-xl text-sm font-bold transition-all duration-150"
                  style={{
                    background: active ? 'rgba(16,185,129,0.15)' : 'var(--surface-2)',
                    color: active ? 'var(--accent)' : 'var(--text-secondary)',
                    border: active ? '1px solid rgba(16,185,129,0.3)' : '1px solid var(--border)',
                  }}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>

        {/* 個別オフ日リスト（カレンダーでタップして追加） */}
        {offDates.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
              個別オフ日（タップで解除）
            </p>
            <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
              {[...offDates].sort().map((date) => (
                <button
                  key={date}
                  onClick={() => toggleDate(date)}
                  className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg transition-colors"
                  style={{
                    background: 'rgba(16,185,129,0.1)',
                    color: 'var(--accent)',
                    border: '1px solid rgba(16,185,129,0.2)',
                  }}
                >
                  {date} <X size={10} />
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
          style={{ background: 'var(--gradient-primary)', boxShadow: 'var(--shadow-accent)' }}
        >
          完了
        </button>
      </div>
    </div>
  )
}
