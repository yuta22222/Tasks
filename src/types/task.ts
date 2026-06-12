import type { TaskRow, RecurrenceType } from '@/lib/supabase/types'

export type Task = TaskRow
export type TaskInsert = Omit<TaskRow, 'id' | 'created_at'>
export type TaskUpdate = Partial<Omit<TaskRow, 'id' | 'created_at'>>

export type { RecurrenceType }

export type TaskWithCompletion = Task & {
  isCompletedToday: boolean
}
