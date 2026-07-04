import { Skeleton, SkPageHeader, SkCard, SkTable } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="space-y-6 max-w-[1000px] mx-auto">
      <SkPageHeader />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* current plan card */}
        <SkCard className="lg:col-span-2 space-y-5">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-7 w-36" />
            </div>
            <Skeleton className="h-9 w-28 rounded-[12px]" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i}>
                <div className="flex justify-between mb-1.5">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ))}
          </div>
        </SkCard>
        {/* next invoice */}
        <SkCard className="space-y-3">
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="h-10 w-full" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex justify-between">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </SkCard>
      </div>
      <SkTable rows={5} cols={4} />
    </div>
  )
}
