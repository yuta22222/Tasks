'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Task } from '@/types/task'

const CATEGORIES = ['仕事', 'インプット', '恋愛', '磨き', 'その他'] as const

const schema = z.object({
  title: z.string().min(1, 'タイトルを入力してください'),
  due_date: z.string().optional(),
  category: z.string().optional(),
  memo: z.string().optional(),
  recurrence_type: z.enum(['none', 'daily', 'weekly', 'monthly']),
})

type FormValues = z.infer<typeof schema>

type Props = {
  defaultValues?: Partial<Task>
  onSubmit: (values: FormValues) => void
  onCancel: () => void
  isSubmitting?: boolean
}

export function TaskForm({ defaultValues, onSubmit, onCancel, isSubmitting }: Props) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: defaultValues?.title ?? '',
      due_date: defaultValues?.due_date ?? '',
      category: defaultValues?.category ?? '',
      memo: defaultValues?.memo ?? '',
      recurrence_type: (defaultValues?.recurrence_type as FormValues['recurrence_type']) ?? 'none',
    },
  })

  const recurrence = watch('recurrence_type')
  const category = watch('category') ?? ''

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="title" className="text-sm text-[var(--text-primary)]">
          タイトル <span className="text-[var(--danger)]">*</span>
        </Label>
        <Input
          id="title"
          placeholder="タスクを入力..."
          {...register('title')}
          className="bg-[var(--surface-2)] border-[var(--border)] focus:ring-2 focus:ring-[var(--accent)]/40 focus:border-[var(--accent)] transition-all duration-150 rounded-xl min-h-[44px]"
          autoFocus
        />
        {errors.title && (
          <p className="text-sm text-[var(--danger)]">{errors.title.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="due_date" className="text-sm text-[var(--text-primary)]">締切日</Label>
          <Input
            id="due_date"
            type="date"
            {...register('due_date')}
            className="bg-[var(--surface-2)] border-[var(--border)] focus:ring-2 focus:ring-[var(--accent)]/40 focus:border-[var(--accent)] transition-all duration-150 rounded-xl min-h-[44px]"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-sm text-[var(--text-primary)]">カテゴリ</Label>
          <Select value={category} onValueChange={(v: string | null) => setValue('category', !v || v === '__none__' ? '' : v)}>
            <SelectTrigger className="bg-[var(--surface-2)] border-[var(--border)] focus:ring-2 focus:ring-[var(--accent)]/40 focus:border-[var(--accent)] transition-all duration-150 rounded-xl min-h-[44px]">
              <SelectValue placeholder="選択..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">なし</SelectItem>
              {CATEGORIES.map(c => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1">
        <Label className="text-sm text-[var(--text-primary)]">繰り返し</Label>
        <Select value={recurrence} onValueChange={(v) => setValue('recurrence_type', v as FormValues['recurrence_type'])}>
          <SelectTrigger className="bg-[var(--surface-2)] border-[var(--border)] focus:ring-2 focus:ring-[var(--accent)]/40 focus:border-[var(--accent)] transition-all duration-150 rounded-xl min-h-[44px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">なし</SelectItem>
            <SelectItem value="daily">毎日</SelectItem>
            <SelectItem value="weekly">毎週</SelectItem>
            <SelectItem value="monthly">毎月</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label htmlFor="memo" className="text-sm text-[var(--text-primary)]">メモ</Label>
        <Textarea
          id="memo"
          placeholder="メモを入力..."
          rows={3}
          {...register('memo')}
          className="bg-[var(--surface)] border-[var(--border)] resize-none"
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting} className="border-[var(--border)]">
          キャンセル
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
          className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white min-w-[80px] disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 11-8 8z" />
              </svg>
              保存中...
            </span>
          ) : '保存する'}
        </Button>
      </div>
    </form>
  )
}
