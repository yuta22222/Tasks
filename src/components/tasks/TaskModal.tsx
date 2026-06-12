'use client'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { TaskForm } from './TaskForm'
import { useUIStore } from '@/stores/uiStore'
import { useTasks } from '@/hooks/useTasks'

export function TaskModal() {
  const { taskModalOpen, editingTaskId, closeTaskModal } = useUIStore()
  const { tasks, createTask, updateTask } = useTasks()

  const editingTask = editingTaskId ? tasks.find((t) => t.id === editingTaskId) : undefined

  const handleSubmit = async (values: {
    title: string
    due_date?: string
    category?: string
    memo?: string
    recurrence_type: 'none' | 'daily' | 'weekly' | 'monthly'
  }) => {
    if (editingTask) {
      await updateTask.mutateAsync({
        id: editingTask.id,
        title: values.title,
        due_date: values.due_date || null,
        category: values.category || null,
        memo: values.memo || null,
        recurrence_type: values.recurrence_type,
      })
    } else {
      // user_id は DB の DEFAULT auth.uid() に任せる（クライアントから送らない）
      await createTask.mutateAsync({
        title: values.title,
        due_date: values.due_date || null,
        category: values.category || null,
        tags: null,
        memo: values.memo || null,
        completed_at: null,
        recurrence_type: values.recurrence_type,
        recurrence_day_of_week: null,
        recurrence_day_of_month: null,
        recurrence_end_date: null,
      })
    }
    closeTaskModal()
  }

  return (
    <Dialog open={taskModalOpen} onOpenChange={(open) => !open && closeTaskModal()}>
      {/* Radix UI Dialog は role="dialog" aria-modal="true" フォーカストラップを自動提供 */}
      <DialogContent
        className="bg-[var(--surface-1)] border border-[var(--border)] max-w-lg w-full mx-4 sm:mx-auto rounded-2xl shadow-2xl shadow-black/50 animate-in fade-in-0 zoom-in-95 duration-200"
        aria-describedby="task-modal-desc"
      >
        <DialogHeader>
          <DialogTitle
            className="text-[var(--text-primary)] font-bold"
            style={{ letterSpacing: '-0.01em' }}
          >
            {editingTask ? 'タスクを編集' : '新しいタスク'}
          </DialogTitle>
          <p id="task-modal-desc" className="sr-only">
            {editingTask ? 'タスクの内容を編集します' : '新しいタスクを作成します'}
          </p>
        </DialogHeader>
        <TaskForm
          defaultValues={editingTask}
          onSubmit={handleSubmit}
          onCancel={closeTaskModal}
          isSubmitting={createTask.isPending || updateTask.isPending}
        />
      </DialogContent>
    </Dialog>
  )
}
