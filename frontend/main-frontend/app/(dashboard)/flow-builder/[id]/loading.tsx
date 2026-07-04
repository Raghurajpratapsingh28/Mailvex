import { Skeleton, SkPageHeader, SkFilterBar, SkTable } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="space-y-6 max-w-[1500px] mx-auto">
      <SkPageHeader />
      <SkFilterBar inputs={3} />
      <SkTable rows={6} cols={5} />
    </div>
  )
}
