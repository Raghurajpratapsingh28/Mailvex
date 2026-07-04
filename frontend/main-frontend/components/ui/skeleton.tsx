import { cn } from '@/lib/utils'

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn('bg-[#202126] animate-pulse rounded-lg', className)}
      {...props}
    />
  )
}

// Table skeleton — header + n body rows
function SkTable({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="rounded-[16px] border border-[#202126] overflow-hidden">
      <div className="flex gap-4 px-4 py-3.5 border-b border-[#202126]">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-3 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 px-4 py-3.5 border-b border-[#202126]/60 last:border-0">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className={cn("h-3 flex-1", c === 0 && "max-w-[160px]")} />
          ))}
        </div>
      ))}
    </div>
  )
}

// Page header: breadcrumb + title + optional button
function SkPageHeader({ hasButton = true }: { hasButton?: boolean }) {
  return (
    <div className="flex items-start justify-between">
      <div className="space-y-2.5">
        <Skeleton className="h-2.5 w-24" />
        <Skeleton className="h-7 w-52" />
      </div>
      {hasButton && <Skeleton className="h-9 w-32 rounded-[12px]" />}
    </div>
  )
}

// Filter bar
function SkFilterBar({ inputs = 3 }: { inputs?: number }) {
  return (
    <div className="rounded-[16px] border border-[#202126] p-4 flex gap-3 flex-wrap">
      {Array.from({ length: inputs }).map((_, i) => (
        <Skeleton key={i} className={cn("h-9 rounded-xl", i === 0 ? "flex-1 min-w-[180px]" : "w-32")} />
      ))}
    </div>
  )
}

// Stat counters row
function SkStatRow({ count = 5 }: { count?: number }) {
  return (
    <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${count}, 1fr)` }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-[16px] border border-[#202126] p-3.5 flex items-center justify-between">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-4 w-6" />
        </div>
      ))}
    </div>
  )
}

// Card shell
function SkCard({ className, children }: { className?: string; children?: React.ReactNode }) {
  return (
    <div className={cn("rounded-[16px] border border-[#202126] p-6", className)}>
      {children ?? (
        <div className="space-y-3">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-2/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      )}
    </div>
  )
}

export { Skeleton, SkTable, SkPageHeader, SkFilterBar, SkStatRow, SkCard }
