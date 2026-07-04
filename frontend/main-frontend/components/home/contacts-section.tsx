"use client"

import { useRouter } from "next/navigation"
import { Users, Plus, Upload, ArrowUpRight, UserCheck, UserX, TrendingUp } from "lucide-react"
import type { WorkspaceSummary } from "@/lib/analytics-service"

type ContactData = WorkspaceSummary["contacts"] | null

interface Props {
  contacts: ContactData
  workspaceId: string
}

export default function ContactsSection({ contacts, workspaceId }: Props) {
  const router = useRouter()

  const timeline = contacts?.growthTimeline ?? []
  const maxCount = Math.max(...timeline.map((d) => d.count), 1)

  return (
    <div className="p-5 enterprise-card flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[8px] bg-[#696CFF]/10 flex items-center justify-center">
              <Users className="w-4 h-4 text-[#696CFF]" />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-[#FFFFFF] tracking-tight">Audience</h3>
              <p className="text-[11px] text-[#8A8D96] font-medium">Contact database</p>
            </div>
          </div>
          <button
            onClick={() => router.push(`/contact/${workspaceId}`)}
            className="text-[12px] text-[#8A8D96] hover:text-[#FFFFFF] transition-colors flex items-center gap-1 cursor-pointer"
          >
            View All <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>

        {/* Big number */}
        <div className="flex items-end gap-3 mb-4">
          <h2 className="text-4xl font-bold text-[#FFFFFF] tracking-tight">
            {(contacts?.total ?? 0).toLocaleString()}
          </h2>
          {contacts && contacts.addedLast30Days > 0 && (
            <span className="text-[12px] font-bold text-[#34D399] mb-1.5 flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +{contacts.addedLast30Days.toLocaleString()} / 30d
            </span>
          )}
        </div>

        {/* Lifecycle breakdown */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="p-3 enterprise-panel text-center">
            <p className="text-[15px] font-bold text-[#696CFF]">
              {(contacts?.active ?? 0).toLocaleString()}
            </p>
            <div className="flex items-center justify-center gap-1 mt-0.5">
              <UserCheck className="w-3 h-3 text-[#696CFF]" />
              <p className="text-[10px] text-[#8A8D96] font-medium">Active</p>
            </div>
          </div>
          <div className="p-3 enterprise-panel text-center">
            <p className="text-[15px] font-bold text-[#FFB020]">
              {(contacts?.leads ?? 0).toLocaleString()}
            </p>
            <p className="text-[10px] text-[#8A8D96] font-medium mt-0.5">Leads</p>
          </div>
          <div className="p-3 enterprise-panel text-center">
            <p className="text-[15px] font-bold text-[#FF5A4F]">
              {(contacts?.suppressed ?? 0).toLocaleString()}
            </p>
            <div className="flex items-center justify-center gap-1 mt-0.5">
              <UserX className="w-3 h-3 text-[#FF5A4F]" />
              <p className="text-[10px] text-[#8A8D96] font-medium">Suppressed</p>
            </div>
          </div>
        </div>

        {/* Growth sparkline */}
        {timeline.length > 0 && (
          <div>
            <p className="text-[10px] text-[#8A8D96] font-medium uppercase tracking-wider mb-2">
              Growth — last 30 days
            </p>
            <div className="h-16 w-full flex items-end justify-between gap-0.5">
              {timeline.map((d, i) => (
                <div
                  key={i}
                  title={`${d.day}: ${d.count}`}
                  className="flex-1 bg-[#202126] rounded-t-[2px] hover:bg-[#696CFF] transition-colors cursor-default"
                  style={{ height: `${Math.max(4, (d.count / maxCount) * 100)}%` }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 mt-5">
        <button
          onClick={() => router.push(`/contact/${workspaceId}`)}
          className="py-2.5 enterprise-btn text-[#FFFFFF] text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer border border-[#202126] hover:border-[#696CFF] transition-all rounded-xl"
        >
          <Plus className="w-4 h-4 text-[#696CFF]" /> Add Contact
        </button>
        <button
          onClick={() => router.push(`/contact/${workspaceId}`)}
          className="py-2.5 enterprise-btn text-[#FFFFFF] text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer border border-[#202126] hover:border-[#8A8D96] transition-all rounded-xl"
        >
          <Upload className="w-4 h-4 text-[#8A8D96]" /> Import CSV
        </button>
      </div>
    </div>
  )
}
