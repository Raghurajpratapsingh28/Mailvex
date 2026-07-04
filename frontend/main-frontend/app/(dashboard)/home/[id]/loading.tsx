import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="space-y-6 max-w-[1400px] w-full mx-auto select-none">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-2.5 w-24" />
          <Skeleton className="h-2 w-36" />
          <Skeleton className="h-7 w-52 mt-1" />
        </div>
        <Skeleton className="h-9 w-28 rounded-xl" />
      </div>

      {/* Row 1: Quick Actions + Plan Card */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 rounded-2xl border border-white/[0.06] p-5 space-y-4 bg-white/[0.02]">
          <Skeleton className="h-4 w-32" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-white/[0.06] p-4 space-y-3 bg-white/[0.02]">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-2.5 w-14" />
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-white/[0.06] p-5 space-y-4 bg-white/[0.02]">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-6 w-28" />
          <div className="space-y-2.5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </div>
          <Skeleton className="h-9 w-full rounded-xl" />
        </div>
      </div>

      {/* Row 2: Usage meters */}
      <div className="rounded-2xl border border-white/[0.06] p-5 space-y-4 bg-white/[0.02]">
        <Skeleton className="h-4 w-28" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2.5">
              <div className="flex items-center justify-between">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-12" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
              <Skeleton className="h-2.5 w-16" />
            </div>
          ))}
        </div>
      </div>

      {/* Row 3: Delivery KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-white/[0.06] p-4 space-y-2.5 bg-white/[0.02]">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-7 w-14" />
            <Skeleton className="h-2.5 w-16" />
          </div>
        ))}
      </div>

      {/* Row 4: Campaigns + Workflows/Domains */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-white/[0.06] p-5 space-y-4 bg-white/[0.02]">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-7 w-20 rounded-lg" />
          </div>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-2.5 w-1/2" />
              </div>
              <Skeleton className="h-5 w-16 rounded-full shrink-0" />
            </div>
          ))}
        </div>
        <div className="space-y-6">
          <div className="rounded-2xl border border-white/[0.06] p-5 space-y-4 bg-white/[0.02]">
            <Skeleton className="h-4 w-24" />
            <div className="grid grid-cols-3 gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-white/[0.06] p-3 space-y-1.5 bg-white/[0.02]">
                  <Skeleton className="h-5 w-10" />
                  <Skeleton className="h-2.5 w-14" />
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-white/[0.06] p-5 space-y-3 bg-white/[0.02]">
            <Skeleton className="h-4 w-20" />
            <div className="grid grid-cols-3 gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-white/[0.06] p-3 space-y-1.5 bg-white/[0.02]">
                  <Skeleton className="h-5 w-8" />
                  <Skeleton className="h-2.5 w-14" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 5: Contacts + Segments/Members */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 rounded-2xl border border-white/[0.06] p-5 space-y-4 bg-white/[0.02]">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-7 w-20 rounded-lg" />
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-2.5 w-1/3" />
              </div>
              <Skeleton className="h-3 w-16 shrink-0" />
            </div>
          ))}
        </div>
        <div className="space-y-6">
          <div className="rounded-2xl border border-white/[0.06] p-5 space-y-3 bg-white/[0.02]">
            <Skeleton className="h-4 w-20" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-5 w-10 rounded-full" />
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-white/[0.06] p-5 space-y-3 bg-white/[0.02]">
            <Skeleton className="h-4 w-20" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full shrink-0" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-2.5 w-14" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
