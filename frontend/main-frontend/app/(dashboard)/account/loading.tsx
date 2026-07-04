import { Skeleton, SkPageHeader, SkCard } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="space-y-6 max-w-[700px] mx-auto">
      <SkPageHeader hasButton={false} />
      {/* avatar + name */}
      <SkCard className="flex items-center gap-6">
        <Skeleton className="w-20 h-20 rounded-full shrink-0" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3 w-56" />
        </div>
        <Skeleton className="h-9 w-24 rounded-[12px] shrink-0" />
      </SkCard>
      {/* form fields */}
      <SkCard className="space-y-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <Skeleton className="h-2.5 w-24" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        ))}
        <Skeleton className="h-9 w-28 rounded-[12px]" />
      </SkCard>
      {/* danger zone */}
      <SkCard className="space-y-4">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-3 w-64" />
        <Skeleton className="h-9 w-32 rounded-[12px]" />
      </SkCard>
    </div>
  )
}
