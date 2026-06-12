import { CheckSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Props = {
  title?: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({
  title = 'タスクがありません',
  description = 'タスクを追加してみましょう',
  actionLabel = 'タスクを追加',
  onAction,
}: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-5">
      <div className="relative">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-950/50 dark:to-violet-900/30 flex items-center justify-center shadow-lg shadow-indigo-500/10">
          <CheckSquare size={32} className="text-[var(--accent)]" />
        </div>
        {/* 装飾リング */}
        <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-indigo-200/50 dark:ring-indigo-700/30" />
      </div>
      <div className="space-y-1.5">
        <p className="font-bold text-[var(--text-primary)]">{title}</p>
        <p className="text-sm text-[var(--text-secondary)]">{description}</p>
      </div>
      {onAction && (
        <Button
          onClick={onAction}
          className="text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-105 transition-all duration-200 active:scale-[0.98]"
          style={{ background: 'var(--gradient-primary)' }}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
