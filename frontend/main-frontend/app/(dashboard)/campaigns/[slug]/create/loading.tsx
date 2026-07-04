import { Skeleton, SkPageHeader } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="space-y-6 max-w-[800px] mx-auto">
      <SkPageHeader hasButton={false} />
      <div className="rounded-[16px] border border-[#202126] p-6 space-y-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <Skeleton className="h-2.5 w-24" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-3">
        <Skeleton className="h-9 w-24 rounded-[12px]" />
        <Skeleton className="h-9 w-32 rounded-[12px]" />
      </div>
    </div>
  )
}
