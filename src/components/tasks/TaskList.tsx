'use client'
import { isPast, isToday, addDays } from 'date-fns'
import { useTasks } from '@/hooks/useTasks'
import { TaskCard } from './TaskCard'
import { SkeletonCard } from '@/components/common/SkeletonCard'
import { EmptyState } from '@/components/common/EmptyState'
import { useUIStore } from '@/stores/uiStore'
import { toast } from 'sonner'
import { Plus, AlertTriangle, Clock4, CalendarDays, Calendar, CheckCheck, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useState, useMemo } from 'react'
import type { TaskWithCompletion } from '@/types/task'

type Section = {
  id: string
  label: string
  icon: React.ReactNode
  dotColor: string
  textColor: string
  countStyle: string
  filter: (t: TaskWithCompletion) => boolean
}

const sections: Section[] = [
  {
    id: 'overdue',
    label: '遅延中',
    icon: <AlertTriangle size={11} />,
    dotColor: '#F0516B',
    textColor: 'text-[#F0516B]',
    countStyle: 'bg-[#F0516B]/12 text-[#F0516B]',
    filter: (t) => {
      if (t.isCompletedToday || !t.due_date) return false
      const d = new Date(t.due_date + 'T00:00:00')
      return isPast(d) && !isToday(d)
    },
  },
  {
    id: 'today',
    label: '今日まで',
    icon: <Clock4 size={11} />,
    dotColor: '#F5C842',
    textColor: 'text-[#F5C842]',
    countStyle: 'bg-[#F5C842]/12 text-[#F5C842]',
    filter: (t) => {
      if (t.isCompletedToday || !t.due_date) return false
      return isToday(new Date(t.due_date + 'T00:00:00'))
    },
  },
  {
    id: 'soon',
    label: '3日以内',
    icon: <CalendarDays size={11} />,
    dotColor: '#FB923C',
    textColor: 'text-orange-400',
    countStyle: 'bg-orange-500/10 text-orange-400',
    filter: (t) => {
      if (t.isCompletedToday || !t.due_date) return false
      const d = new Date(t.due_date + 'T00:00:00')
      return !isPast(d) && !isToday(d) && d <= addDays(new Date(), 3)
    },
  },
  {
    id: 'normal',
    label: '予定',
    icon: <Calendar size={11} />,
    dotColor: 'var(--accent)',
    textColor: 'text-[var(--text-secondary)]',
    countStyle: 'bg-[var(--accent-light)] text-[var(--accent)]',
    filter: (t) => {
      if (t.isCompletedToday) return false
      if (!t.due_date) return true
      const d = new Date(t.due_date + 'T00:00:00')
      return !isPast(d) && !isToday(d) && d > addDays(new Date(), 3)
    },
  },
]

