import { Skeleton, SkPageHeader } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="space-y-6 max-w-[800px] mx-auto">
      <SkPageHeader hasButton={false} />
      <div className="rounded-[16px] border border-[#202126] p-6 space-y-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-3.5 w-28" />
            {i === 0
              ? <Skeleton className="h-20 w-full rounded-xl" />
              : i === 2
              ? <div className="grid grid-cols-2 gap-3"><Skeleton className="h-10 rounded-xl" /><Skeleton className="h-10 rounded-xl" /></div>
              : <Skeleton className="h-10 w-full rounded-xl" />
            }
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-3">
        <Skeleton className="h-9 w-24 rounded-[12px]" />
        <Skeleton className="h-9 w-20 rounded-[12px]" />
      </div>
    </div>
  )
}
