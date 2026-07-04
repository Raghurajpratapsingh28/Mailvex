"use client"

import { useRouter } from "next/navigation"
import { GitBranch, Plus, ArrowUpRight, CheckCircle2, XCircle, PlayCircle, PauseCircle } from "lucide-react"

interface Props {
  stats: {
    total: number
    published: number
    executions: { total: number; completed: number; failed: number; running: number }
  } | null
  workspaceId: string
}

export default function WorkflowsSection({ stats, workspaceId }: Props) {
  const router = useRouter()
  const ex = stats?.executions

  return (
    <div className="p-5 enterprise-card">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[8px] bg-[#00E5FF]/10 flex items-center justify-center">
            <GitBranch className="w-4 h-4 text-[#00E5FF]" />
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-[#FFFFFF] tracking-tight">Workflows</h3>
            <p className="text-[11px] text-[#8A8D96] font-medium">
              {stats?.published ?? 0} active of {stats?.total ?? 0} total
            </p>
          </div>
        </div>
        <button
          onClick={() => router.push(`/flow-builder/${workspaceId}`)}
          className="text-[12px] text-[#8A8D96] hover:text-[#FFFFFF] transition-colors flex items-center gap-1 cursor-pointer"
        >
          View All <ArrowUpRight className="w-3 h-3" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="p-3 enterprise-panel text-center">
          <CheckCircle2 className="w-4 h-4 text-[#34D399] mx-auto mb-1.5" />
          <p className="text-[16px] font-bold text-[#FFFFFF]">{ex?.completed ?? 0}</p>
          <p className="text-[10px] text-[#8A8D96] font-medium uppercase tracking-wide">Done</p>
        </div>
        <div className="p-3 enterprise-panel text-center">
          <PlayCircle className="w-4 h-4 text-[#FFB020] mx-auto mb-1.5" />
          <p className="text-[16px] font-bold text-[#FFFFFF]">{ex?.running ?? 0}</p>
          <p className="text-[10px] text-[#8A8D96] font-medium uppercase tracking-wide">Running</p>
        </div>
        <div className="p-3 enterprise-panel text-center">
          <XCircle className="w-4 h-4 text-[#FF5A4F] mx-auto mb-1.5" />
          <p className="text-[16px] font-bold text-[#FFFFFF]">{ex?.failed ?? 0}</p>
          <p className="text-[10px] text-[#8A8D96] font-medium uppercase tracking-wide">Failed</p>
        </div>
      </div>

      <button
        onClick={() => router.push(`/flow-builder/${workspaceId}/create`)}
        className="w-full py-2.5 enterprise-btn text-[#FFFFFF] text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer border border-[#202126] hover:border-[#00E5FF] transition-all rounded-xl"
      >
        <Plus className="w-4 h-4 text-[#00E5FF]" /> New Workflow
      </button>
    </div>
  )
}
