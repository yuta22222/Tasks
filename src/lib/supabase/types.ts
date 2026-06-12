export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly'

export type TaskRow = {
  id: string
  user_id: string
  title: string
  due_date: string | null
  category: string | null
  tags: string[] | null
  memo: string | null
  completed_at: string | null
  recurrence_type: RecurrenceType
  recurrence_day_of_week: number | null
  recurrence_day_of_month: number | null
  recurrence_end_date: string | null
  created_at: string
}

export type TaskCompletionRow = {
  id: string
  task_id: string
  completed_date: string
}

export type EventRow = {
  id: string
  user_id: string
  title: string
  start_at: string
  end_at: string
  memo: string | null
  created_at: string
}

export type Database = {
  public: {
    Tables: {
      tasks: {
        Row: TaskRow
        Insert: Omit<TaskRow, 'id' | 'created_at'>
        Update: Partial<Omit<TaskRow, 'id' | 'created_at'>>
      }
      task_completions: {
        Row: TaskCompletionRow
        Insert: Omit<TaskCompletionRow, 'id'>
        Update: never
      }
      events: {
        Row: EventRow
        Insert: Omit<EventRow, 'id' | 'created_at'>
        Update: Partial<Omit<EventRow, 'id' | 'created_at'>>
      }
    }
  }
}
