"use client"

import { useRouter } from "next/navigation"
import { Users2, Mail, ArrowUpRight } from "lucide-react"

interface Props {
  total: number
  pendingInvites: number
  workspaceId: string
}

export default function MembersSection({ total, pendingInvites, workspaceId }: Props) {
  const router = useRouter()

  return (
    <div className="p-5 enterprise-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[8px] bg-[#696CFF]/10 flex items-center justify-center">
            <Users2 className="w-4 h-4 text-[#696CFF]" />
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-[#FFFFFF] tracking-tight">Team</h3>
            <p className="text-[11px] text-[#8A8D96] font-medium">Workspace members</p>
          </div>
        </div>
        <button
          onClick={() => router.push(`/settings/${workspaceId}`)}
          className="text-[12px] text-[#8A8D96] hover:text-[#FFFFFF] transition-colors flex items-center gap-1 cursor-pointer"
        >
          Manage <ArrowUpRight className="w-3 h-3" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 enterprise-panel flex flex-col items-center gap-1.5">
          <Users2 className="w-4 h-4 text-[#696CFF]" />
          <p className="text-[20px] font-bold text-[#FFFFFF]">{total}</p>
          <p className="text-[10px] text-[#8A8D96] font-medium uppercase tracking-wide">Active</p>
        </div>
        <div className="p-3 enterprise-panel flex flex-col items-center gap-1.5">
          <Mail className="w-4 h-4 text-[#FFB020]" />
          <p className="text-[20px] font-bold text-[#FFFFFF]">{pendingInvites}</p>
          <p className="text-[10px] text-[#8A8D96] font-medium uppercase tracking-wide">Pending</p>
        </div>
      </div>
    </div>
  )
}
