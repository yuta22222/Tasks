'use client'
import { create } from 'zustand'

type UIStore = {
  sidebarOpen: boolean
  taskModalOpen: boolean
  editingTaskId: string | null
  calendarEventModalOpen: boolean
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  openTaskModal: (taskId?: string) => void
  closeTaskModal: () => void
  openCalendarEventModal: () => void
  closeCalendarEventModal: () => void
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: true,
  taskModalOpen: false,
  editingTaskId: null,
  calendarEventModalOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  openTaskModal: (taskId) => set({ taskModalOpen: true, editingTaskId: taskId ?? null }),
  closeTaskModal: () => set({ taskModalOpen: false, editingTaskId: null }),
  openCalendarEventModal: () => set({ calendarEventModalOpen: true }),
  closeCalendarEventModal: () => set({ calendarEventModalOpen: false }),
}))
