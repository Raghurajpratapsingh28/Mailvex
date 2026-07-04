import { Skeleton, SkPageHeader, SkCard } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="space-y-6 max-w-[800px] mx-auto">
      <SkPageHeader hasButton={false} />
      {/* tab strip */}
      <div className="flex gap-1 border-b border-[#202126]">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-24 rounded-t-lg" />
        ))}
      </div>
      <SkCard className="space-y-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <Skeleton className="h-2.5 w-28" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        ))}
        <Skeleton className="h-9 w-28 rounded-[12px]" />
      </SkCard>
    </div>
  )
}
