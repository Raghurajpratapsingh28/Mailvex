"use client"

import { useRouter } from "next/navigation"
import { Megaphone, Plus, ArrowUpRight } from "lucide-react"
import type { WorkspaceSummary } from "@/lib/analytics-service"

type RecentCampaign = WorkspaceSummary["campaigns"]["recent"][number]

interface Props {
  campaigns: RecentCampaign[]
  total: number
  workspaceId: string
}

const STATUS_STYLES: Record<string, string> = {
  sent: "bg-[#696CFF]/10 text-[#696CFF]",
  sending: "bg-[#00E5FF]/10 text-[#00E5FF]",
  scheduled: "bg-[#FFB020]/10 text-[#FFB020]",
  paused: "bg-[#FF5A4F]/10 text-[#FF5A4F]",
  draft: "bg-[#8A8D96]/10 text-[#8A8D96]",
  failed: "bg-[#FF5A4F]/10 text-[#FF5A4F]",
}

export default function CampaignsSection({ campaigns, total, workspaceId }: Props) {
  const router = useRouter()

  return (
    <div className="p-5 enterprise-card flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[8px] bg-[#FF5A4F]/10 flex items-center justify-center">
              <Megaphone className="w-4 h-4 text-[#FF5A4F]" />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-[#FFFFFF] tracking-tight">Recent Campaigns</h3>
              <p className="text-[11px] text-[#8A8D96] font-medium">{total} total</p>
            </div>
          </div>
          <button
            onClick={() => router.push(`/campaigns/${workspaceId}`)}
            className="text-[12px] text-[#8A8D96] hover:text-[#FFFFFF] transition-colors flex items-center gap-1 cursor-pointer"
          >
            View All <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>

        <div className="space-y-2.5">
          {campaigns.length === 0 && (
            <div className="py-8 text-center">
              <p className="text-[12px] text-[#8A8D96] font-medium">No campaigns yet.</p>
              <p className="text-[11px] text-[#5A5D6B] mt-1">Create your first campaign to get started.</p>
            </div>
          )}
          {campaigns.map((c) => {
            const deliveryPct =
              c.recipientCount > 0 ? Math.round((c.sentCount / c.recipientCount) * 100) : null

            return (
              <div
                key={c.id}
                onClick={() => router.push(`/campaigns/${workspaceId}/details/${c.id}`)}
                className="w-full p-4 enterprise-panel enterprise-card-interactive flex items-center justify-between cursor-pointer group"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="text-[13px] font-bold text-[#FFFFFF] truncate group-hover:text-[#FF5A4F] transition-colors">
                    {c.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-[5px] uppercase tracking-wide ${STATUS_STYLES[c.status] ?? STATUS_STYLES.draft}`}
                    >
                      {c.status}
                    </span>
                    {c.sentCount > 0 && (
                      <span className="text-[11px] text-[#8A8D96]">
                        {c.sentCount.toLocaleString()} sent
                      </span>
                    )}
                  </div>
                </div>
                {deliveryPct !== null && (
                  <div className="text-right ml-4 shrink-0">
                    <p className="text-[10px] text-[#8A8D96] font-medium uppercase tracking-wider mb-0.5">
                      Delivered
                    </p>
                    <p className="text-[15px] font-bold text-[#FFFFFF]">{deliveryPct}%</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <button
        onClick={() => router.push(`/campaigns/${workspaceId}/create`)}
        className="mt-5 w-full py-2.5 enterprise-btn text-[#FFFFFF] text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer border border-[#202126] hover:border-[#FF5A4F] transition-all rounded-xl"
      >
        <Plus className="w-4 h-4 text-[#FF5A4F]" /> New Campaign
      </button>
    </div>
  )
}
