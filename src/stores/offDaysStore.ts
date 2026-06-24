import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type OffDaysStore = {
  offWeekdays: number[]  // 0=Sun, 1=Mon ... 6=Sat
  offDates: string[]     // YYYY-MM-DD (曜日設定の例外上書き)
  toggleWeekday: (day: number) => void
  toggleDate: (date: string) => void
}

export const useOffDaysStore = create<OffDaysStore>()(
  persist(
    (set) => ({
      offWeekdays: [],
      offDates: [],
      toggleWeekday: (day) =>
        set((s) => ({
          offWeekdays: s.offWeekdays.includes(day)
            ? s.offWeekdays.filter((d) => d !== day)
            : [...s.offWeekdays, day],
        })),
      toggleDate: (date) =>
        set((s) => ({
          offDates: s.offDates.includes(date)
            ? s.offDates.filter((d) => d !== date)
            : [...s.offDates, date],
        })),
    }),
    { name: 'off-days' }
  )
)
