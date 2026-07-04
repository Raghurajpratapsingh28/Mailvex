import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="h-full w-full flex">
      {/* node palette */}
      <div className="w-64 border-r border-[#202126] p-4 space-y-3 shrink-0">
        <Skeleton className="h-8 w-full rounded-xl" />
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-xl" />
        ))}
      </div>
      {/* canvas */}
      <div className="flex-1 bg-[#0D0E12] relative">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton
            key={i}
            className="absolute h-16 w-40 rounded-xl"
            style={{ top: `${80 + i * 100}px`, left: `${120 + (i % 2) * 200}px` }}
          />
        ))}
      </div>
    </div>
  )
}
