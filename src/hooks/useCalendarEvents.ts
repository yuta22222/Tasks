'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { eventKeys } from '@/lib/query-keys'
import type { CalendarEvent, CalendarEventInsert } from '@/types/event'
import { toast } from 'sonner'

export function useCalendarEvents() {
  const supabase = createClient()
  const qc = useQueryClient()

  const { data: events = [], isLoading } = useQuery({
    queryKey: eventKeys.lists(),
    queryFn: async (): Promise<CalendarEvent[]> => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('start_at', { ascending: true })
      if (error) throw error
      return data as CalendarEvent[]
    },
  })

  const createEvent = useMutation({
    mutationFn: async (input: Omit<CalendarEventInsert, 'user_id'>) => {
      // user_id は DB の DEFAULT auth.uid() に任せる
      const { data, error } = await supabase
        .from('events')
        .insert(input as any)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: eventKeys.all })
      toast.success('予定を作成しました')
    },
    onError: () => toast.error('予定の作成に失敗しました'),
  })

  const updateEvent = useMutation({
    mutationFn: async ({ id, ...input }: Partial<Omit<CalendarEventInsert, 'user_id'>> & { id: string }) => {
      const { data, error } = await supabase
        .from('events')
        .update(input as any)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: eventKeys.all })
      toast.success('予定を更新しました')
    },
    onError: () => toast.error('予定の更新に失敗しました'),
  })

  const deleteEvent = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('events').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: eventKeys.all })
      toast.success('予定を削除しました')
    },
    onError: () => toast.error('予定の削除に失敗しました'),
  })

  return { events, isLoading, createEvent, updateEvent, deleteEvent }
}
