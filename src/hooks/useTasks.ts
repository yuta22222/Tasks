'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { taskKeys, completionKeys } from '@/lib/query-keys'
import type { Task, TaskInsert, TaskWithCompletion } from '@/types/task'
import { toast } from 'sonner'

const TODAY = () => format(new Date(), 'yyyy-MM-dd')

export function useTasks() {
  const supabase = createClient()
  const qc = useQueryClient()

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: taskKeys.lists(),
    queryFn: async (): Promise<Task[]> => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('due_date', { ascending: true, nullsFirst: false })
      if (error) throw error
      return data as Task[]
    },
  })

  const { data: completions = [] } = useQuery({
    queryKey: completionKeys.date(TODAY()),
    queryFn: async (): Promise<string[]> => {
      const { data, error } = await supabase
        .from('task_completions')
        .select('task_id')
        .eq('completed_date', TODAY())
      if (error) throw error
      return (data as { task_id: string }[]).map((c) => c.task_id)
    },
  })

  const createTask = useMutation({
    mutationFn: async (input: Omit<TaskInsert, 'user_id'> & { user_id?: string }) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const { user_id: _uid, ...rest } = input
      const { data, error } = await supabase
        .from('tasks')
        .insert({ ...rest, user_id: user.id } as any)
        .select()
        .single()
      if (error) throw error
      return data as Task
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: taskKeys.all })
      toast.success('タスクを作成しました')
    },
    onError: () => toast.error('タスクの作成に失敗しました'),
  })

  const updateTask = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Task> & { id: string }) => {
      const { error } = await supabase
        .from('tasks')
        .update(updates as any)
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: taskKeys.all }),
    onError: () => toast.error('タスクの更新に失敗しました'),
  })

  const deleteTask = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('tasks').delete().eq('id', id)
      if (error) throw error
    },
    onMutate: async (id: string) => {
      await qc.cancelQueries({ queryKey: taskKeys.all })
      const prev = qc.getQueryData<Task[]>(taskKeys.lists())
      qc.setQueryData<Task[]>(taskKeys.lists(), (old) => old?.filter(t => t.id !== id) ?? [])
      return { prev }
    },
    onError: (_, __, ctx) => {
      if (ctx?.prev) qc.setQueryData(taskKeys.lists(), ctx.prev)
      toast.error('タスクの削除に失敗しました')
    },
    onSettled: () => qc.invalidateQueries({ queryKey: taskKeys.all }),
  })

  const toggleComplete = useMutation({
    mutationFn: async ({ task, isCompleted }: { task: Task; isCompleted: boolean }) => {
      const today = TODAY()
      if (task.recurrence_type !== 'none') {
        if (isCompleted) {
          const { error } = await supabase
            .from('task_completions')
            .delete()
            .eq('task_id', task.id)
            .eq('completed_date', today)
          if (error) throw error
        } else {
          // user_id は DB の DEFAULT auth.uid() が自動セット
          const { error } = await supabase
            .from('task_completions')
            .insert({ task_id: task.id, completed_date: today } as any)
          if (error) throw error
        }
      } else {
        const { error } = await supabase
          .from('tasks')
          .update({ completed_at: isCompleted ? null : new Date().toISOString() } as any)
          .eq('id', task.id)
        if (error) throw error
      }
    },
    // 楽観的更新: UIを即時反映
    onMutate: async ({ task, isCompleted }) => {
      await qc.cancelQueries({ queryKey: taskKeys.all })
      await qc.cancelQueries({ queryKey: completionKeys.all })
      const prevTasks       = qc.getQueryData<Task[]>(taskKeys.lists())
      const prevCompletions = qc.getQueryData<string[]>(completionKeys.date(TODAY()))
      qc.setQueryData<Task[]>(taskKeys.lists(), (old) =>
        old?.map(t => t.id === task.id
          ? { ...t, completed_at: isCompleted ? null : new Date().toISOString() }
          : t
        ) ?? []
      )
      qc.setQueryData<string[]>(completionKeys.date(TODAY()), (old) => {
        if (isCompleted) return (old ?? []).filter(id => id !== task.id)
        return [...(old ?? []), task.id]
      })
      return { prevTasks, prevCompletions }
    },
    onError: (_, __, ctx) => {
      if (ctx?.prevTasks)       qc.setQueryData(taskKeys.lists(), ctx.prevTasks)
      if (ctx?.prevCompletions) qc.setQueryData(completionKeys.date(TODAY()), ctx.prevCompletions)
      toast.error('更新に失敗しました')
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: taskKeys.all })
      qc.invalidateQueries({ queryKey: completionKeys.all })
    },
  })

  const tasksWithCompletion: TaskWithCompletion[] = tasks.map((t) => ({
    ...t,
    isCompletedToday: t.recurrence_type !== 'none'
      ? completions.includes(t.id)
      : !!t.completed_at,
  }))

  return { tasks: tasksWithCompletion, isLoading, createTask, updateTask, deleteTask, toggleComplete }
}
