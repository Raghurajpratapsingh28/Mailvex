import { Skeleton, SkPageHeader, SkFilterBar, SkTable } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      <SkPageHeader />
      <SkFilterBar inputs={2} />
      <SkTable rows={5} cols={5} />
    </div>
  )
}
