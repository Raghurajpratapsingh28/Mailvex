"use client"

import { useRouter } from "next/navigation"
import { Filter, Plus, ArrowUpRight } from "lucide-react"
import type { WorkspaceSummary } from "@/lib/analytics-service"

type TopSegment = WorkspaceSummary["segments"]["top"][number]

interface Props {
  segments: TopSegment[]
  total: number
  workspaceId: string
}

export default function SegmentsSection({ segments, total, workspaceId }: Props) {
  const router = useRouter()

  return (
    <div className="p-5 enterprise-card flex flex-col h-full">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[8px] bg-[#FFB020]/10 flex items-center justify-center">
            <Filter className="w-4 h-4 text-[#FFB020]" />
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-[#FFFFFF] tracking-tight">Segments</h3>
            <p className="text-[11px] text-[#8A8D96] font-medium">{total} total</p>
          </div>
        </div>
        <button
          onClick={() => router.push(`/segments/${workspaceId}`)}
          className="text-[12px] text-[#8A8D96] hover:text-[#FFFFFF] transition-colors flex items-center gap-1 cursor-pointer"
        >
          View All <ArrowUpRight className="w-3 h-3" />
        </button>
      </div>

      <div className="space-y-2 flex-1">
        {segments.length === 0 && (
          <p className="text-[12px] text-[#8A8D96] font-medium py-4 text-center">No segments yet.</p>
        )}
        {segments.map((s) => (
          <div
            key={s.id}
            onClick={() => router.push(`/segments/${workspaceId}`)}
            className="flex items-center justify-between px-3 py-2.5 enterprise-panel enterprise-card-interactive cursor-pointer group rounded-xl"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded-[4px] uppercase tracking-wide shrink-0 ${
                  s.type === "dynamic"
                    ? "bg-[#00E5FF]/10 text-[#00E5FF]"
                    : "bg-[#8A8D96]/10 text-[#8A8D96]"
                }`}
              >
                {s.type === "dynamic" ? "DYN" : "STA"}
              </span>
              <p className="text-[12px] font-semibold text-[#FFFFFF] truncate group-hover:text-[#FFB020] transition-colors">
                {s.name}
              </p>
            </div>
            <span className="text-[12px] font-bold text-[#8A8D96] shrink-0 ml-2">
              {s.contactCount.toLocaleString()}
            </span>
          </div>
        ))}
      </div>

      <button
        onClick={() => router.push(`/segments/${workspaceId}`)}
        className="mt-4 w-full py-2.5 enterprise-btn text-[#FFFFFF] text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer border border-[#202126] hover:border-[#FFB020] transition-all rounded-xl"
      >
        <Plus className="w-4 h-4 text-[#FFB020]" /> New Segment
      </button>
    </div>
  )
}
