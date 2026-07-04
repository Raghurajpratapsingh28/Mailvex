import { Skeleton, SkPageHeader, SkFilterBar, SkStatRow, SkTable } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="space-y-6 max-w-[1500px] mx-auto">
      <SkPageHeader />
      <SkFilterBar inputs={4} />
      <SkStatRow count={4} />
      <SkTable rows={8} cols={6} />
    </div>
  )
}
