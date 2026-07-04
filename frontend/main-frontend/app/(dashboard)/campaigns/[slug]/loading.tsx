import { Skeleton, SkPageHeader, SkFilterBar, SkStatRow, SkTable } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="space-y-6 max-w-[1500px] mx-auto">
      <SkPageHeader />
      <SkFilterBar inputs={3} />
      <SkStatRow count={5} />
      <SkTable rows={7} cols={6} />
    </div>
  )
}
