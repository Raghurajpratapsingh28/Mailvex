"use client"

import { useRouter } from "next/navigation"
import { Megaphone, UserPlus, FileText, GitBranch, ArrowUpRight } from "lucide-react"

export default function QuickActions({ workspaceId }: { workspaceId: string }) {
  const router = useRouter()
  const actions = [
    { label: "Create Campaign", desc: "Broadcast push", icon: Megaphone, href: `/campaigns/${workspaceId}/create`, color: "#FF5A4F" },
    { label: "Add Contact", desc: "Profile ingest", icon: UserPlus, href: `/contact/${workspaceId}`, color: "#696CFF" },
    { label: "Create Segment", desc: "Group filters", icon: FileText, href: `/segments/${workspaceId}`, color: "#FFB020" },
    { label: "Create Workflow", desc: "Visual automation", icon: GitBranch, href: `/flow-builder/${workspaceId}/create`, color: "#00E5FF" },
  ]

  return (
    <div className="p-5 enterprise-card flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-[16px] font-bold text-[#FFFFFF] tracking-tight">Quick Actions</h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {actions.map((a) => (
          <button key={a.label} onClick={() => router.push(a.href)} className="p-5 enterprise-panel enterprise-card-interactive text-left flex flex-col group cursor-pointer relative overflow-hidden">
            <div className="w-10 h-10 rounded-[12px] bg-[#0D0E12] flex items-center justify-center mb-4 transition-all">
              <a.icon className="w-5 h-5 transition-colors" style={{ color: a.color }} />
            </div>
            <p className="text-[13px] font-bold text-[#FFFFFF] leading-tight mb-1">{a.label}</p>
            <p className="text-[11px] text-[#8A8D96] font-medium leading-tight">{a.desc}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
