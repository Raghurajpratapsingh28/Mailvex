import { Skeleton, SkPageHeader } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="space-y-6 max-w-[1200px] mx-auto animate-pulse">
      <SkPageHeader hasButton={false} />
      <div className="grid gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-[16px] border border-[#202126] p-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="w-4 h-4 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
