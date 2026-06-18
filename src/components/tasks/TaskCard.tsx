'use client'
import { format, isPast, isToday, addDays, differenceInDays } from 'date-fns'
import { ja } from 'date-fns/locale'
import { RefreshCw, Calendar, Pencil, Trash2, AlertCircle, Clock, Check, X } from 'lucide-react'
import { useSwipeable } from 'react-swipeable'
import { cn } from '@/lib/utils'
import { useState, useRef } from 'react'
import type { TaskWithCompletion } from '@/types/task'

export type UrgencyLevel = 'overdue' | 'today' | 'soon' | 'normal' | 'no-date' | 'completed'

export function getUrgency(task: TaskWithCompletion): UrgencyLevel {
  if (task.isCompletedToday) return 'completed'
  if (!task.due_date) return 'no-date'
  const d = new Date(task.due_date + 'T00:00:00')
  if (isPast(d) && !isToday(d)) return 'overdue'
  if (isToday(d)) return 'today'
  if (d <= addDays(new Date(), 3)) return 'soon'
  return 'normal'
}

const STYLE = {
  overdue: {
    card:      'bg-[#180C10] border border-red-500/25 hover:border-red-400/40',
    dotFilled: 'bg-red-400',
    dotEmpty:  'border-red-400/60 hover:border-red-400',
    glow:      true,
    badge:     'bg-red-500/12 text-red-300 border border-red-500/25',
    metaColor: 'text-red-400',
    icon:      <AlertCircle size={11} />,
  },
  today: {
    card:      'bg-[#151108] border border-amber-500/25 hover:border-amber-400/40',
    dotFilled: 'bg-amber-400',
    dotEmpty:  'border-amber-400/60 hover:border-amber-400',
    glow:      true,
    badge:     'bg-amber-500/12 text-amber-300 border border-amber-500/25',
    metaColor: 'text-amber-400',
    icon:      <Clock size={11} />,
  },
  soon: {
    card:      'bg-[var(--surface-1)] border border-[var(--border)] hover:border-orange-400/30',
    dotFilled: 'bg-orange-400',
    dotEmpty:  'border-[var(--border)] hover:border-orange-400/70',
    glow:      false,
    badge:     'bg-orange-500/10 text-orange-300 border border-orange-400/20',
    metaColor: 'text-orange-400',
    icon:      <Calendar size={11} />,
  },
  normal: {
    card:      'bg-[var(--surface-1)] border border-[var(--border)] hover:border-emerald-500/25',
    dotFilled: 'bg-emerald-500',
    dotEmpty:  'border-[var(--border)] hover:border-emerald-500/60',
    glow:      false,
    badge:     '',
    metaColor: 'text-[var(--text-secondary)]',
    icon:      <Calendar size={11} />,
  },
  'no-date': {
    card:      'bg-[var(--surface-1)] border border-[var(--border)] hover:border-emerald-500/20',
    dotFilled: 'bg-[var(--muted)]',
    dotEmpty:  'border-[var(--border)] hover:border-emerald-500/50',
    glow:      false,
    badge:     '',
    metaColor: 'text-[var(--text-secondary)]',
    icon:      null,
  },
  completed: {
    card:      'bg-[var(--surface-0)] border border-[var(--border-subtle)]',
    dotFilled: 'bg-emerald-500',
    dotEmpty:  'border-transparent',
    glow:      false,
    badge:     '',
    metaColor: 'text-[var(--muted)]',
    icon:      null,
  },
} as const

const recurrenceLabel: Record<string, string> = { daily: '毎日', weekly: '毎週', monthly: '毎月' }

const SWIPE_THRESHOLD = 72

type Props = {
  task: TaskWithCompletion
  onToggle: () => void
  onEdit: () => void
  onDelete: () => void
}

