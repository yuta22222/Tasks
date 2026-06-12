'use client'
import { useTasks } from '@/hooks/useTasks'
import { TaskCard } from '@/components/tasks/TaskCard'
import { EmptyState } from '@/components/common/EmptyState'
import { SkeletonCard } from '@/components/common/SkeletonCard'
import { useUIStore } from '@/stores/uiStore'
import { toast } from 'sonner'
import Link from 'next/link'

export function UpcomingTasks() {
  const { tasks, isLoading, toggleComplete, deleteTask } = useTasks()
  const { openTaskModal } = useUIStore()

  const todayTasks = tasks.filter((t) => !t.isCompletedToday).slice(0, 5)
  const hasMore = tasks.filter((t) => !t.isCompletedToday).length > 5

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">タスク</h2>
        {hasMore && (
          <Link href="/tasks" className="text-sm text-[var(--accent)] hover:underline">
            すべて見る
          </Link>
        )}
      </div>

      {todayTasks.length === 0 ? (
        <EmptyState
          title="タスクがありません"
          description="新しいタスクを追加しましょう"
          onAction={() => openTaskModal()}
        />
      ) : (
        <div className="space-y-2">
          {todayTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggle={() => {
                toggleComplete.mutate({ task, isCompleted: task.isCompletedToday })
                toast.success('完了しました', {
                  action: {
                    label: '元に戻す',
                    onClick: () => toggleComplete.mutate({ task, isCompleted: true }),
                  },
                })
              }}
              onEdit={() => openTaskModal(task.id)}
              onDelete={() => deleteTask.mutate(task.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
