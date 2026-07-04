"use client"

import { useState, useEffect } from "react"
import { Campaign } from "@/lib/campaigns-data"
import { segmentsService } from "@/lib/segments-service"
import { X, ChevronDown, Monitor, Smartphone } from "lucide-react"

interface SegmentOption { id: string; name: string; contactCount: number }

interface Props {
  isOpen: boolean
  onClose: () => void
  campaign?: Campaign | null
  onSave: (data: Partial<Campaign>) => void
  workspaceId: string
}

const EMPTY: Partial<Campaign> = {
  name: "", type: "regular", segmentId: "", segmentName: "",
  fromEmail: "", fromName: "", replyTo: "",
  subject: "", previewText: "", htmlBody: "", plainText: "",
}

export default function CampaignFormModal({ isOpen, onClose, campaign, onSave, workspaceId }: Props) {
  const [form, setForm] = useState<Partial<Campaign>>(EMPTY)
  const [tab, setTab] = useState<"setup" | "sender" | "content" | "preview">("setup")
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop")
  const [nameError, setNameError] = useState("")
  const [segments, setSegments] = useState<SegmentOption[]>([])

  const isScheduled = campaign?.status === "scheduled"
  const readOnly = campaign && !["draft", "scheduled"].includes(campaign.status)

  useEffect(() => {
    if (campaign) setForm({ ...campaign })
    else setForm(EMPTY)
    setTab("setup")
    setNameError("")
  }, [campaign, isOpen])

  // Load real segments when modal opens
  useEffect(() => {
    if (!isOpen || !workspaceId) return
    segmentsService.listSegments(workspaceId, { pageSize: 100 })
      .then((res) => setSegments(res.items.map((s) => ({ id: s.id, name: s.name, contactCount: s.contactCount }))))
      .catch(() => setSegments([]))
  }, [isOpen, workspaceId])

  if (!isOpen) return null

  const set = (k: keyof Campaign, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const handleSegmentChange = (id: string) => {
    const seg = segments.find((s) => s.id === id)
    setForm((f) => ({ ...f, segmentId: id, segmentName: seg?.name ?? "", recipientCount: seg?.contactCount ?? 0 }))
  }

  const handleSave = () => {
    if (!form.name?.trim()) { setNameError("Name is required."); setTab("setup"); return }
    onSave(form)
    onClose()
  }

  const TABS = ["setup", "sender", "content", "preview"] as const

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col bg-[#0F1016] border border-[#1C202C] rounded-3xl shadow-2xl shadow-black/50 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#1C202C] shrink-0">
          <div>
            <span className="text-[10px] text-[#7A8499] font-mono uppercase tracking-wider">
              {campaign ? (isScheduled ? "Edit Campaign (name only)" : "Edit Campaign") : "New Campaign"}
            </span>
            <h2 className="text-sm font-bold text-white mt-0.5">{form.name || "Untitled Campaign"}</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-[#1C1F2D] text-[#7A8499] hover:text-white transition-all cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab nav */}
        <div className="flex border-b border-[#1C202C] shrink-0 px-6">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-3 text-[10px] font-mono font-semibold uppercase tracking-wider transition-colors cursor-pointer border-b-2 -mb-px ${tab === t ? "border-[#6B7280] text-[#9CA3AF]" : "border-transparent text-[#7A8499] hover:text-[#B0B8C8]"}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">

          {tab === "setup" && (
            <div className="space-y-5">
              <Field label="Campaign Name *">
                <input value={form.name ?? ""} onChange={(e) => { set("name", e.target.value); setNameError("") }} placeholder="e.g. Q2 Growth Newsletter" className={inputCls} />
                {nameError && <p className="text-[10px] text-red-400 font-mono mt-1">{nameError}</p>}
              </Field>
              <Field label="Type">
                <SelectWrap value={form.type ?? "regular"} onChange={(v) => set("type", v)} disabled={isScheduled || !!readOnly}>
                  <option value="regular">Regular</option>
                </SelectWrap>
              </Field>
              <Field label="Target Segment">
                <SelectWrap value={form.segmentId ?? ""} onChange={handleSegmentChange} disabled={isScheduled || !!readOnly}>
                  <option value="">Select a segment...</option>
                  {segments.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} ({s.contactCount.toLocaleString()} contacts)</option>
                  ))}
                </SelectWrap>
                {segments.length === 0 && (
                  <p className="text-[10px] text-[#7A8499] font-mono mt-1">No segments found. Create one in Segments first.</p>
                )}
                {form.segmentId && segments.find(s => s.id === form.segmentId)?.contactCount === 0 && (
                  <p className="text-[10px] text-amber-400 font-mono mt-1">⚠ Segment has 0 contacts.</p>
                )}
              </Field>
            </div>
          )}

          {tab === "sender" && (
            <div className="space-y-5">
              <Field label="From Email *">
                <input type="email" value={form.fromEmail ?? ""} onChange={(e) => set("fromEmail", e.target.value)} placeholder="hello@yourdomain.com" disabled={isScheduled || !!readOnly} className={inputCls} />
                <p className="text-[10px] text-[#7A8499] font-mono mt-1">Must be from a verified domain.</p>
              </Field>
              <Field label="From Name *">
                <input value={form.fromName ?? ""} onChange={(e) => set("fromName", e.target.value)} placeholder="e.g. Mailvex Team" disabled={isScheduled || !!readOnly} className={inputCls} />
              </Field>
              <Field label="Reply To (optional)">
                <input type="email" value={form.replyTo ?? ""} onChange={(e) => set("replyTo", e.target.value)} placeholder="e.g. support@company.com" disabled={isScheduled || !!readOnly} className={inputCls} />
              </Field>
            </div>
          )}

          {tab === "content" && (
            <div className="space-y-5">
              <Field label="Subject *">
                <input value={form.subject ?? ""} onChange={(e) => set("subject", e.target.value)} placeholder="e.g. Your Q2 report is here 🚀" disabled={isScheduled || !!readOnly} className={inputCls} />
              </Field>
              <Field label="Preview Text">
                <input value={form.previewText ?? ""} onChange={(e) => set("previewText", e.target.value)} placeholder="Short inbox preview snippet..." disabled={isScheduled || !!readOnly} className={inputCls} />
              </Field>
              <Field label="HTML Body">
                <textarea value={form.htmlBody ?? ""} onChange={(e) => set("htmlBody", e.target.value)} placeholder="<h1>Hello {{firstName}}</h1>..." rows={8} disabled={isScheduled || !!readOnly} className={`${inputCls} font-mono resize-y`} />
              </Field>
              <Field label="Plain Text Fallback">
                <textarea value={form.plainText ?? ""} onChange={(e) => set("plainText", e.target.value)} placeholder="Plain text version..." rows={4} disabled={isScheduled || !!readOnly} className={`${inputCls} font-mono resize-y`} />
              </Field>
            </div>
          )}

          {tab === "preview" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {(["desktop", "mobile"] as const).map((m) => (
                  <button key={m} onClick={() => setPreviewMode(m)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-mono font-semibold transition-all cursor-pointer border ${previewMode === m ? "bg-[#6B7280]/10 border-[#6B7280]/40 text-[#9CA3AF]" : "bg-[#08090C] border-[#1E2230] text-[#7A8499] hover:text-[#B0B8C8]"}`}>
                    {m === "desktop" ? <Monitor className="w-3 h-3" /> : <Smartphone className="w-3 h-3" />}
                    {m}
                  </button>
                ))}
              </div>
              <div className="p-3.5 rounded-2xl bg-[#08090C] border border-[#1E2230] space-y-1">
                <p className="text-[9px] font-mono text-[#7A8499] uppercase">Subject</p>
                <p className="text-xs font-semibold text-white/90">{form.subject || <span className="text-[#7A8499]">No subject</span>}</p>
                {form.previewText && <p className="text-[10px] text-[#B0B8C8]">{form.previewText}</p>}
              </div>
              <div className={`rounded-2xl border border-[#1C202C] overflow-hidden bg-white transition-all ${previewMode === "mobile" ? "max-w-[375px] mx-auto" : "w-full"}`}>
                {form.htmlBody ? (
                  <iframe srcDoc={form.htmlBody} className="w-full h-[320px] border-0" sandbox="allow-same-origin" title="Email preview" />
                ) : (
                  <div className="h-[200px] flex items-center justify-center text-xs text-zinc-400 bg-zinc-900">No HTML content yet</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!readOnly && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#1C202C] shrink-0">
            <button onClick={onClose} className="px-4 py-2 bg-[#12141A] hover:bg-[#1C1F2D] border border-[#1E2230] rounded-xl text-xs font-semibold text-[#B0B8C8] hover:text-white transition-all cursor-pointer">Cancel</button>
            <button onClick={handleSave} className="px-4 py-2 bg-gradient-to-r from-[#6B7280] to-[#6B7280] hover:from-[#4B5563] hover:to-[#374151] text-white rounded-xl text-xs font-semibold shadow-lg shadow-[#6B7280]/15 transition-all cursor-pointer">
              {campaign ? "Save Changes" : "Save as Draft"}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

const inputCls = "w-full px-3.5 py-2.5 bg-[#08090C] border border-[#1E2230] hover:border-[#383E58] focus:border-[#6B7280] rounded-xl text-xs text-white placeholder-[#7A8499] focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-white/80 tracking-tight">{label}</label>
      {children}
    </div>
  )
}

function SelectWrap({ value, onChange, disabled, children }: { value: string; onChange: (v: string) => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <div className="relative">
      <select value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled} className="w-full appearance-none pl-3.5 pr-8 py-2.5 bg-[#08090C] border border-[#1E2230] hover:border-[#383E58] focus:border-[#6B7280] rounded-xl text-xs text-white/90 cursor-pointer focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
        {children}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-[#7A8499] pointer-events-none" />
    </div>
  )
}
