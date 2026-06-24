'use client'
import 'temporal-polyfill/global'
import { useCalendarApp, ScheduleXCalendar } from '@schedule-x/react'
import { createViewMonthGrid, createViewWeek, createViewDay } from '@schedule-x/calendar'
import { createEventsServicePlugin } from '@schedule-x/events-service'
import '@schedule-x/theme-default/dist/index.css'
import '@/styles/schedule-x-overrides.css'
import { useCalendarEvents } from '@/hooks/useCalendarEvents'
import { useAuth } from '@/hooks/useAuth'
import { useTasks } from '@/hooks/useTasks'
import { useMemo, useEffect, useState, useCallback, useRef } from 'react'
import { getUrgency } from '@/components/tasks/TaskCard'
import { EventQuickCreate } from './EventQuickCreate'
import { EventModal, type EventFormData } from './EventModal'
import { EventDetailPopover } from './EventDetailPopover'
import { OffDaysSettings } from './OffDaysSettings'
import { useUIStore } from '@/stores/uiStore'
import { useOffDaysStore } from '@/stores/offDaysStore'
import { Settings2 } from 'lucide-react'
import type { CalendarEvent } from '@/types/event'

/* ─── Temporal ヘルパー ─── */
const pad = (n: number) => String(n).padStart(2, '0')

// UTCのISO文字列 → JST時刻値をUTC ZonedDateTimeとして返す（schedule-x表示用）
function toLocalDateTimeString(isoString: string): Temporal.ZonedDateTime {
  try {
    const zdt = Temporal.Instant.from(isoString).toZonedDateTimeISO('Asia/Tokyo')
    return Temporal.ZonedDateTime.from({
      year: zdt.year, month: zdt.month, day: zdt.day,
      hour: zdt.hour, minute: zdt.minute, second: 0, timeZone: 'UTC',
    })
  } catch {
    const n = isoString.replace(' ', 'T')
    const w = n.includes('+') || n.includes('Z') ? n : n + '+09:00'
    const zdt = Temporal.Instant.from(w).toZonedDateTimeISO('Asia/Tokyo')
    return Temporal.ZonedDateTime.from({
      year: zdt.year, month: zdt.month, day: zdt.day,
      hour: zdt.hour, minute: zdt.minute, second: 0, timeZone: 'UTC',
    })
  }
}
function toPlainDate(d: string): Temporal.PlainDate {
  return Temporal.PlainDate.from(d)
}
// Temporal → ISO文字列 (Supabase用)
function zdtToISO(zdt: Temporal.ZonedDateTime): string {
  return zdt.toInstant().toString()
}
function plainDateToISO(d: Temporal.PlainDate, timeStr: string, tz = 'Asia/Tokyo'): string {
  const [h, m] = timeStr.split(':').map(Number)
  const zdt = d.toZonedDateTime({ timeZone: tz, plainTime: Temporal.PlainTime.from({ hour: h, minute: m }) })
  return zdtToISO(zdt)
}

