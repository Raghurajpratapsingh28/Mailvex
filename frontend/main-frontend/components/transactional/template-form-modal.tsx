"use client"

import { useState, useEffect } from "react"
import { EmailTemplate, TemplateVariable } from "@/lib/transactional-data"
import { X, Plus, Monitor, Smartphone, ChevronDown } from "lucide-react"

interface Props {
  isOpen: boolean
  onClose: () => void
  template?: EmailTemplate | null
  onSave: (data: Partial<EmailTemplate> & { publishNow: boolean }) => void
}

const EMPTY = { name: "", subject: "", htmlBody: "", plainText: "", variables: [] as TemplateVariable[], publishNow: false }

export default function TemplateFormModal({ isOpen, onClose, template, onSave }: Props) {
  const [form, setForm] = useState(EMPTY)
  const [publishNow, setPublishNow] = useState(false)
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop")
  const [tab, setTab] = useState<"edit" | "preview">("edit")
  const [nameError, setNameError] = useState("")

  useEffect(() => {
    if (template) setForm({ name: template.name, subject: template.subject, htmlBody: template.htmlBody, plainText: template.plainText, variables: template.variables, publishNow: false })
    else setForm(EMPTY)
    setPublishNow(false)
    setTab("edit")
    setNameError("")
  }, [template, isOpen])

  if (!isOpen) return null

  const set = <K extends keyof typeof EMPTY>(k: K, v: typeof EMPTY[K]) => setForm((f) => ({ ...f, [k]: v }))

  const addVar = () => set("variables", [...form.variables, { name: "", type: "string" as const }])
  const removeVar = (i: number) => set("variables", form.variables.filter((_, idx) => idx !== i))
  const updateVar = (i: number, patch: Partial<TemplateVariable>) =>
    set("variables", form.variables.map((v, idx) => idx === i ? { ...v, ...patch } : v))

  const handleSave = () => {
    if (!form.name.trim()) { setNameError("Name is required."); return }
    onSave({ ...form, publishNow })
    onClose()
  }

  // Live preview: replace {{var}} with sample values
  const previewHtml = form.htmlBody.replace(/\{\{(\w+)\}\}/g, (_, k) => {
    const v = form.variables.find((x) => x.name === k)
    return v ? `<span style="background:#6B728020;color:#9CA3AF;padding:0 2px;border-radius:3px">{{${k}}}</span>` : `{{${k}}}`
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col enterprise-card border-none overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#202126] shrink-0">
          <div>
            <span className="text-[10px] text-[#8A8D96] font-medium uppercase tracking-wider">
              {template ? (template.status === "published" ? "Edit (creates new draft)" : "Edit Template") : "New Template"}
            </span>
            <h2 className="text-sm font-semibold text-[#FFFFFF] mt-0.5">{form.name || "Untitled Template"}</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-[8px] hover:bg-[#25262B] text-[#8A8D96] hover:text-[#FFFFFF] transition-all cursor-pointer"><X className="w-4 h-4" /></button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#202126] shrink-0 px-6">
          {(["edit", "preview"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-3 text-[10px] font-medium font-medium uppercase tracking-wider transition-colors cursor-pointer border-b-2 -mb-px capitalize ${tab === t ? "border-[#696CFF] text-[#FFFFFF]" : "border-transparent text-[#8A8D96] hover:text-[#FFFFFF]"}`}>
              {t}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {tab === "edit" ? (
            <div className="space-y-5">
              <Field label="Name *">
                <input value={form.name} onChange={(e) => { set("name", e.target.value); setNameError("") }} placeholder="e.g. Welcome Email" className={inputCls} />
                {nameError && <p className="text-[10px] text-red-400 font-medium mt-1">{nameError}</p>}
              </Field>
              <Field label="Subject * (supports {{variable}})">
                <input value={form.subject} onChange={(e) => set("subject", e.target.value)} placeholder="Welcome to Mailvex, {{first_name}}!" className={inputCls} />
              </Field>
              <Field label="HTML Body * (supports {{variable}})">
                <textarea value={form.htmlBody} onChange={(e) => set("htmlBody", e.target.value)} placeholder="<h1>Hello {{first_name}}</h1>" rows={7} className={`${inputCls} font-medium resize-y`} />
              </Field>
              <Field label="Plain Text Fallback">
                <textarea value={form.plainText} onChange={(e) => set("plainText", e.target.value)} placeholder="Plain text version..." rows={3} className={`${inputCls} font-medium resize-y`} />
              </Field>

              {/* Variables */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className={labelCls}>Variables</label>
                  <button onClick={addVar} className="flex items-center gap-1 text-[10px] font-medium text-[#8A8D96] hover:text-[#FFFFFF] transition-colors cursor-pointer">
                    <Plus className="w-3 h-3" /> Add
                  </button>
                </div>
                {form.variables.length === 0 && <p className="text-[10px] text-[#8A8D96] font-medium">No variables defined.</p>}
                {form.variables.map((v, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input value={v.name} onChange={(e) => updateVar(i, { name: e.target.value })} placeholder="variable_name" className={`${inputCls} flex-1 font-medium`} />
                    <div className="relative w-28 shrink-0">
                      <select value={v.type} onChange={(e) => updateVar(i, { type: e.target.value as TemplateVariable["type"] })} className="w-full appearance-none pl-2.5 pr-7 py-2.5 bg-[#0D0E12] border border-[#202126] hover:border-[#8A8D96] focus:border-[#696CFF] rounded-[12px] text-xs text-[#FFFFFF] font-medium cursor-pointer focus:outline-none transition-colors">
                        <option value="string">string</option>
                        <option value="number">number</option>
                        <option value="boolean">boolean</option>
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[#8A8D96] pointer-events-none" />
                    </div>
                    <button onClick={() => removeVar(i)} className="p-2 rounded-[8px] hover:bg-red-500/10 text-[#8A8D96] hover:text-red-400 transition-all cursor-pointer"><X className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {(["desktop", "mobile"] as const).map((m) => (
                  <button key={m} onClick={() => setPreviewMode(m)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-[10px] font-medium font-medium border transition-all cursor-pointer ${previewMode === m ? "bg-[#25262B] border-transparent text-[#FFFFFF]" : "bg-transparent border-transparent text-[#8A8D96] hover:bg-[#25262B] hover:text-[#FFFFFF]"}`}>
                    {m === "desktop" ? <Monitor className="w-3 h-3" /> : <Smartphone className="w-3 h-3" />}
                    {m}
                  </button>
                ))}
              </div>
              <div className="p-3 rounded-[12px] bg-[#0D0E12] border border-[#202126]">
                <p className="text-[9px] font-medium text-[#8A8D96] uppercase mb-1">Subject</p>
                <p className="text-xs font-semibold text-[#FFFFFF]">{form.subject || <span className="text-[#8A8D96]">No subject</span>}</p>
              </div>
              <div className={`rounded-[12px] border border-[#202126] overflow-hidden bg-white ${previewMode === "mobile" ? "max-w-[375px] mx-auto" : "w-full"}`}>
                {form.htmlBody ? (
                  <iframe srcDoc={previewHtml} className="w-full h-[320px] border-0" sandbox="allow-same-origin" title="Template preview" />
                ) : (
                  <div className="h-[160px] flex items-center justify-center text-xs text-zinc-400 bg-zinc-900">No HTML content</div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-[#202126] shrink-0">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={publishNow} onChange={(e) => setPublishNow(e.target.checked)} className="w-3.5 h-3.5 accent-[#696CFF]" />
            <span className="text-[10px] font-medium text-[#8A8D96]">Publish immediately</span>
          </label>
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="px-4 py-2 bg-transparent hover:bg-[#25262B] border border-transparent rounded-[8px] text-xs font-semibold text-[#8A8D96] hover:text-[#FFFFFF] transition-all cursor-pointer">Cancel</button>
            <button onClick={handleSave} className="px-4 py-2 bg-[#696CFF] hover:bg-[#5A5CE6] text-[#FFFFFF] rounded-[12px] text-xs font-semibold shadow-none transition-all cursor-pointer">
              {template ? "Save Changes" : "Create Template"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><label className={labelCls}>{label}</label>{children}</div>
}

const inputCls = "w-full px-3.5 py-2.5 bg-[#0D0E12] border border-[#202126] hover:border-[#8A8D96] focus:border-[#696CFF] rounded-[12px] text-xs text-[#FFFFFF] font-medium placeholder-[#8A8D96] focus:outline-none transition-colors"
const labelCls = "text-[9px] font-medium font-semibold text-[#8A8D96] uppercase tracking-wider block"
