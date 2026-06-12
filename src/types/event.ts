import type { EventRow } from '@/lib/supabase/types'

export type CalendarEvent = EventRow
export type CalendarEventInsert = Omit<EventRow, 'id' | 'created_at'>
export type CalendarEventUpdate = Partial<Omit<EventRow, 'id' | 'created_at'>>
