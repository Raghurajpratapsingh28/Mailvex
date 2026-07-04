import { Skeleton, SkPageHeader } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="space-y-6 max-w-[900px] mx-auto">
      <SkPageHeader hasButton={false} />
      <div className="flex gap-0 border-b border-[#202126] w-fit">
        <Skeleton className="h-9 w-16 rounded-none" />
        <Skeleton className="h-9 w-20 rounded-none" />
      </div>
      <div className="rounded-[16px] border border-[#202126] p-6 space-y-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <Skeleton className="h-2.5 w-24" />
            <Skeleton className={`w-full rounded-xl ${i >= 2 ? "h-28" : "h-10"}`} />
          </div>
        ))}
      </div>
      <div className="flex justify-between">
        <Skeleton className="h-5 w-36 rounded" />
        <div className="flex gap-3">
          <Skeleton className="h-9 w-20 rounded-[12px]" />
          <Skeleton className="h-9 w-36 rounded-[12px]" />
        </div>
      </div>
    </div>
  )
}
