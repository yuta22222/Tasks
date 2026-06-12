export function SkeletonCard() {
  return (
    <div className="flex items-center gap-3.5 px-4 py-3.5 rounded-2xl border border-[var(--border)] bg-[var(--surface-1)]">
      <div className="w-[18px] h-[18px] rounded-full skeleton-shimmer shrink-0" />
      <div className="flex-1 space-y-2.5">
        <div className="h-3.5 skeleton-shimmer rounded-full w-3/5" />
        <div className="h-2.5 skeleton-shimmer rounded-full w-1/4" />
      </div>
    </div>
  )
}