/* 日時ラベル（クイック作成ポップオーバー用） */
function formatDateLabel(date: Temporal.PlainDate, startTime?: string, endTime?: string): string {
  const d = new Date(date.toString())
  const label = d.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', weekday: 'short' })
  if (!startTime) return label
  return `${label}  ${startTime} – ${endTime ?? ''}`
}
function addOneHour(t: string): string {
  const [h, m] = t.split(':').map(Number)
  const nh = (h + 1) % 24
  return `${String(nh).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/* ─── urgency → calendarId ─── */
const urgencyCalendars = {
  event: {
    colorName: 'event',
    lightColors: { main: '#818CF8', container: '#1A1836', onContainer: '#a5b4fc' },
    darkColors:  { main: '#818CF8', container: '#1A1836', onContainer: '#c7d2fe' },
  },
  'task-overdue': {
    colorName: 'task-overdue',
    lightColors: { main: '#F87171', container: '#2a0a0f', onContainer: '#fca5a5' },
    darkColors:  { main: '#F87171', container: '#2a0a0f', onContainer: '#fca5a5' },
  },
  'task-today': {
    colorName: 'task-today',
    lightColors: { main: '#FBBF24', container: '#2a200a', onContainer: '#fde68a' },
    darkColors:  { main: '#FBBF24', container: '#2a200a', onContainer: '#fde68a' },
  },
  'task-soon': {
    colorName: 'task-soon',
    lightColors: { main: '#FB923C', container: '#271508', onContainer: '#fed7aa' },
    darkColors:  { main: '#FB923C', container: '#271508', onContainer: '#fed7aa' },
  },
  'task-normal': {
    colorName: 'task-normal',
    lightColors: { main: '#34D399', container: '#071a12', onContainer: '#6ee7b7' },
    darkColors:  { main: '#34D399', container: '#071a12', onContainer: '#6ee7b7' },
  },
}

type ViewName = 'month-grid' | 'week' | 'day'
const VIEW_TABS: { name: ViewName; label: string }[] = [
  { name: 'month-grid', label: '月' },
  { name: 'week',       label: '週' },
  { name: 'day',        label: '日' },
]

/* ─── UIモード ─── */
type UIMode =
  | { kind: 'none' }
  | { kind: 'quick'; title: string; form: EventFormData; x: number; y: number; dateLabel: string }
  | { kind: 'modal'; form: EventFormData; editTarget?: CalendarEvent }
  | { kind: 'detail'; event: CalendarEvent; x: number; y: number }

/* ─── オフ日CSS生成 ─── */
function generateOffDayCSS(offWeekdays: number[], offDates: string[]): string {
  if (offWeekdays.length === 0 && offDates.length === 0) return ''
  const selectors: string[] = []
  const now = new Date()
  const start = new Date(now.getFullYear() - 1, now.getMonth(), 1)
  const end   = new Date(now.getFullYear() + 2, now.getMonth(), 1)
  const cur = new Date(start)
  while (cur < end) {
    const y = cur.getFullYear()
    const m = String(cur.getMonth() + 1).padStart(2, '0')
    const d = String(cur.getDate()).padStart(2, '0')
    const dateStr = `${y}-${m}-${d}`
    const isOff = offWeekdays.includes(cur.getDay()) || offDates.includes(dateStr)
    if (isOff) selectors.push(`[data-date="${dateStr}"]`)
    cur.setDate(cur.getDate() + 1)
  }
  if (selectors.length === 0) return ''
  const s = selectors.join(',')
  return [
    `${s} { background: #080C09 !important; }`,
    `${s} * { opacity: 0.4 !important; }`,
    `${s} .sx__event, ${s} .sx__month-grid-day__event { opacity: 0.5 !important; }`,
  ].join('')
}

