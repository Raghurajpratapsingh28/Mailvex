import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="space-y-6 max-w-[1200px] mx-auto select-none">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-2.5 w-20" />
          <Skeleton className="h-2 w-16" />
          <Skeleton className="h-8 w-48 mt-1" />
          <Skeleton className="h-2.5 w-56" />
        </div>
        <div className="flex items-center gap-2 mt-8">
          <Skeleton className="h-8 w-8 rounded-xl" />
          <Skeleton className="h-8 w-28 rounded-xl" />
        </div>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
        <Skeleton className="h-4 w-4 rounded shrink-0 mt-0.5" />
        <div className="space-y-1.5 flex-1">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-2.5 w-full" />
          <Skeleton className="h-2.5 w-3/4" />
        </div>
      </div>

      {/* Key cards */}
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-5 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3.5 min-w-0 flex-1">
                <Skeleton className="h-9 w-9 rounded-xl shrink-0" />
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-3.5 w-32" />
                    <Skeleton className="h-4 w-12 rounded-md" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-3 w-40" />
                    <Skeleton className="h-4 w-16 rounded-md" />
                    <Skeleton className="h-4 w-14 rounded-md" />
                  </div>
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-2.5 w-28" />
                    <Skeleton className="h-2.5 w-24" />
                  </div>
                </div>
              </div>
              <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
            </div>
          </div>
        ))}
      </div>

      {/* Security note */}
      <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-3">
        <Skeleton className="h-2.5 w-20" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-start gap-2">
            <Skeleton className="h-3 w-3 rounded shrink-0 mt-0.5" />
            <Skeleton className="h-2.5 flex-1" style={{ maxWidth: `${75 + i * 5}%` }} />
          </div>
        ))}
      </div>
    </div>
  )
}