export function TaskCard({ task, onToggle, onEdit, onDelete }: Props) {
  const [actionsVisible, setActionsVisible] = useState(false)
  const [swipeDir, setSwipeDir] = useState<'complete' | 'delete' | null>(null)
  const [swipeDelta, setSwipeDelta] = useState(0)
  const fired = useRef(false)

  const urgency = getUrgency(task)
  const s = STYLE[urgency]

  const dueDate = task.due_date ? new Date(task.due_date + 'T00:00:00') : null
  const daysOverdue = dueDate && isPast(dueDate) && !isToday(dueDate)
    ? differenceInDays(new Date(), dueDate) : 0
  const daysLeft = dueDate && !isPast(dueDate) && !isToday(dueDate)
    ? differenceInDays(dueDate, new Date()) : 0

  const badgeText =
    urgency === 'overdue' ? `${daysOverdue}日超過` :
    urgency === 'today'   ? '今日まで' :
    urgency === 'soon'    ? `あと${daysLeft}日` : ''

  const swipeHandlers = useSwipeable({
    onSwiping: ({ deltaX }) => {
      fired.current = false
      const d = Math.abs(deltaX)
      setSwipeDir(deltaX > 0 ? 'complete' : 'delete')
      setSwipeDelta(Math.min(d, SWIPE_THRESHOLD + 24))
    },
    onSwipedRight: ({ deltaX }) => {
      setSwipeDelta(0); setSwipeDir(null)
      if (Math.abs(deltaX) >= SWIPE_THRESHOLD && !fired.current) {
        fired.current = true
        onToggle()
      }
    },
    onSwipedLeft: ({ deltaX }) => {
      setSwipeDelta(0); setSwipeDir(null)
      if (Math.abs(deltaX) >= SWIPE_THRESHOLD && !fired.current) {
        fired.current = true
        onDelete()
      }
    },
    onTouchEndOrOnMouseUp: () => { setSwipeDelta(0); setSwipeDir(null) },
    trackMouse: false,
    delta: 10,
    preventScrollOnSwipe: true,
  })

  const progress = Math.min(swipeDelta / SWIPE_THRESHOLD, 1)

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* スワイプ背景 */}
      {swipeDir === 'complete' && (
        <div
          className="swipe-action-bg bg-emerald-500/90 justify-start"
          style={{ opacity: progress }}
          aria-hidden="true"
        >
          <Check size={18} className="text-white" strokeWidth={2.5} />
          <span className="ml-2 text-sm font-bold text-white">完了</span>
        </div>
      )}
      {swipeDir === 'delete' && (
        <div
          className="swipe-action-bg bg-red-500/90 justify-end"
          style={{ opacity: progress }}
          aria-hidden="true"
        >
          <span className="mr-2 text-sm font-bold text-white">削除</span>
          <X size={18} className="text-white" strokeWidth={2.5} />
        </div>
      )}

      {/* カード本体 */}
      <div
        {...swipeHandlers}
        style={{
          transform: swipeDelta > 0
            ? `translateX(${swipeDir === 'complete' ? swipeDelta : -swipeDelta}px)`
            : undefined,
          transition: swipeDelta === 0 ? 'transform 0.2s ease' : undefined,
        }}
        className={cn(
          'group relative flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200',
          s.card,
          task.isCompletedToday && 'opacity-40',
        )}
        onContextMenu={(e) => { e.preventDefault(); setActionsVisible(v => !v) }}
      >
        {/* チェックボタン */}
        <button
          onClick={onToggle}
          className="relative shrink-0 flex items-center justify-center"
          style={{ minWidth: 44, minHeight: 44 }}
          aria-label={task.isCompletedToday ? '完了を取り消す' : '完了にする'}
          aria-pressed={task.isCompletedToday}
        >
          <span className={cn(
            'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-150',
            task.isCompletedToday ? `border-transparent ${s.dotFilled}` : s.dotEmpty,
          )}>
            {task.isCompletedToday && (
              <svg width="9" height="8" viewBox="0 0 9 8" fill="none" aria-hidden="true">
                <path d="M1.5 4L3.5 6L7.5 2" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </span>
          {s.glow && !task.isCompletedToday && (
            <span
              className={cn('absolute w-5 h-5 rounded-full opacity-30 animate-ping', s.dotFilled)}
              style={{ animationDuration: '2.2s' }}
              aria-hidden="true"
            />
          )}
        </button>

        {/* コンテンツ */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <p className={cn(
              'text-[15px] font-semibold leading-snug',
              task.isCompletedToday
                ? 'line-through text-[var(--text-secondary)]'
                : 'text-[var(--text-primary)]',
            )}>
              {task.title}
            </p>
            {badgeText && !task.isCompletedToday && (
              <span className={cn(
                'shrink-0 flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap',
                s.badge,
              )}>
                <span aria-hidden="true">{s.icon}</span>
                {badgeText}
              </span>
            )}
          </div>

          {(dueDate || task.recurrence_type !== 'none' || task.category) && (
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              {dueDate && urgency !== 'overdue' && urgency !== 'today' && (
                <span className={cn('flex items-center gap-1 text-xs font-medium', s.metaColor)}>
                  <Calendar size={11} aria-hidden="true" />
                  <time dateTime={task.due_date ?? undefined}>
                    {format(dueDate, 'M/d(E)', { locale: ja })}
                  </time>
                </span>
              )}
              {task.recurrence_type !== 'none' && (
                <span className="flex items-center gap-1 text-xs font-medium text-[var(--text-secondary)]">
                  <RefreshCw size={11} aria-hidden="true" />
                  {recurrenceLabel[task.recurrence_type]}
                </span>
              )}
              {task.category && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-lg" style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--accent)', border: '1px solid rgba(16,185,129,0.2)' }}>
                  {task.category}
                </span>
              )}
            </div>
          )}
        </div>

        {/* アクション */}
        <div className={cn(
          'flex items-center gap-1 shrink-0 transition-opacity duration-150',
          actionsVisible ? 'opacity-100' : 'opacity-0 group-hover:opacity-70',
        )}>
          <button
            onClick={onEdit}
            className="p-2 rounded-xl text-[var(--muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-all"
            aria-label={`${task.title}を編集`}
          >
            <Pencil size={14} aria-hidden="true" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 rounded-xl text-[var(--muted)] hover:text-red-400 hover:bg-red-500/10 transition-all"
            aria-label={`${task.title}を削除`}
          >
            <Trash2 size={14} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  )
}
