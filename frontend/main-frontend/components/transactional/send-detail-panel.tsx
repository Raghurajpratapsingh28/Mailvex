"use client"

import { TransactionalSend } from "@/lib/transactional-data"
import { SendStatusBadge } from "./status-badges"
import { X, AlertCircle } from "lucide-react"

interface Props {
  send: TransactionalSend
  onClose: () => void
}

export default function SendDetailPanel({ send: s, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col enterprise-card border-none overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#202126] shrink-0">
          <div>
            <span className="text-[10px] text-[#8A8D96] font-medium uppercase tracking-wider">Send Details</span>
            <div className="flex items-center gap-2 mt-0.5">
              <h2 className="text-sm font-semibold text-[#FFFFFF] font-mono">{s.id}</h2>
              <SendStatusBadge status={s.status} />
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-[8px] hover:bg-[#25262B] text-[#8A8D96] hover:text-[#FFFFFF] transition-all cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {(s.status === "failed" || s.status === "bounced") && s.failureReason && (
            <div className="flex items-start gap-3 p-3.5 rounded-[12px] bg-red-500/5 border border-red-500/20">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <p className="text-xs text-red-400 font-medium break-all">{s.failureReason}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Subject", value: s.subject, full: true },
              { label: "Recipient", value: `${s.recipientName} <${s.recipient}>` },
              { label: "Sender", value: `${s.fromName} <${s.fromEmail}>` },
              { label: "Reply To", value: s.replyTo || "—" },
              { label: "Provider Message ID", value: s.providerMessageId || "—", full: true },
              { label: "Idempotency Key", value: s.idempotencyKey || "—", full: true },
              { label: "Sent At", value: s.sentAt ? new Date(s.sentAt).toLocaleString() : "—" },
              { label: "Created At", value: new Date(s.createdAt).toLocaleString() },
              { label: "Updated At", value: new Date(s.updatedAt).toLocaleString() },
            ].map(({ label, value, full }) => (
              <div key={label} className={`p-4 rounded-[12px] bg-[#0D0E12] border border-[#202126] ${full ? "col-span-2" : ""}`}>
                <p className="text-[9px] font-medium text-[#8A8D96] uppercase tracking-wider mb-0.5">{label}</p>
                <p className="text-xs text-[#FFFFFF] font-medium break-all">{value}</p>
              </div>
            ))}
          </div>

          {Object.keys(s.tags).length > 0 && (
            <div className="p-4 rounded-[12px] bg-[#0D0E12] border border-[#202126]">
              <p className="text-[9px] font-medium text-[#8A8D96] uppercase tracking-wider mb-2">Tags</p>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(s.tags).map(([k, v]) => (
                  <span key={k} className="text-[9px] font-medium px-2 py-0.5 bg-transparent border border-[#202126] text-[#8A8D96] rounded-[6px]">
                    {k}: {v}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