export function CalendarView() {
  const { events, createEvent, updateEvent, deleteEvent } = useCalendarEvents()
  const { user } = useAuth()
  const { tasks } = useTasks()
  const eventsPlugin = useMemo(() => createEventsServicePlugin(), [])
  const [currentView, setCurrentView] = useState<ViewName>('month-grid')
  const [ui, setUi] = useState<UIMode>({ kind: 'none' })
  const [showOffSettings, setShowOffSettings] = useState(false)
  const [offDayEditMode, setOffDayEditMode] = useState(false)
  const offDayEditModeRef = useRef(false)
  const toggleDateRef = useRef<(date: string) => void>(() => {})
  const { offWeekdays, offDates, toggleDate } = useOffDaysStore()

  useEffect(() => { offDayEditModeRef.current = offDayEditMode }, [offDayEditMode])
  useEffect(() => { toggleDateRef.current = toggleDate }, [toggleDate])

  // オフ日CSS injection
  useEffect(() => {
    const id = 'off-days-style'
    let el = document.getElementById(id) as HTMLStyleElement | null
    if (!el) {
      el = document.createElement('style')
      el.id = id
      document.head.appendChild(el)
    }
    el.textContent = generateOffDayCSS(offWeekdays, offDates)
    return () => { el?.remove() }
  }, [offWeekdays, offDates])

  // BottomNav FABからのトリガーを購読
  const { calendarEventModalOpen, closeCalendarEventModal } = useUIStore()
  useEffect(() => {
    if (calendarEventModalOpen) {
      closeCalendarEventModal()
      const today = Temporal.Now.plainDateISO('Asia/Tokyo')
      setUi({
        kind: 'modal',
        form: {
          title: '',
          allDay: false,
          startDate: today.toString(),
          startTime: '09:00',
          endDate:   today.toString(),
          endTime:   '10:00',
          memo: '',
        },
      })
    }
  }, [calendarEventModalOpen, closeCalendarEventModal])

  /* ─── カレンダーイベント生成 ─── */
  // 予定化済みのタスクIDセット
  const scheduledTaskIds = useMemo(
    () => new Set(events.map(e => e.task_id).filter(Boolean)),
    [events]
  )

  const calendarEvents = useMemo(() => [
    ...events.map((e) => ({
      id: e.id,
      title: e.title,
      start: toLocalDateTimeString(e.start_at) as unknown as Temporal.ZonedDateTime,
      end:   toLocalDateTimeString(e.end_at) as unknown as Temporal.ZonedDateTime,
      calendarId: 'event',
    })),
    ...tasks
      .filter((t) => t.due_date && !scheduledTaskIds.has(t.id))
      .map((t) => {
        const urgency = getUrgency(t)
        if (urgency === 'completed') return null
        const calendarId =
          urgency === 'overdue' ? 'task-overdue' :
          urgency === 'today'   ? 'task-today'   :
          urgency === 'soon'    ? 'task-soon'     : 'task-normal'
        return {
          id: `task-${t.id}`,
          title: t.title,
          start: toPlainDate(t.due_date!),
          end:   toPlainDate(t.due_date!),
          calendarId,
        }
      })
      .filter((e): e is NonNullable<typeof e> => e !== null),
  ], [events, tasks])

  /* ─── schedule-x 初期化 ─── */
  const calendar = useCalendarApp({
    views: [createViewMonthGrid(), createViewWeek(), createViewDay()],
    defaultView: 'month-grid',
    locale: 'ja-JP',
    firstDayOfWeek: 7,
    calendars: urgencyCalendars,
    events: calendarEvents,
    plugins: [eventsPlugin],
    callbacks: {
      /* 月ビュー: 日付クリック */
      onClickDate(date: Temporal.PlainDate, e?: UIEvent) {
        if (offDayEditModeRef.current) {
          toggleDateRef.current(date.toString())
          return
        }
        const me = e as MouseEvent | undefined
        const form: EventFormData = {
          title: '',
          allDay: true,
          startDate: date.toString(),
          startTime: '09:00',
          endDate: date.toString(),
          endTime: '10:00',
          memo: '',
        }
        setUi({
          kind: 'quick',
          title: '',
          form,
          x: me?.clientX ?? window.innerWidth / 2,
          y: me?.clientY ?? window.innerHeight / 2,
          dateLabel: formatDateLabel(date),
        })
      },
      /* 週/日ビュー: 時刻クリック → クイック作成（時刻指定） */
      onClickDateTime(dateTime: Temporal.ZonedDateTime, e?: UIEvent) {
        const me = e as MouseEvent | undefined
        const date = dateTime.toPlainDate()
        const h = String(dateTime.hour).padStart(2, '0')
        const m = String(Math.floor(dateTime.minute / 15) * 15).padStart(2, '0')
        const startTime = `${h}:${m}`
        const endTime   = addOneHour(startTime)
        const form: EventFormData = {
          title: '',
          allDay: false,
          startDate: date.toString(),
          startTime,
          endDate: date.toString(),
          endTime,
          memo: '',
        }
        setUi({
          kind: 'quick',
          title: '',
          form,
          x: me?.clientX ?? window.innerWidth / 2,
          y: me?.clientY ?? window.innerHeight / 2,
          dateLabel: formatDateLabel(date, startTime, endTime),
        })
      },
      /* 既存イベントクリック → 詳細ポップオーバー（タスクは除外） */
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onEventClick(ev: any, e?: UIEvent) {
        if (String(ev.id).startsWith('task-')) return
        const found = events.find(e2 => e2.id === String(ev.id))
        if (!found) return
        const me = e as MouseEvent | undefined
        setUi({
          kind: 'detail',
          event: found,
          x: me?.clientX ?? window.innerWidth / 2,
          y: me?.clientY ?? window.innerHeight / 2,
        })
      },
    },
  })

  useEffect(() => {
    eventsPlugin.set(calendarEvents)
  }, [calendarEvents, eventsPlugin])

  /* ─── ビュー切り替え ─── */
  const handleViewChange = useCallback((viewName: ViewName) => {
    if (!calendar) return
    setCurrentView(viewName)
    try {
      const app = (calendar as any).$app
      const today = Temporal.Now.plainDateISO('Asia/Tokyo')
      app.calendarState.setView(viewName, today)
    } catch { /* noop */ }
  }, [calendar])

  /* ─── フォームデータ → Supabase insert ─── */
  function formToInsert(f: EventFormData) {
    const tz = 'Asia/Tokyo'
    let start_at: string
    let end_at: string
    if (f.allDay) {
      const d = Temporal.PlainDate.from(f.startDate)
      start_at = plainDateToISO(d, '00:00', tz)
      end_at   = plainDateToISO(Temporal.PlainDate.from(f.endDate), '23:59', tz)
    } else {
      start_at = plainDateToISO(Temporal.PlainDate.from(f.startDate), f.startTime, tz)
      end_at   = plainDateToISO(Temporal.PlainDate.from(f.endDate),   f.endTime,   tz)
    }
    return { title: f.title.trim(), start_at, end_at, memo: f.memo || null, task_id: f.task_id ?? null, user_id: user?.id ?? '' }
  }

  /* ─── クイック保存 ─── */
  const handleQuickSave = useCallback(() => {
    if (ui.kind !== 'quick') return
    const data = { ...ui.form, title: ui.title }
    createEvent.mutate(formToInsert(data), { onSuccess: () => setUi({ kind: 'none' }) })
  }, [ui, createEvent])

  /* ─── モーダル保存 ─── */
  const handleModalSave = useCallback((f: EventFormData) => {
    if (ui.kind !== 'modal') return
    if (ui.editTarget) {
      updateEvent.mutate({ id: ui.editTarget.id, ...formToInsert(f) }, { onSuccess: () => setUi({ kind: 'none' }) })
    } else {
      createEvent.mutate(formToInsert(f), { onSuccess: () => setUi({ kind: 'none' }) })
    }
  }, [ui, createEvent, updateEvent])

  /* ─── 削除 ─── */
  const handleDelete = useCallback((id: string) => {
    deleteEvent.mutate(id, { onSuccess: () => setUi({ kind: 'none' }) })
  }, [deleteEvent])

  /* ─── 詳細→編集モーダルへ ─── */
  const openEditModal = useCallback((event: CalendarEvent) => {
    const s = new Date(event.start_at)
    const e = new Date(event.end_at)
    const pad = (n: number) => String(n).padStart(2, '0')
    const toDateStr = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`
    const toTimeStr = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`
    const allDay = s.getHours() === 0 && s.getMinutes() === 0 && e.getHours() === 23 && e.getMinutes() >= 59
    setUi({
      kind: 'modal',
      editTarget: event,
      form: {
        title: event.title,
        allDay,
        startDate: toDateStr(s),
        startTime: toTimeStr(s),
        endDate:   toDateStr(e),
        endTime:   toTimeStr(e),
        memo: event.memo ?? '',
      },
    })
  }, [])

  return (
    <div className="flex flex-col h-[calc(100dvh-8rem)] lg:h-[calc(100dvh-6rem)] gap-0">
      {/* カスタムビュー切替タブ */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[var(--surface-1)] border border-b-0 border-[var(--border)] rounded-t-2xl">
        <div className="flex items-center gap-1 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] rounded-xl p-1">
          {VIEW_TABS.map(({ name, label }) => (
            <button
              key={name}
              onClick={() => handleViewChange(name)}
              className={[
                'relative px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 min-w-[44px]',
                currentView === name
                  ? 'bg-[var(--accent)] text-white font-semibold shadow-[0_1px_4px_rgba(129,140,248,0.4)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.06)]',
              ].join(' ')}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* 曜日設定（ギアアイコン） */}
          <button
            onClick={() => setShowOffSettings(true)}
            className="w-8 h-8 flex items-center justify-center rounded-xl transition-all"
            style={{
              background: (offWeekdays.length > 0 || offDates.length > 0) ? 'rgba(16,185,129,0.12)' : 'var(--surface-2)',
              color: (offWeekdays.length > 0 || offDates.length > 0) ? 'var(--accent)' : 'var(--muted)',
              border: '1px solid var(--border)',
            }}
            title="オフ日の曜日設定"
          >
            <Settings2 size={13} />
          </button>
          {/* 個別日付編集モードトグル */}
          <button
            onClick={() => setOffDayEditMode(v => !v)}
            className="flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs font-semibold transition-all"
            style={{
              background: offDayEditMode ? 'var(--accent)' : 'var(--surface-2)',
              color: offDayEditMode ? '#fff' : 'var(--muted)',
              border: offDayEditMode ? '1px solid transparent' : '1px solid var(--border)',
            }}
            title="日付をタップしてオフ日を個別設定"
          >
            {offDayEditMode ? '設定中 ✕' : 'オフ日'}
          </button>

          {/* 新規作成ボタン */}
          <button
            onClick={() => {
              const today = Temporal.Now.plainDateISO('Asia/Tokyo')
              setUi({
                kind: 'modal',
                form: {
                  title: '',
                  allDay: false,
                  startDate: today.toString(),
                  startTime: '09:00',
                  endDate:   today.toString(),
                  endTime:   '10:00',
                  memo: '',
                },
              })
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold text-white transition-all"
            style={{ background: 'var(--gradient-primary)', boxShadow: 'var(--shadow-accent)' }}
          >
            <span className="text-base leading-none">+</span>
            <span>予定を追加</span>
          </button>
        </div>
      </div>

      {/* カレンダー本体 */}
      <div className="flex-1 min-h-0 overflow-hidden rounded-b-2xl border border-t-0 border-[var(--border)]">
        <ScheduleXCalendar calendarApp={calendar} />
      </div>

      {/* ─── クイック作成ポップオーバー ─── */}
      {ui.kind === 'quick' && (
        <EventQuickCreate
          title={ui.title}
          onTitleChange={t => setUi(prev => prev.kind === 'quick' ? { ...prev, title: t } : prev)}
          dateLabel={ui.dateLabel}
          onSave={handleQuickSave}
          onOpenFull={() => {
            const form = { ...ui.form, title: ui.title }
            setUi({ kind: 'modal', form })
          }}
          onClose={() => setUi({ kind: 'none' })}
          loading={createEvent.isPending}
          anchorX={ui.x}
          anchorY={ui.y}
        />
      )}

      {/* ─── フル作成・編集モーダル ─── */}
      {ui.kind === 'modal' && (
        <EventModal
          initialData={ui.form}
          editTarget={ui.editTarget}
          tasks={tasks}
          onSave={handleModalSave}
          onDelete={ui.editTarget ? () => handleDelete(ui.editTarget!.id) : undefined}
          onClose={() => setUi({ kind: 'none' })}
          loading={createEvent.isPending || updateEvent.isPending}
        />
      )}

      {/* ─── オフ日設定 ─── */}
      {showOffSettings && <OffDaysSettings onClose={() => setShowOffSettings(false)} />}

      {/* ─── イベント詳細ポップオーバー ─── */}
      {ui.kind === 'detail' && (
        <EventDetailPopover
          event={ui.event}
          anchorX={ui.x}
          anchorY={ui.y}
          onEdit={() => openEditModal(ui.event)}
          onDelete={() => handleDelete(ui.event.id)}
          onClose={() => setUi({ kind: 'none' })}
        />
      )}
    </div>
  )
}
