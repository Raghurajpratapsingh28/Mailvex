"use client"

import { Campaign } from "@/lib/campaigns-data"
import { X, AlertCircle, Send, Users, Mail } from "lucide-react"

interface Props {
  campaign: Campaign | null
  onClose: () => void
  onConfirm: (campaign: Campaign) => void
}

export default function SendNowDialog({ campaign, onClose, onConfirm }: Props) {
  if (!campaign) return null

  const warnings: string[] = []
  if (!campaign.segmentId) warnings.push("No segment selected — campaign will have 0 recipients.")
  if (!campaign.htmlBody?.trim()) warnings.push("Campaign HTML body is empty.")
  if (!campaign.subject?.trim()) warnings.push("Subject line is empty.")
  if (!campaign.fromEmail?.trim()) warnings.push("Sender email is not set.")

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-[#18191C] border border-[#202126] rounded-[16px] shadow-2xl shadow-black/50 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#202126]">
          <span className="text-[10px] text-[#8A8D96] font-medium uppercase tracking-wider">Send Campaign</span>
          <button onClick={onClose} className="p-2 rounded-[8px] hover:bg-[#25262B] text-[#8A8D96] hover:text-[#FFFFFF] transition-all cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <h2 className="text-sm font-bold text-[#FFFFFF]">Send "{campaign.name}" now?</h2>
            <p className="text-xs text-[#8A8D96] mt-1 leading-relaxed">
              This will immediately queue the campaign for delivery. This action cannot be undone.
            </p>
          </div>

          <div className="p-3.5 rounded-[12px] bg-[#0D0E12] border border-[#202126] space-y-2 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-[#8A8D96] font-medium"><Users className="w-3 h-3" /> Recipients</span>
              <span className="text-[#FFFFFF] font-medium font-semibold">
                {campaign.recipientCount > 0 ? campaign.recipientCount.toLocaleString() : "—"}
                {campaign.segmentName && <span className="text-[#8A8D96] font-normal"> · {campaign.segmentName}</span>}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-[#8A8D96] font-medium"><Mail className="w-3 h-3" /> From</span>
              <span className="text-[#FFFFFF] font-medium">{campaign.fromEmail || "—"}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-[#8A8D96] font-medium shrink-0">Subject</span>
              <span className="text-[#FFFFFF] truncate max-w-[180px] text-right">{campaign.subject || "—"}</span>
            </div>
          </div>

          {warnings.length > 0 && (
            <div className="p-3.5 rounded-[12px] bg-[#FFB020]/5 border border-[#FFB020]/20 space-y-1.5">
              {warnings.map((w) => (
                <div key={w} className="flex items-start gap-2 text-xs text-[#FFB020]">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{w}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#202126]">
          <button onClick={onClose} className="px-4 py-2 bg-transparent hover:bg-[#25262B] border border-transparent rounded-[8px] text-xs font-semibold text-[#8A8D96] hover:text-[#FFFFFF] transition-all cursor-pointer">
            Cancel
          </button>
          <button
            onClick={() => { onConfirm(campaign); onClose() }}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#696CFF] hover:bg-[#5A5CE6] text-[#FFFFFF] rounded-[12px] text-xs font-semibold transition-all cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" /> Send Now
          </button>
        </div>
      </div>
    </div>
  )
}
