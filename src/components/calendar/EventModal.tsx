'use client'
import { useEffect, useRef, useState } from 'react'
import { X, Calendar, Clock, AlignLeft, Trash2 } from 'lucide-react'
import type { CalendarEvent } from '@/types/event'

export type EventFormData = {
  title: string
  allDay: boolean
  startDate: string   // YYYY-MM-DD
  startTime: string   // HH:MM
  endDate: string
  endTime: string
  memo: string
}

type Props = {
  initialData: EventFormData
  editTarget?: CalendarEvent   // 編集時は既存イベントを渡す
  onSave: (data: EventFormData) => void
  onDelete?: () => void
  onClose: () => void
  loading?: boolean
}

export function EventModal({ initialData, editTarget, onSave, onDelete, onClose, loading }: Props) {
  const [form, setForm] = useState<EventFormData>(initialData)
  const titleRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    titleRef.current?.focus()
    titleRef.current?.select()
  }, [])

  // Escキーで閉じる
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const set = (key: keyof EventFormData, value: string | boolean) =>
    setForm(f => ({ ...f, [key]: value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) return
    onSave(form)
  }

  const isEdit = !!editTarget

  return (
    /* オーバーレイ */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* 背景blur */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* モーダル本体 */}
      <div className="relative w-full max-w-md bg-[var(--surface-1)] border border-[var(--border)] rounded-2xl shadow-2xl shadow-black/60 animate-in fade-in-0 zoom-in-95 duration-150">

        {/* ヘッダー */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[var(--border)]">
          <h2 className="text-[15px] font-semibold text-[var(--text-primary)] tracking-tight">
            {isEdit ? '予定を編集' : '予定を作成'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-all"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">

          {/* タイトル */}
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 mt-2.5 shrink-0 rounded bg-[var(--accent)] opacity-80" />
            <input
              ref={titleRef}
              type="text"
              placeholder="タイトルを追加"
              value={form.title}
              onChange={e => set('title', e.target.value)}
              className="flex-1 bg-transparent text-[var(--text-primary)] text-[15px] font-medium placeholder:text-[var(--muted)] focus:outline-none border-b border-[var(--border)] pb-2 focus:border-[var(--accent)] transition-colors"
              required
            />
          </div>

          {/* 終日トグル */}
          <div className="flex items-center gap-3 pl-8">
            <button
              type="button"
              role="switch"
              aria-checked={form.allDay}
              onClick={() => set('allDay', !form.allDay)}
              className={[
                'relative w-9 h-5 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40',
                form.allDay ? 'bg-[var(--accent)]' : 'bg-[var(--surface-3)]',
              ].join(' ')}
            >
              <span className={[
                'absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200',
                form.allDay ? 'translate-x-4' : 'translate-x-0.5',
              ].join(' ')} />
            </button>
            <span className="text-sm text-[var(--text-secondary)]">終日</span>
          </div>

          {/* 日付・時刻 */}
          <div className="flex items-start gap-3 pl-0">
            <Calendar size={16} className="mt-2.5 shrink-0 text-[var(--muted)]" />
            <div className="flex-1 space-y-2">
              {/* 開始 */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--muted)] w-6">開始</span>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={e => set('startDate', e.target.value)}
                  className="bg-[var(--surface-2)] text-[var(--text-primary)] text-sm rounded-lg px-3 py-1.5 border border-[var(--border)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                />
                {!form.allDay && (
                  <input
                    type="time"
                    value={form.startTime}
                    onChange={e => set('startTime', e.target.value)}
                    className="bg-[var(--surface-2)] text-[var(--text-primary)] text-sm rounded-lg px-3 py-1.5 border border-[var(--border)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                  />
                )}
              </div>
              {/* 終了 */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--muted)] w-6">終了</span>
                <input
                  type="date"
                  value={form.endDate}
                  onChange={e => set('endDate', e.target.value)}
                  className="bg-[var(--surface-2)] text-[var(--text-primary)] text-sm rounded-lg px-3 py-1.5 border border-[var(--border)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                />
                {!form.allDay && (
                  <input
                    type="time"
                    value={form.endTime}
                    onChange={e => set('endTime', e.target.value)}
                    className="bg-[var(--surface-2)] text-[var(--text-primary)] text-sm rounded-lg px-3 py-1.5 border border-[var(--border)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                  />
                )}
              </div>
            </div>
          </div>

          {/* メモ */}
          <div className="flex items-start gap-3">
            <AlignLeft size={16} className="mt-2.5 shrink-0 text-[var(--muted)]" />
            <textarea
              placeholder="メモを追加"
              value={form.memo}
              onChange={e => set('memo', e.target.value)}
              rows={2}
              className="flex-1 bg-[var(--surface-2)] text-[var(--text-primary)] text-sm placeholder:text-[var(--muted)] rounded-xl px-3 py-2.5 border border-[var(--border)] focus:outline-none focus:border-[var(--accent)] transition-colors resize-none"
            />
          </div>

          {/* フッター */}
          <div className="flex items-center justify-between pt-1">
            {/* 削除ボタン（編集時のみ） */}
            {isEdit && onDelete ? (
              <button
                type="button"
                onClick={onDelete}
                className="flex items-center gap-1.5 text-sm text-[var(--danger)] hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Trash2 size={14} />
                削除
              </button>
            ) : (
              <span />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] rounded-xl transition-all"
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={!form.title.trim() || loading}
                className="px-5 py-2 text-sm font-semibold text-white bg-[var(--accent)] hover:bg-[var(--accent-hover)] rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_2px_8px_rgba(129,140,248,0.35)]"
              >
                {loading ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
