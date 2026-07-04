import { Skeleton, SkPageHeader, SkCard } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="space-y-6 max-w-[800px] mx-auto">
      <SkPageHeader hasButton={false} />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>
      <SkCard className="space-y-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex justify-between border-b border-[#202126] pb-3 last:border-0 last:pb-0">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-3 w-48" />
          </div>
        ))}
      </SkCard>
    </div>
  )
}
