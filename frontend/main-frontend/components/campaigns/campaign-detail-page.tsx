"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Pencil, Calendar, Send, Pause, Play, Trash2, Users, Mail, Clock, AlertCircle, Loader2, X, CheckCircle, XCircle } from "lucide-react"
import CampaignStatusBadge from "./campaign-status-badge"
import SendNowDialog from "./send-now-dialog"
import { campaignsService } from "@/lib/campaigns-service"
import { toast } from "sonner"
import type { Campaign } from "@/lib/campaigns-data"

// Returns a datetime-local string in the browser's local timezone (YYYY-MM-DDTHH:mm)
function toLocalDatetimeString(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

interface Props { workspaceId: string; campaignId: string }

export default function CampaignDetailPage({ workspaceId, campaignId }: Props) {
  const router = useRouter()
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const [scheduleTime, setScheduleTime] = useState(() => toLocalDatetimeString(new Date(Date.now() + 86400000)))
  const [scheduleError, setScheduleError] = useState("")
  const [sendDialogOpen, setSendDialogOpen] = useState(false)

  useEffect(() => {
    campaignsService.get(workspaceId, campaignId)
      .then(setCampaign)
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [workspaceId, campaignId])

  const refresh = () => campaignsService.get(workspaceId, campaignId).then(setCampaign).catch(console.error)

  const handlePause = async () => {
    try { setCampaign(await campaignsService.pause(workspaceId, campaignId)) } catch (e: any) { toast.error(e.message) }
  }
  const handleResume = async () => {
    try { setCampaign(await campaignsService.resume(workspaceId, campaignId)) } catch (e: any) { toast.error(e.message) }
  }
  const handleDelete = async () => {
    if (!campaign || !window.confirm(`Delete "${campaign.name}"?`)) return
    try { await campaignsService.delete(workspaceId, campaignId); router.push(`/campaigns/${workspaceId}`) } catch (e: any) { toast.error(e.message) }
  }
  const handleSendNow = () => setSendDialogOpen(true)
  const handleSendConfirm = async () => {
    try { await campaignsService.send(workspaceId, campaignId); refresh() } catch (e: any) { toast.error(e.message) }
  }
  const handleScheduleConfirm = async () => {
    const d = new Date(scheduleTime)
    if (d <= new Date()) { setScheduleError("Must be in the future."); return }
    try { setCampaign(await campaignsService.schedule(workspaceId, campaignId, d.toISOString())); setScheduleOpen(false) } catch (e: any) { toast.error(e.message) }
  }

  if (isLoading) return <div className="flex items-center justify-center py-24"><Loader2 className="w-6 h-6 text-[#6B7280] animate-spin" /></div>
  if (!campaign) return <div className="flex items-center justify-center py-24"><p className="text-sm text-[#7A8499] font-mono">Campaign not found.</p></div>

  const c = campaign
  const canEdit = ["draft", "scheduled"].includes(c.status)

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6 max-w-[1200px] mx-auto select-none">
      <SendNowDialog campaign={sendDialogOpen ? campaign : null} onClose={() => setSendDialogOpen(false)} onConfirm={handleSendConfirm} />
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <button onClick={() => router.push(`/campaigns/${workspaceId}`)} className="flex items-center gap-1.5 text-[10px] font-medium text-[#8A8D96] hover:text-[#FFFFFF] transition-colors mb-3 cursor-pointer">
            <ArrowLeft className="w-3 h-3" /> Back to Campaigns
          </button>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight text-[#FFFFFF]">{c.name}</h1>
            <CampaignStatusBadge status={c.status} />
          </div>
          <p className="text-xs text-[#8A8D96] mt-1.5 font-medium">{c.subject}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {canEdit && <Btn onClick={() => router.push(`/campaigns/${workspaceId}/edit/${c.id}`)} color="text-[#8A8D96]"><Pencil className="w-3.5 h-3.5" /> Edit</Btn>}
          {["draft", "scheduled"].includes(c.status) && <Btn onClick={() => setScheduleOpen(true)} color="text-[#3CD3AD]"><Calendar className="w-3.5 h-3.5" /> {c.status === "scheduled" ? "Reschedule" : "Schedule"}</Btn>}
          {["draft", "paused"].includes(c.status) && <Btn onClick={handleSendNow} color="text-[#696CFF]"><Send className="w-3.5 h-3.5" /> Send Now</Btn>}
          {["scheduled", "sending"].includes(c.status) && <Btn onClick={handlePause} color="text-[#FFB020]"><Pause className="w-3.5 h-3.5" /> Pause</Btn>}
          {c.status === "paused" && <Btn onClick={handleResume} color="text-[#3CD3AD]"><Play className="w-3.5 h-3.5" /> Resume</Btn>}
          {["draft", "scheduled", "paused", "failed"].includes(c.status) && <Btn onClick={handleDelete} color="text-[#FF5A4F]"><Trash2 className="w-3.5 h-3.5" /> Delete</Btn>}
        </div>
      </div>

      {c.status === "failed" && c.errorMessage && (
        <div className="p-4 rounded-[12px] bg-red-500/5 border border-red-500/20 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-red-400">Campaign Failed</p>
            <p className="text-[10px] text-red-400/80 font-medium mt-0.5">{c.errorMessage}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <InfoCard icon={<Users className="w-4 h-4 text-[#8A8D96]" />} label="Recipients">
          <p className="text-sm font-bold font-medium text-[#FFFFFF]">{c.recipientCount > 0 ? c.recipientCount.toLocaleString() : "—"}</p>
          <p className="text-[10px] text-[#8A8D96] mt-0.5 truncate">{c.segmentName || "No segment"}</p>
        </InfoCard>
        <InfoCard icon={<CheckCircle className="w-4 h-4 text-[#3CD3AD]" />} label="Sent">
          <p className="text-sm font-bold font-medium text-[#3CD3AD]">{c.sentCount > 0 ? c.sentCount.toLocaleString() : "—"}</p>
          <p className="text-[10px] text-[#8A8D96] mt-0.5">delivered</p>
        </InfoCard>
        <InfoCard icon={<XCircle className="w-4 h-4 text-[#FF5A4F]" />} label="Failed">
          <p className="text-sm font-bold font-medium text-[#FF5A4F]">{c.failedCount > 0 ? c.failedCount.toLocaleString() : "—"}</p>
          <p className="text-[10px] text-[#8A8D96] mt-0.5">bounced / failed</p>
        </InfoCard>
        <InfoCard icon={<Clock className="w-4 h-4 text-[#3CD3AD]" />} label="Schedule">
          {c.sentAt ? <p className="text-xs font-medium text-[#3CD3AD]">Sent {new Date(c.sentAt).toLocaleString()}</p>
            : c.scheduledAt ? <p className="text-xs font-medium text-[#3CD3AD]">{new Date(c.scheduledAt).toLocaleString()}</p>
            : <p className="text-xs text-[#8A8D96] font-medium">Not scheduled</p>}
        </InfoCard>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InfoCard icon={<Mail className="w-4 h-4 text-[#696CFF]" />} label="Sender">
          <p className="text-xs font-semibold text-[#FFFFFF]">{c.fromName || "—"}</p>
          <p className="text-[10px] text-[#8A8D96] font-medium mt-0.5">{c.fromEmail || "—"}</p>
        </InfoCard>
        <InfoCard icon={<Mail className="w-4 h-4 text-[#8A8D96]" />} label="Reply To">
          <p className="text-xs font-medium text-[#FFFFFF]">{c.replyTo || c.fromEmail || "—"}</p>
        </InfoCard>
      </div>

      <div className="enterprise-card p-6 space-y-4">
        <h3 className="text-xs font-semibold text-[#8A8D96] tracking-tight">Content Preview</h3>
        <div className="space-y-1">
          <p className="text-[9px] font-medium text-[#8A8D96] uppercase">Subject</p>
          <p className="text-sm font-semibold text-[#FFFFFF]">{c.subject}</p>
          {c.previewText && <p className="text-xs text-[#8A8D96]">{c.previewText}</p>}
        </div>
        <div className="rounded-[12px] border border-[#202126] overflow-hidden bg-[#FFFFFF]">
          {c.htmlBody
            ? <iframe srcDoc={c.htmlBody} className="w-full h-[300px] border-0" sandbox="allow-same-origin" title="Preview" />
            : <div className="h-[120px] flex items-center justify-center text-xs text-[#8A8D96] bg-[#18191C]">No HTML content</div>
          }
        </div>
      </div>

      {/* Schedule modal */}
      {scheduleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setScheduleOpen(false)} />
          <div className="relative w-full max-w-md bg-[#18191C] border border-[#202126] rounded-[16px] shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#202126]">
              <span className="text-[10px] text-[#8A8D96] font-medium uppercase tracking-wider">Schedule Campaign</span>
              <button onClick={() => setScheduleOpen(false)} className="p-2 rounded-[8px] hover:bg-[#25262B] text-[#8A8D96] hover:text-[#FFFFFF] transition-all cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <input type="datetime-local" value={scheduleTime} min={toLocalDatetimeString(new Date())} onChange={(e) => { setScheduleTime(e.target.value); setScheduleError("") }} className="w-full px-3.5 py-2.5 bg-[#0D0E12] border border-[#202126] hover:border-[#8A8D96] focus:border-[#696CFF] rounded-[12px] text-xs text-[#FFFFFF] font-medium focus:outline-none transition-colors cursor-pointer" />
              {scheduleError && <p className="text-[10px] text-[#FF5A4F] font-medium">{scheduleError}</p>}
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#202126]">
              <button onClick={() => setScheduleOpen(false)} className="px-4 py-2 bg-transparent hover:bg-[#25262B] border border-transparent rounded-[8px] text-xs font-semibold text-[#8A8D96] hover:text-[#FFFFFF] transition-all cursor-pointer">Cancel</button>
              <button onClick={handleScheduleConfirm} className="px-4 py-2 bg-[#696CFF] hover:bg-[#5A5CE6] text-[#FFFFFF] rounded-[12px] text-xs font-semibold transition-all cursor-pointer">Confirm Schedule</button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}

function InfoCard({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="enterprise-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 bg-transparent">{icon}</div>
        <span className="text-xs font-semibold text-[#8A8D96] tracking-tight">{label}</span>
      </div>
      {children}
    </div>
  )
}

function Btn({ onClick, color, children }: { onClick: () => void; color: string; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-1.5 px-3.5 py-2 bg-transparent hover:bg-[#25262B] border border-transparent hover:border-[#8A8D96] rounded-[8px] text-xs font-semibold ${color} transition-all cursor-pointer`}>
      {children}
    </button>
  )
}
