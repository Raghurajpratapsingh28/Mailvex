"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, ChevronDown, Monitor, Smartphone, Loader2 } from "lucide-react"
import { campaignsService } from "@/lib/campaigns-service"
import { toast } from "sonner"
import { segmentsService } from "@/lib/segments-service"
import type { Campaign } from "@/lib/campaigns-data"

interface Props { workspaceId: string; campaignId?: string }
interface SegmentOption { id: string; name: string; contactCount: number }

const EMPTY: Partial<Campaign> = {
  name: "", segmentId: "", segmentName: "",
  fromEmail: "", fromName: "", replyTo: "",
  subject: "", previewText: "", htmlBody: "", plainText: "",
}

export default function CampaignFormView({ workspaceId, campaignId }: Props) {
  const router = useRouter()
  const [form, setForm] = useState<Partial<Campaign>>(EMPTY)
  const [tab, setTab] = useState<"setup" | "sender" | "content" | "preview">("setup")
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop")
  const [segments, setSegments] = useState<SegmentOption[]>([])
  const [nameError, setNameError] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(!!campaignId)

  useEffect(() => {
    segmentsService.listSegments(workspaceId, { pageSize: 100 })
      .then((res) => setSegments(res.items.map((s) => ({ id: s.id, name: s.name, contactCount: s.contactCount }))))
      .catch(console.error)
  }, [workspaceId])

  useEffect(() => {
    if (!campaignId) return
    campaignsService.get(workspaceId, campaignId)
      .then((c) => setForm({ ...c }))
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [workspaceId, campaignId])

  const set = (k: keyof Campaign, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const handleSegmentChange = (id: string) => {
    const seg = segments.find((s) => s.id === id)
    setForm((f) => ({ ...f, segmentId: id, segmentName: seg?.name ?? "", recipientCount: seg?.contactCount ?? 0 }))
  }

  const handleSave = async (andSend = false) => {
    if (!form.name?.trim()) { setNameError("Name is required."); setTab("setup"); return }
    setIsSaving(true)
    try {
      if (campaignId) {
        await campaignsService.update(workspaceId, campaignId, {
          name: form.name,
          subject: form.subject || undefined,
          previewText: form.previewText || undefined,
          from: form.fromEmail ? { email: form.fromEmail, name: form.fromName || undefined } : undefined,
          replyTo: form.replyTo || undefined,
          html: form.htmlBody || undefined,
          text: form.plainText || undefined,
          segmentId: form.segmentId || undefined,
          version: form.version ?? 1,
        })
      } else {
        const created = await campaignsService.create(workspaceId, {
          name: form.name!, type: "regular",
          subject: form.subject || undefined,
          previewText: form.previewText || undefined,
          from: form.fromEmail ? { email: form.fromEmail, name: form.fromName || undefined } : undefined,
          replyTo: form.replyTo || undefined,
          html: form.htmlBody || undefined,
          text: form.plainText || undefined,
          segmentId: form.segmentId || undefined,
        })
        if (andSend) await campaignsService.send(workspaceId, created.id)
      }
      router.push(`/campaigns/${workspaceId}`)
    } catch (err: any) {
      toast.error(err.message || "Failed to save campaign")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) return (
    <div className="flex items-center justify-center py-24"><Loader2 className="w-6 h-6 text-[#6B7280] animate-spin" /></div>
  )

  const TABS = ["setup", "sender", "content", "preview"] as const

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6 max-w-[800px] mx-auto select-none">
      <div>
        <button onClick={() => router.push(`/campaigns/${workspaceId}`)} className="flex items-center gap-1.5 text-[10px] font-medium text-[#8A8D96] hover:text-[#FFFFFF] transition-colors mb-3 cursor-pointer">
          <ArrowLeft className="w-3 h-3" /> Back to Campaigns
        </button>
        <span className="text-[10px] text-[#8A8D96] font-medium uppercase tracking-wider">Broadcasts Dispatch</span>
        <h1 className="text-2xl font-bold tracking-tight text-[#FFFFFF] mt-1">{campaignId ? "Edit Campaign" : "New Campaign"}</h1>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-[#202126] gap-0">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-5 py-2.5 text-[10px] font-medium uppercase tracking-wider transition-colors cursor-pointer border-b-2 -mb-px capitalize ${tab === t ? "border-[#696CFF] text-[#FFFFFF]" : "border-transparent text-[#8A8D96] hover:text-[#FFFFFF]"}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="enterprise-card p-6">
        {tab === "setup" && (
          <div className="space-y-5">
            <Field label="Campaign Name *">
              <input value={form.name ?? ""} onChange={(e) => { set("name", e.target.value); setNameError("") }} placeholder="e.g. Q2 Growth Newsletter" className={inp} />
              {nameError && <p className="text-[10px] text-red-400 font-mono mt-1">{nameError}</p>}
            </Field>
            <Field label="Target Segment">
              <Sel value={form.segmentId ?? ""} onChange={handleSegmentChange}>
                <option value="">Select a segment...</option>
                {segments.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.contactCount.toLocaleString()} contacts)</option>)}
              </Sel>
              {segments.length === 0 && <p className="text-[10px] text-[#8A8D96] font-medium mt-1">No segments found. Create one in Segments first.</p>}
            </Field>
          </div>
        )}

        {tab === "sender" && (
          <div className="space-y-5">
            <Field label="From Email *">
              <input type="email" value={form.fromEmail ?? ""} onChange={(e) => set("fromEmail", e.target.value)} placeholder="hello@yourdomain.com" className={inp} />
              <p className="text-[10px] text-[#8A8D96] font-medium mt-1">Must be from a verified domain.</p>
            </Field>
            <Field label="From Name">
              <input value={form.fromName ?? ""} onChange={(e) => set("fromName", e.target.value)} placeholder="e.g. Acme Team" className={inp} />
            </Field>
            <Field label="Reply To (optional)">
              <input type="email" value={form.replyTo ?? ""} onChange={(e) => set("replyTo", e.target.value)} placeholder="support@company.com" className={inp} />
            </Field>
          </div>
        )}

        {tab === "content" && (
          <div className="space-y-5">
            <Field label="Subject *">
              <input value={form.subject ?? ""} onChange={(e) => set("subject", e.target.value)} placeholder="e.g. Your Q2 report is here 🚀" className={inp} />
            </Field>
            <Field label="Preview Text">
              <input value={form.previewText ?? ""} onChange={(e) => set("previewText", e.target.value)} placeholder="Short inbox preview snippet..." className={inp} />
            </Field>
            <Field label="HTML Body">
              <textarea value={form.htmlBody ?? ""} onChange={(e) => set("htmlBody", e.target.value)} placeholder="<h1>Hello {{firstName}}</h1>" rows={8} className={`${inp} font-mono resize-y`} />
            </Field>
            <Field label="Plain Text Fallback">
              <textarea value={form.plainText ?? ""} onChange={(e) => set("plainText", e.target.value)} placeholder="Plain text version..." rows={4} className={`${inp} font-mono resize-y`} />
            </Field>
          </div>
        )}

        {tab === "preview" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {(["desktop", "mobile"] as const).map((m) => (
                <button key={m} onClick={() => setPreviewMode(m)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-[10px] font-medium transition-all cursor-pointer border ${previewMode === m ? "bg-[#696CFF]/10 border-[#696CFF]/40 text-[#696CFF]" : "bg-[#0D0E12] border-[#202126] text-[#8A8D96] hover:text-[#FFFFFF]"}`}>
                  {m === "desktop" ? <Monitor className="w-3 h-3" /> : <Smartphone className="w-3 h-3" />} {m}
                </button>
              ))}
            </div>
            <div className="p-3.5 rounded-[12px] bg-[#0D0E12] border border-[#202126] space-y-1">
              <p className="text-[9px] font-medium text-[#8A8D96] uppercase">Subject</p>
              <p className="text-xs font-semibold text-[#FFFFFF]">{form.subject || <span className="text-[#8A8D96]">No subject</span>}</p>
              {form.previewText && <p className="text-[10px] text-[#8A8D96]">{form.previewText}</p>}
            </div>
            <div className={`rounded-[12px] border border-[#202126] overflow-hidden bg-white ${previewMode === "mobile" ? "max-w-[375px] mx-auto" : "w-full"}`}>
              {form.htmlBody
                ? <iframe srcDoc={form.htmlBody} className="w-full h-[320px] border-0" sandbox="allow-same-origin" title="Preview" />
                : <div className="h-[200px] flex items-center justify-center text-xs text-[#8A8D96] bg-[#18191C]">No HTML content yet</div>
              }
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-3">
        <button onClick={() => router.push(`/campaigns/${workspaceId}`)} className="px-4 py-2 bg-transparent hover:bg-[#25262B] border border-transparent rounded-[8px] text-xs font-semibold text-[#8A8D96] hover:text-[#FFFFFF] transition-all cursor-pointer">Cancel</button>
        {campaignId ? (
          <button onClick={() => handleSave()} disabled={isSaving} className="flex items-center gap-1.5 px-4 py-2 bg-[#696CFF] hover:bg-[#5A5CE6] disabled:opacity-50 text-[#FFFFFF] rounded-[12px] text-xs font-semibold transition-all cursor-pointer">
            {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Save Changes
          </button>
        ) : (
          <>
            <button onClick={() => handleSave(false)} disabled={isSaving} className="flex items-center gap-1.5 px-4 py-2 bg-transparent hover:bg-[#25262B] border border-transparent rounded-[8px] text-xs font-semibold text-[#8A8D96] hover:text-[#FFFFFF] disabled:opacity-50 transition-all cursor-pointer">
              {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Save as Draft
            </button>
            <button onClick={() => handleSave(true)} disabled={isSaving} className="flex items-center gap-1.5 px-4 py-2 bg-[#696CFF] hover:bg-[#5A5CE6] disabled:opacity-50 text-[#FFFFFF] rounded-[12px] text-xs font-semibold transition-all cursor-pointer">
              {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Send Now
            </button>
          </>
        )}
      </div>
    </motion.div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><label className="text-xs font-semibold text-[#8A8D96] tracking-tight">{label}</label>{children}</div>
}

function Sel({ value, onChange, children }: { value: string; onChange: (v: string) => void; children: React.ReactNode }) {
  return (
    <div className="relative">
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full appearance-none pl-3.5 pr-8 py-2.5 bg-[#0D0E12] border border-[#202126] hover:border-[#8A8D96] focus:border-[#696CFF] rounded-[12px] text-xs text-[#FFFFFF] cursor-pointer focus:outline-none transition-colors">
        {children}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-[#8A8D96] pointer-events-none" />
    </div>
  )
}

const inp = "w-full px-3.5 py-2.5 bg-[#0D0E12] border border-[#202126] hover:border-[#8A8D96] focus:border-[#696CFF] rounded-[12px] text-xs text-[#FFFFFF] placeholder-[#8A8D96] focus:outline-none transition-colors"
