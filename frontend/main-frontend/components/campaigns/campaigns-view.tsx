"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { useShortcut } from "@/lib/keyboard-shortcuts"
import { Plus, ArrowLeft, Loader2 } from "lucide-react"
import { campaignsService } from "@/lib/campaigns-service"
import { toast } from "sonner"
import type { Campaign } from "@/lib/campaigns-data"
import { useCampaigns } from "@/lib/redux/useCache"
import CampaignsTable from "./campaigns-table"
import CampaignFilters from "./campaign-filters"
import SendNowDialog from "./send-now-dialog"

interface Props { workspaceId?: string }

export default function CampaignsView({ workspaceId: propWorkspaceId }: Props) {
  const router = useRouter()
  const workspaceId = propWorkspaceId ?? ""
  useShortcut("n", () => router.push(`/campaigns/${workspaceId}/create`), !!workspaceId)

  const { campaigns, total, filters, loading, error, updateFilters, patch, remove, refetch } = useCampaigns(workspaceId || null)

  const [sendDialogCampaign, setSendDialogCampaign] = useState<Campaign | null>(null)

  const handlePause = async (c: Campaign) => {
    patch({ id: c.id, status: "paused" })
    try {
      const updated = await campaignsService.pause(workspaceId, c.id)
      patch({ ...updated, id: c.id })
    } catch (e: any) {
      patch({ id: c.id, status: c.status })
      toast.error(e.message)
    }
  }

  const handleResume = async (c: Campaign) => {
    try {
      const updated = await campaignsService.resume(workspaceId, c.id)
      patch({ ...updated, id: c.id })
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  const handleDelete = async (c: Campaign) => {
    if (!window.confirm(`Delete "${c.name}"?`)) return
    try {
      await campaignsService.delete(workspaceId, c.id)
      remove(c.id)
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  const handleSendNow = (c: Campaign) => setSendDialogCampaign(c)

  const handleSendConfirm = async (c: Campaign) => {
    try {
      await campaignsService.send(workspaceId, c.id)
      patch({ id: c.id, status: "sending" })
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  const COUNTS = {
    total,
    draft: campaigns.filter(c => c.status === "draft").length,
    scheduled: campaigns.filter(c => c.status === "scheduled").length,
    sending: campaigns.filter(c => c.status === "sending").length,
    sent: campaigns.filter(c => c.status === "sent").length,
  }

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6 max-w-[1500px] mx-auto select-none">
      <SendNowDialog campaign={sendDialogCampaign} onClose={() => setSendDialogCampaign(null)} onConfirm={handleSendConfirm} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          {propWorkspaceId && (
            <button onClick={() => router.push("/campaigns")} className="flex items-center gap-1.5 text-[10px] font-medium text-[#8A8D96] hover:text-[#FFFFFF] transition-colors mb-2 cursor-pointer">
              <ArrowLeft className="w-3 h-3" /> All Workspaces
            </button>
          )}
          <span className="text-[10px] text-[#8A8D96] font-medium uppercase tracking-wider">Broadcasts Dispatch</span>
          <div className="flex items-center gap-3 mt-1.5">
            <h1 className="text-2xl font-bold tracking-tight text-[#FFFFFF] leading-none">Campaigns</h1>
            <div className="flex items-baseline gap-1 bg-[#18191C] border border-[#202126] px-2.5 py-0.5 rounded-full text-xs font-medium text-[#FFFFFF]">
              <span className="font-bold">{total}</span><span className="text-[9px] text-[#8A8D96] uppercase">Total</span>
            </div>
          </div>
        </div>
        <button onClick={() => router.push(`/campaigns/${workspaceId}/create`)} className="flex items-center gap-1.5 px-3.5 py-2 bg-[#696CFF] hover:bg-[#5A5CE6] text-[#FFFFFF] rounded-[12px] text-xs font-semibold transition-all cursor-pointer">
          <Plus className="w-4 h-4 text-[#FFFFFF]" /> Create Campaign
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {[
          { label: "Total", value: COUNTS.total, color: "text-[#FFFFFF]" },
          { label: "Draft", value: COUNTS.draft, color: "text-[#FFB020]" },
          { label: "Scheduled", value: COUNTS.scheduled, color: "text-[#3CD3AD]" },
          { label: "Sending", value: COUNTS.sending, color: "text-[#696CFF]" },
          { label: "Sent", value: COUNTS.sent, color: "text-[#FFFFFF]" },
        ].map(({ label, value, color }) => (
          <div key={label} className="enterprise-card p-5 flex items-center justify-between h-full">
            <span className="text-[10px] font-medium text-[#8A8D96] uppercase tracking-wider">{label}</span>
            <span className={`text-xl font-bold ${color}`}>{value}</span>
          </div>
        ))}
      </div>

      <CampaignFilters
        search={filters.search}
        setSearch={(v) => updateFilters({ search: v })}
        status={filters.status}
        setStatus={(v) => updateFilters({ status: v })}
        dateFrom={filters.dateFrom}
        setDateFrom={(v) => updateFilters({ dateFrom: v })}
        dateTo={filters.dateTo}
        setDateTo={(v) => updateFilters({ dateTo: v })}
      />

      {loading ? (
        <div className="flex items-center justify-center py-24"><Loader2 className="w-6 h-6 text-[#8A8D96] animate-spin" /></div>
      ) : error ? (
        <div className="p-8 enterprise-card border-red-500/30 text-center">
          <p className="text-sm text-red-400">{error}</p>
          <button onClick={() => refetch()} className="mt-3 text-xs text-[#8A8D96] underline hover:text-[#FFFFFF] cursor-pointer">Retry</button>
        </div>
      ) : (
        <CampaignsTable
          campaigns={campaigns}
          onView={(c) => router.push(`/campaigns/${workspaceId}/details/${c.id}`)}
          onEdit={(c) => router.push(`/campaigns/${workspaceId}/edit/${c.id}`)}
          onSchedule={(c) => router.push(`/campaigns/${workspaceId}/details/${c.id}`)}
          onSendNow={handleSendNow}
          onPause={handlePause}
          onResume={handleResume}
          onDelete={handleDelete}
        />
      )}

      {!loading && !error && total > 0 && (
        <div className="flex items-center justify-between text-[11px] font-medium text-[#8A8D96] px-1">
          <span>Showing {campaigns.length} of {total} campaigns</span>
          <div className="flex items-center gap-2">
            <button onClick={() => updateFilters({ page: Math.max(1, filters.page - 1) })} disabled={filters.page === 1} className="px-2.5 py-1 bg-transparent border border-[#202126] rounded-[8px] disabled:opacity-40 hover:border-[#8A8D96] text-[#FFFFFF] transition-all cursor-pointer disabled:cursor-not-allowed">Prev</button>
            <span className="text-[#FFFFFF]">Page {filters.page}</span>
            <button onClick={() => updateFilters({ page: filters.page + 1 })} disabled={campaigns.length < 50} className="px-2.5 py-1 bg-transparent border border-[#202126] rounded-[8px] disabled:opacity-40 hover:border-[#8A8D96] text-[#FFFFFF] transition-all cursor-pointer disabled:cursor-not-allowed">Next</button>
          </div>
        </div>
      )}
    </motion.div>
  )
}
