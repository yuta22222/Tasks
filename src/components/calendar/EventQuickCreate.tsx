'use client'
import { useEffect, useRef } from 'react'
import { X, Calendar } from 'lucide-react'

type Props = {
  title: string
  onTitleChange: (v: string) => void
  dateLabel: string       // 表示用 "6月12日 (木)  14:00 – 15:00"
  onSave: () => void
  onOpenFull: () => void  // 「詳細オプション」クリック
  onClose: () => void
  loading?: boolean
  anchorX: number         // クリック座標 (viewport px)
  anchorY: number
}

export function EventQuickCreate({
  title, onTitleChange, dateLabel,
  onSave, onOpenFull, onClose, loading,
  anchorX, anchorY,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Esc / 外クリックで閉じる
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    const onPointer = (e: PointerEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) onClose()
    }
    window.addEventListener('keydown', onKey)
    // 少し遅延してバインド（クリック直後の誤判定を防ぐ）
    const t = setTimeout(() => window.addEventListener('pointerdown', onPointer), 100)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('pointerdown', onPointer)
      clearTimeout(t)
    }
  }, [onClose])

  // ポップオーバーの位置を viewport に収める
  const popW = 320
  const popH = 180
  const margin = 12
  let left = anchorX + 12
  let top  = anchorY - 20
  if (typeof window !== 'undefined') {
    if (left + popW > window.innerWidth - margin)  left = anchorX - popW - 12
    if (top  + popH > window.innerHeight - margin) top  = window.innerHeight - popH - margin
    if (top < margin) top = margin
    if (left < margin) left = margin
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    onSave()
  }

  return (
    <div
      ref={popoverRef}
      style={{ left, top, width: popW }}
      className="fixed z-50 bg-[var(--surface-2)] border border-[var(--border)] rounded-2xl shadow-2xl shadow-black/60 animate-in fade-in-0 zoom-in-95 duration-150 overflow-hidden"
    >
      {/* ヘッダー */}
      <div className="flex items-center justify-end px-3 pt-3 pb-1">
        <button
          onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-all"
        >
          <X size={14} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="px-4 pb-4 space-y-3">
        {/* タイトル入力 */}
        <input
          ref={inputRef}
          type="text"
          placeholder="タイトルを追加"
          value={title}
          onChange={e => onTitleChange(e.target.value)}
          className="w-full bg-transparent text-[var(--text-primary)] text-[15px] font-medium placeholder:text-[var(--muted)] focus:outline-none border-b-2 border-[var(--border)] pb-1.5 focus:border-[var(--accent)] transition-colors"
        />

        {/* 日時 */}
        <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
          <Calendar size={13} className="shrink-0 text-[var(--muted)]" />
          <span>{dateLabel}</span>
        </div>

        {/* ボタン */}
        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={onOpenFull}
            className="text-sm text-[var(--accent)] hover:text-[var(--accent-hover)] hover:underline transition-colors px-1"
          >
            詳細オプション
          </button>
          <button
            type="submit"
            disabled={!title.trim() || loading}
            className="px-4 py-1.5 text-sm font-semibold text-white bg-[var(--accent)] hover:bg-[var(--accent-hover)] rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_2px_8px_rgba(129,140,248,0.3)]"
          >
            {loading ? '...' : '保存'}
          </button>
        </div>
      </form>
    </div>
  )
}
