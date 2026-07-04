import { Skeleton, SkPageHeader, SkFilterBar, SkStatRow, SkTable } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="space-y-6 max-w-[1500px] mx-auto">
      <SkPageHeader />
      {/* tab bar */}
      <div className="flex gap-1 w-fit">
        <Skeleton className="h-9 w-20 rounded-lg" />
        <Skeleton className="h-9 w-24 rounded-lg" />
      </div>
      <SkFilterBar inputs={4} />
      <SkStatRow count={5} />
      <SkTable rows={6} cols={6} />
    </div>
  )
}
