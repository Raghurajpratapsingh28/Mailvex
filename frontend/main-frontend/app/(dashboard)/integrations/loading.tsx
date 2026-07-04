import { Skeleton, SkPageHeader } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      <SkPageHeader hasButton={false} />
      <div className="grid gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-[16px] border border-[#202126] p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="space-y-2"><Skeleton className="h-4 w-40" /><Skeleton className="h-3 w-24" /></div>
            </div>
            <Skeleton className="w-4 h-4" />
          </div>
        ))}
      </div>
    </div>
  )
}
