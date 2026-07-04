"use client"

import { useState } from "react"
import { Campaign } from "@/lib/campaigns-data"
import { X, Calendar } from "lucide-react"

interface Props {
  campaign: Campaign | null
  onClose: () => void
  onConfirm: (campaign: Campaign, scheduledAt: string) => void
}

export default function ScheduleModal({ campaign, onClose, onConfirm }: Props) {
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 16)
  const [dateTime, setDateTime] = useState(tomorrow)
  const [error, setError] = useState("")

  if (!campaign) return null

  const segment = { name: campaign.segmentName, count: campaign.recipientCount }

  const handleConfirm = () => {
    const selected = new Date(dateTime)
    if (selected <= new Date()) {
      setError("Schedule time must be in the future.")
      return
    }
    if (selected > new Date(Date.now() + 365 * 86400000)) {
      setError("Schedule time must be within 1 year.")
      return
    }
    onConfirm(campaign, selected.toISOString())
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#18191C] border border-[#202126] rounded-[16px] shadow-2xl shadow-black/50 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#202126]">
          <div>
            <span className="text-[10px] text-[#8A8D96] font-medium uppercase tracking-wider">Schedule Campaign</span>
            <h2 className="text-sm font-bold text-[#FFFFFF] mt-0.5 truncate max-w-[280px]">{campaign.name}</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-[8px] hover:bg-[#25262B] text-[#8A8D96] hover:text-[#FFFFFF] transition-all cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Recipient info */}
          <div className="p-3.5 rounded-[12px] bg-[#0D0E12] border border-[#202126] text-xs text-[#8A8D96]">
            Will send to{" "}
            <span className="font-medium font-semibold text-[#FFFFFF]">~{segment.count.toLocaleString()} contacts</span>
            {" "}in segment{" "}
            <span className="text-[#8A8D96] font-semibold">{segment.name}</span>
          </div>

          {/* Date/time picker */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#FFFFFF] tracking-tight flex items-center gap-1.5">
              <Calendar className="w-3 h-3" /> Schedule Date & Time
            </label>
            <input
              type="datetime-local"
              value={dateTime}
              min={new Date().toISOString().slice(0, 16)}
              onChange={(e) => { setDateTime(e.target.value); setError("") }}
              className="w-full px-3.5 py-2.5 bg-[#0D0E12] border border-[#202126] hover:border-[#8A8D96] focus:border-[#696CFF] rounded-[12px] text-xs text-[#FFFFFF] font-medium focus:outline-none transition-colors cursor-pointer"
            />
            <p className="text-[10px] text-[#8A8D96] font-medium">Timezone: UTC+5:30 (IST)</p>
            {error && <p className="text-[10px] text-[#FF5A4F] font-medium">{error}</p>}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#202126]">
          <button onClick={onClose} className="px-4 py-2 bg-transparent hover:bg-[#25262B] border border-transparent rounded-[8px] text-xs font-semibold text-[#8A8D96] hover:text-[#FFFFFF] transition-all cursor-pointer">
            Cancel
          </button>
          <button onClick={handleConfirm} className="px-4 py-2 bg-[#696CFF] hover:bg-[#5A5CE6] text-[#FFFFFF] rounded-[12px] text-xs font-semibold transition-all cursor-pointer">
            Confirm Schedule
          </button>
        </div>
      </div>
    </div>
  )
}