export function TaskList() {
  const { tasks, isLoading, toggleComplete, deleteTask } = useTasks()
  const { openTaskModal } = useUIStore()
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [showCompleted, setShowCompleted] = useState(false)

  // ユニークカテゴリを抽出
  const categories = useMemo(() => {
    const cats = tasks
      .map(t => t.category)
      .filter((c): c is string => !!c)
    return [...new Set(cats)].sort()
  }, [tasks])

  // カテゴリフィルタ適用
  const filtered = useMemo(() => {
    if (!activeCategory) return tasks
    return tasks.filter(t => t.category === activeCategory)
  }, [tasks, activeCategory])

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    )
  }

  if (tasks.length === 0) {
    return <EmptyState onAction={() => openTaskModal()} />
  }

  const pending   = filtered.filter(t => !t.isCompletedToday)
  const completed = filtered.filter(t => t.isCompletedToday)

  const makeHandlers = (task: TaskWithCompletion) => ({
    onToggle: () => {
      const wasCompleted = task.isCompletedToday
      toggleComplete.mutate({ task, isCompleted: wasCompleted })
      if (!wasCompleted) {
        toast.success('完了しました 🎉', {
          duration: 5000,
          action: {
            label: '元に戻す',
            onClick: () => toggleComplete.mutate({ task, isCompleted: true }),
          },
        })
      }
    },
    onEdit: () => openTaskModal(task.id),
    onDelete: () => {
      deleteTask.mutate(task.id)
      toast('削除しました', {
        duration: 5000,
        action: {
          label: '元に戻す',
          onClick: () => {
            toast.info('削除のUndoには対応していません', { duration: 3000 })
          },
        },
      })
    },
  })

  return (
    <div className="space-y-5">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--text-secondary)]">
          <span className="font-semibold text-[var(--text-primary)]">{pending.length}</span> 件のタスク
        </p>
        <Button
          size="sm"
          onClick={() => openTaskModal()}
          className="text-white h-8 gap-1.5 text-xs font-medium rounded-xl px-3 shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/35 transition-all duration-200"
          style={{ background: 'var(--gradient-primary)' }}
          aria-label="新しいタスクを追加"
        >
          <Plus size={13} strokeWidth={2.5} aria-hidden="true" />
          追加
        </Button>
      </div>

      {/* カテゴリフィルタバー */}
      {categories.length > 0 && (
        <div
          role="group"
          aria-label="カテゴリフィルタ"
          className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide"
        >
          <Filter size={13} className="shrink-0 text-[var(--muted)]" aria-hidden="true" />
          <button
            onClick={() => setActiveCategory(null)}
            className={cn(
              'shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all duration-150',
              activeCategory === null
                ? 'bg-[var(--accent)] text-white border-transparent shadow-[0_1px_4px_rgba(155,168,251,0.35)]'
                : 'text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--accent)]',
            )}
            aria-pressed={activeCategory === null}
          >
            すべて
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(c => c === cat ? null : cat)}
              className={cn(
                'shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all duration-150',
                activeCategory === cat
                  ? 'bg-[var(--accent)] text-white border-transparent shadow-[0_1px_4px_rgba(155,168,251,0.35)]'
                  : 'text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--accent)]',
              )}
              aria-pressed={activeCategory === cat}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* タスクが0件（フィルタ後） */}
      {pending.length === 0 && completed.length === 0 && (
        <EmptyState
          title="該当するタスクがありません"
          description={activeCategory ? `「${activeCategory}」のタスクはありません` : 'フィルタを変更してみてください'}
          actionLabel="フィルタをリセット"
          onAction={() => setActiveCategory(null)}
        />
      )}

      {/* セクション別グループ */}
      {sections.map((section) => {
        const items = filtered.filter(section.filter)
        if (items.length === 0) return null
        return (
          <section key={section.id} aria-label={section.label}>
            <div
              className="flex items-center gap-2.5 pl-3 py-1 mb-2"
              style={{ borderLeft: `3px solid ${section.dotColor}` }}
            >
              <span className={cn('flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide', section.textColor)}>
                <span aria-hidden="true">{section.icon}</span>
                {section.label}
              </span>
              <span className={cn('text-[11px] font-bold px-2 py-0.5 rounded-full', section.countStyle)}>
                {items.length}
              </span>
            </div>
            <div className="space-y-2">
              {items.map((task) => (
                <TaskCard key={task.id} task={task} {...makeHandlers(task)} />
              ))}
            </div>
          </section>
        )
      })}

      {/* 完了済みトグル */}
      {completed.length > 0 && (
        <section aria-label="完了済みタスク">
          <button
            onClick={() => setShowCompleted(v => !v)}
            className="flex items-center gap-2.5 pl-3 py-1 mb-2 w-full text-left"
            style={{ borderLeft: '3px solid #34D399' }}
            aria-expanded={showCompleted}
          >
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-emerald-400">
              <CheckCheck size={12} aria-hidden="true" />
              完了済み
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/12 text-emerald-400">
              {completed.length}
            </span>
            <span className="ml-auto text-[10px] text-[var(--muted)]">
              {showCompleted ? '▲ 非表示' : '▼ 表示'}
            </span>
          </button>
          {showCompleted && (
            <div className="space-y-2">
              {completed.map((task) => (
                <TaskCard key={task.id} task={task} {...makeHandlers(task)} />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  )
}
