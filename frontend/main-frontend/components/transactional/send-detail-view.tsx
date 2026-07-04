"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, AlertCircle, Loader2 } from "lucide-react"
import { SendStatusBadge } from "./status-badges"
import { transactionalService, type EmailSend } from "@/lib/transactional-service"

interface Props { workspaceId: string; sendId: string }

export default function SendDetailView({ workspaceId, sendId }: Props) {
  const router = useRouter()
  const [send, setSend] = useState<EmailSend | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    transactionalService.getSend(workspaceId, sendId)
      .then(setSend)
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [workspaceId, sendId])

  if (isLoading) return (
    <div className="flex items-center justify-center py-24"><Loader2 className="w-6 h-6 text-[#6B7280] animate-spin" /></div>
  )

  if (!send) return (
    <div className="flex items-center justify-center py-24"><p className="text-sm text-[#8A8D96] font-medium">Send not found.</p></div>
  )

  const s = send

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6 max-w-[700px] mx-auto select-none">
      <div>
        <button onClick={() => router.push(`/transactional/${workspaceId}`)} className="flex items-center gap-1.5 text-[10px] font-medium text-[#8A8D96] hover:text-[#FFFFFF] transition-colors mb-3 cursor-pointer">
          <ArrowLeft className="w-3 h-3" /> Back
        </button>
        <span className="text-[10px] text-[#8A8D96] font-medium uppercase tracking-wider">Send Details</span>
        <div className="flex items-center gap-3 mt-1">
          <h1 className="text-2xl font-bold tracking-tight text-[#FFFFFF] font-mono">{s.sendId.slice(0, 8)}…</h1>
          <SendStatusBadge status={s.status} />
        </div>
      </div>

      <div className="enterprise-card p-6 space-y-4">
        {(s.status === "failed" || s.status === "bounced") && s.failureReason && (
          <div className="flex items-start gap-3 p-3.5 rounded-[12px] bg-red-500/5 border border-red-500/20">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <p className="text-xs text-red-400 font-medium break-all">{s.failureReason}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Send ID", value: s.sendId, full: true },
            { label: "Subject", value: s.subject, full: true },
            { label: "Recipient", value: s.recipientEmail },
            { label: "Sender", value: s.senderEmail },
            { label: "Provider Message ID", value: s.providerMessageId || "—", full: true },
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
                <span key={k} className="text-[9px] font-medium px-2 py-0.5 bg-transparent border border-[#202126] text-[#8A8D96] rounded-[6px]">{k}: {v}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
