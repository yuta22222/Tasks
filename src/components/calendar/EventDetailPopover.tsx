'use client'
import { useEffect, useRef } from 'react'
import { X, Calendar, AlignLeft, Pencil, Trash2 } from 'lucide-react'
import type { CalendarEvent } from '@/types/event'

type Props = {
  event: CalendarEvent
  anchorX: number
  anchorY: number
  onEdit: () => void
  onDelete: () => void
  onClose: () => void
}

function formatRange(start: string, end: string): string {
  const s = new Date(start)
  const e = new Date(end)
  const dateStr = s.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', weekday: 'short' })
  const startTime = s.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
  const endTime   = e.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
  // 終日判定（00:00:00 & 23:59 or +24h）
  if (s.getHours() === 0 && s.getMinutes() === 0 && e.getHours() === 23 && e.getMinutes() >= 59) {
    return `${dateStr}`
  }
  return `${dateStr}  ${startTime} – ${endTime}`
}

export function EventDetailPopover({ event, anchorX, anchorY, onEdit, onDelete, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    const onPointer = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    window.addEventListener('keydown', onKey)
    const t = setTimeout(() => window.addEventListener('pointerdown', onPointer), 100)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('pointerdown', onPointer)
      clearTimeout(t)
    }
  }, [onClose])

  const popW = 300
  const popH = 160
  const margin = 12
  let left = anchorX + 12
  let top  = anchorY - 20
  if (typeof window !== 'undefined') {
    if (left + popW > window.innerWidth - margin)  left = anchorX - popW - 12
    if (top  + popH > window.innerHeight - margin) top  = window.innerHeight - popH - margin
    if (top < margin) top = margin
    if (left < margin) left = margin
  }

  return (
    <div
      ref={ref}
      style={{ left, top, width: popW }}
      className="fixed z-50 bg-[var(--surface-2)] border border-[var(--border)] rounded-2xl shadow-2xl shadow-black/60 animate-in fade-in-0 zoom-in-95 duration-150 overflow-hidden"
    >
      {/* ヘッダー */}
      <div className="flex items-center justify-end gap-1 px-3 pt-3 pb-2 border-b border-[var(--border)]">
        <button
          onClick={onEdit}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-all"
          title="編集"
        >
          <Pencil size={13} />
        </button>
        <button
          onClick={onDelete}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--muted)] hover:text-[var(--danger)] hover:bg-red-500/10 transition-all"
          title="削除"
        >
          <Trash2 size={13} />
        </button>
        <button
          onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-all"
        >
          <X size={13} />
        </button>
      </div>

      <div className="px-4 py-3 space-y-2.5">
        {/* タイトル */}
        <div className="flex items-start gap-2.5">
          <div className="w-3 h-3 mt-0.5 rounded-sm bg-[var(--accent)] shrink-0" />
          <p className="text-[14px] font-semibold text-[var(--text-primary)] leading-snug">{event.title}</p>
        </div>

        {/* 日時 */}
        <div className="flex items-center gap-2.5 text-sm text-[var(--text-secondary)] pl-0.5">
          <Calendar size={13} className="shrink-0 text-[var(--muted)]" />
          <span>{formatRange(event.start_at, event.end_at)}</span>
        </div>

        {/* メモ */}
        {event.memo && (
          <div className="flex items-start gap-2.5 text-sm text-[var(--text-secondary)] pl-0.5">
            <AlignLeft size={13} className="shrink-0 text-[var(--muted)] mt-0.5" />
            <span className="line-clamp-2">{event.memo}</span>
          </div>
        )}
      </div>
    </div>
  )
}
