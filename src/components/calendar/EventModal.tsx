'use client'
import { useEffect, useRef, useState } from 'react'
import { X, Calendar, AlignLeft, Trash2, CheckSquare, Search, ChevronRight } from 'lucide-react'
import type { CalendarEvent } from '@/types/event'
import type { TaskWithCompletion } from '@/types/task'

export type EventFormData = {
  title: string
  allDay: boolean
  startDate: string   // YYYY-MM-DD
  startTime: string   // HH:MM
  endDate: string
  endTime: string
  memo: string
  task_id?: string    // タスクから作成した場合に紐付け
}

function addOneDay(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0, 10)
}

type Mode = 'event' | 'from-task'
type TaskStep = 'select' | 'form'

type Props = {
  initialData: EventFormData
  editTarget?: CalendarEvent
  tasks?: TaskWithCompletion[]
  onSave: (data: EventFormData) => void
  onDelete?: () => void
  onClose: () => void
  loading?: boolean
}

export function EventModal({ initialData, editTarget, tasks = [], onSave, onDelete, onClose, loading }: Props) {
  const [mode, setMode] = useState<Mode>('event')
  const [taskStep, setTaskStep] = useState<TaskStep>('select')
  const [taskSearch, setTaskSearch] = useState('')
  const [form, setForm] = useState<EventFormData>(initialData)
  const titleRef = useRef<HTMLInputElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const isEdit = !!editTarget

  useEffect(() => {
    titleRef.current?.focus()
    titleRef.current?.select()
  }, [])

  useEffect(() => {
    if (mode === 'from-task' && taskStep === 'select') {
      setTimeout(() => searchRef.current?.focus(), 50)
    }
    if (mode === 'event') {
      setTimeout(() => titleRef.current?.focus(), 50)
    }
  }, [mode, taskStep])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const set = (key: keyof EventFormData, value: string | boolean) =>
    setForm(f => {
      const next = { ...f, [key]: value }
      // 開始時間変更時、終了時間を1時間後に自動設定
      if (key === 'startTime' && typeof value === 'string') {
        const [h, m] = value.split(':').map(Number)
        const endH = (h + 1) % 24
        const endDay = h + 1 >= 24 ? addOneDay(f.startDate) : f.endDate
        next.endTime = `${String(endH).padStart(2, '0')}:${String(m).padStart(2, '0')}`
        next.endDate = endDay
      }
      // 開始日変更時、終了日も同じ日に合わせる
      if (key === 'startDate' && typeof value === 'string') {
        next.endDate = value
      }
      return next
    })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) return
    onSave(form)
  }

  // タスク選択 → フォームに自動入力
  const handleSelectTask = (task: TaskWithCompletion) => {
    const date = task.due_date ?? initialData.startDate
    setForm({
      title: task.title,
      allDay: false,
      startDate: date,
      startTime: '09:00',
      endDate: date,
      endTime: '10:00',
      memo: task.category ? `カテゴリ: ${task.category}` : '',
      task_id: task.id,
    })
    setTaskStep('form')
  }

  const pendingTasks = tasks.filter(t => !t.isCompletedToday)
  const filteredTasks = taskSearch.trim()
    ? pendingTasks.filter(t => t.title.toLowerCase().includes(taskSearch.toLowerCase()))
    : pendingTasks

  const modeTitle = isEdit ? '予定を編集' : mode === 'event' ? '予定を作成' : 'タスクから予定を作成'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div className="relative w-full max-w-md bg-[var(--surface-1)] border border-[var(--border)] rounded-2xl shadow-2xl shadow-black/60 animate-in fade-in-0 zoom-in-95 duration-150">

        {/* ヘッダー */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-[var(--border)]">
          {!isEdit ? (
            <div className="flex items-center gap-1 bg-[var(--surface-2)] rounded-xl p-1">
              <button
                type="button"
                onClick={() => { setMode('event') }}
                className={[
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150',
                  mode === 'event'
                    ? 'bg-[var(--accent)] text-white shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
                ].join(' ')}
              >
                <Calendar size={13} />
                新規予定
              </button>
              <button
                type="button"
                onClick={() => { setMode('from-task'); setTaskStep('select') }}
                className={[
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150',
                  mode === 'from-task'
                    ? 'bg-[var(--accent)] text-white shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
                ].join(' ')}
              >
                <CheckSquare size={13} />
                タスクから
              </button>
            </div>
          ) : (
            <h2 className="text-[15px] font-semibold text-[var(--text-primary)] tracking-tight">
              {modeTitle}
            </h2>
          )}
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* タスク選択ステップ */}
        {mode === 'from-task' && taskStep === 'select' && (
          <div className="p-5 space-y-3">
            <p className="text-sm text-[var(--text-secondary)]">予定に追加するタスクを選択</p>
            {/* 検索 */}
            <div className="flex items-center gap-2 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-3 py-2">
              <Search size={14} className="text-[var(--muted)] shrink-0" />
              <input
                ref={searchRef}
                type="text"
                placeholder="タスクを検索..."
                value={taskSearch}
                onChange={e => setTaskSearch(e.target.value)}
                className="flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--muted)] focus:outline-none"
              />
            </div>
            {/* タスク一覧 */}
            <div className="max-h-64 overflow-y-auto space-y-1">
              {filteredTasks.length === 0 ? (
                <p className="text-sm text-[var(--muted)] text-center py-6">
                  {taskSearch ? '一致するタスクがありません' : '未完了のタスクがありません'}
                </p>
              ) : (
                filteredTasks.map(task => (
                  <button
                    key={task.id}
                    type="button"
                    onClick={() => handleSelectTask(task)}
                    className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-[var(--surface-2)] transition-colors group"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[var(--text-primary)] truncate">{task.title}</p>
                      {(task.due_date || task.category) && (
                        <p className="text-xs text-[var(--muted)] mt-0.5">
                          {task.due_date && <span>{task.due_date}</span>}
                          {task.due_date && task.category && <span className="mx-1">·</span>}
                          {task.category && <span>{task.category}</span>}
                        </p>
                      )}
                    </div>
                    <ChevronRight size={14} className="shrink-0 text-[var(--muted)] group-hover:text-[var(--accent)] transition-colors" />
                  </button>
                ))
              )}
            </div>
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] rounded-xl transition-all"
              >
                キャンセル
              </button>
            </div>
          </div>
        )}

        {/* 予定フォーム（新規 or タスク選択後） */}
        {(mode === 'event' || (mode === 'from-task' && taskStep === 'form')) && (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* 戻るボタン（タスク選択後のみ） */}
            {mode === 'from-task' && taskStep === 'form' && (
              <button
                type="button"
                onClick={() => setTaskStep('select')}
                className="text-xs text-[var(--accent)] hover:underline"
              >
                ← タスクを選び直す
              </button>
            )}

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
            <div className="flex items-start gap-3">
              <Calendar size={16} className="mt-2.5 shrink-0 text-[var(--muted)]" />
              <div className="flex-1 space-y-2">
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
        )}
      </div>
    </div>
  )
}
