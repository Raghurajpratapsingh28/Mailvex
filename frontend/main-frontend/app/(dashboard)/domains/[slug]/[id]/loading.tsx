import { Skeleton, SkPageHeader, SkCard, SkTable } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="space-y-6 max-w-[900px] mx-auto">
      <SkPageHeader />
      <SkCard>
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex justify-between">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-3 w-48" />
            </div>
          ))}
        </div>
      </SkCard>
      <SkTable rows={4} cols={4} />
    </div>
  )
}
