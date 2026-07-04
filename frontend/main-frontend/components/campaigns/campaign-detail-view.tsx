"use client"

import { Campaign } from "@/lib/campaigns-data"
import CampaignStatusBadge from "./campaign-status-badge"
import { ArrowLeft, Pencil, Calendar, Send, Pause, Play, Trash2, Users, Mail, Clock, AlertCircle } from "lucide-react"

interface Props {
  campaign: Campaign
  onBack: () => void
  onEdit: (c: Campaign) => void
  onSchedule: (c: Campaign) => void
  onSendNow: (c: Campaign) => void
  onPause: (c: Campaign) => void
  onResume: (c: Campaign) => void
  onDelete: (c: Campaign) => void
}

export default function CampaignDetailView({ campaign: c, onBack, onEdit, onSchedule, onSendNow, onPause, onResume, onDelete }: Props) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <button onClick={onBack} className="flex items-center gap-1.5 text-[10px] font-medium text-[#8A8D96] hover:text-[#FFFFFF] transition-colors mb-3 cursor-pointer">
            <ArrowLeft className="w-3 h-3" /> Back to Campaigns
          </button>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight text-[#FFFFFF]">{c.name}</h1>
            <CampaignStatusBadge status={c.status} />
          </div>
          <p className="text-xs text-[#8A8D96] mt-1.5 font-medium">{c.subject}</p>
        </div>

        {/* Context-aware actions */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {(c.status === "draft" || c.status === "scheduled") && (
            <ActionBtn onClick={() => onEdit(c)} color="text-[#8A8D96]">
              <Pencil className="w-3.5 h-3.5" /> Edit
            </ActionBtn>
          )}
          {c.status === "draft" && (
            <>
              <ActionBtn onClick={() => onSchedule(c)} color="text-[#3CD3AD]">
                <Calendar className="w-3.5 h-3.5" /> Schedule
              </ActionBtn>
              <ActionBtn onClick={() => onSendNow(c)} color="text-[#696CFF]">
                <Send className="w-3.5 h-3.5" /> Send Now
              </ActionBtn>
            </>
          )}
          {(c.status === "scheduled" || c.status === "sending") && (
            <ActionBtn onClick={() => onPause(c)} color="text-[#FFB020]">
              <Pause className="w-3.5 h-3.5" /> Pause
            </ActionBtn>
          )}
          {c.status === "paused" && (
            <ActionBtn onClick={() => onResume(c)} color="text-[#3CD3AD]">
              <Play className="w-3.5 h-3.5" /> Resume
            </ActionBtn>
          )}
          {["draft", "scheduled", "paused", "failed"].includes(c.status) && (
            <ActionBtn onClick={() => onDelete(c)} color="text-[#FF5A4F]">
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </ActionBtn>
          )}
        </div>
      </div>

      {/* Error banner for failed */}
      {c.status === "failed" && c.errorMessage && (
        <div className="p-4 rounded-[12px] bg-red-500/5 border border-red-500/20 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-red-400">Campaign Failed</p>
            <p className="text-[10px] text-red-400/80 font-medium mt-0.5">{c.errorMessage}</p>
          </div>
        </div>
      )}

      {/* Info cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <InfoCard icon={<Users className="w-4 h-4 text-[#8A8D96]" />} label="Recipients">
          <p className="text-sm font-bold font-medium text-[#FFFFFF]">{c.recipientCount > 0 ? c.recipientCount.toLocaleString() : "—"}</p>
          <p className="text-[10px] text-[#8A8D96] mt-0.5">{c.segmentName}</p>
        </InfoCard>
        <InfoCard icon={<Mail className="w-4 h-4 text-[#696CFF]" />} label="Sender">
          <p className="text-xs font-semibold text-[#FFFFFF]">{c.fromName}</p>
          <p className="text-[10px] text-[#8A8D96] font-medium mt-0.5">{c.fromEmail}</p>
        </InfoCard>
        <InfoCard icon={<Clock className="w-4 h-4 text-[#3CD3AD]" />} label="Schedule">
          {c.sentAt ? (
            <p className="text-xs font-medium text-[#3CD3AD]">Sent {new Date(c.sentAt).toLocaleString()}</p>
          ) : c.scheduledAt ? (
            <p className="text-xs font-medium text-[#3CD3AD]">{new Date(c.scheduledAt).toLocaleString()}</p>
          ) : (
            <p className="text-xs text-[#8A8D96] font-medium">Not scheduled</p>
          )}
        </InfoCard>
      </div>

      {/* Content preview */}
      <div className="enterprise-card p-6 space-y-4">
        <h3 className="text-xs font-semibold text-[#8A8D96] tracking-tight">Content Preview</h3>
        <div className="space-y-1">
          <p className="text-[9px] font-medium text-[#8A8D96] uppercase">Subject</p>
          <p className="text-sm font-semibold text-[#FFFFFF]">{c.subject}</p>
          {c.previewText && <p className="text-xs text-[#8A8D96]">{c.previewText}</p>}
        </div>
        <div className="rounded-[12px] border border-[#202126] overflow-hidden bg-[#FFFFFF]">
          {c.htmlBody ? (
            <iframe srcDoc={c.htmlBody} className="w-full h-[300px] border-0" sandbox="allow-same-origin" title="Email preview" />
          ) : (
            <div className="h-[120px] flex items-center justify-center text-xs text-[#8A8D96] bg-[#18191C]">No HTML content</div>
          )}
        </div>
      </div>
    </div>
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

function ActionBtn({ onClick, color, children }: { onClick: () => void; color: string; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-1.5 px-3.5 py-2 bg-transparent hover:bg-[#25262B] border border-transparent hover:border-[#8A8D96] rounded-[8px] text-xs font-semibold ${color} transition-all cursor-pointer`}>
      {children}
    </button>
  )
}
