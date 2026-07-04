"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Plus, ChevronDown, Monitor, Smartphone, Loader2 } from "lucide-react"
import { X } from "lucide-react"
import { transactionalService, type EmailTemplate } from "@/lib/transactional-service"
import type { TemplateVariable } from "@/lib/transactional-data"
import { initialTemplates } from "@/lib/transactional-data"

interface Props { workspaceId: string; templateId?: string }

function isBuiltinId(id?: string) {
  return id ? initialTemplates.some((t) => t.id === id) : false
}

type Form = { name: string; subject: string; htmlBody: string; plainText: string; variables: TemplateVariable[] }
const EMPTY: Form = { name: "", subject: "", htmlBody: "", plainText: "", variables: [] }

export default function TemplateEditView({ workspaceId, templateId }: Props) {
  const router = useRouter()
  const [form, setForm] = useState<Form>(EMPTY)
  const [publishNow, setPublishNow] = useState(false)
  const [tab, setTab] = useState<"edit" | "preview">("edit")
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop")
  const [nameError, setNameError] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(!!templateId)

  useEffect(() => {
    if (!templateId) return
    // Check built-in templates first (IDs like tpl-001 won't exist in the API)
    const builtin = initialTemplates.find((t) => t.id === templateId)
    if (builtin) {
      setForm({
        name: builtin.name, subject: builtin.subject, htmlBody: builtin.htmlBody,
        plainText: builtin.plainText, variables: builtin.variables,
      })
      setIsLoading(false)
      return
    }
    transactionalService.getTemplate(workspaceId, templateId)
      .then(({ template: t }) => setForm({
        name: t.name, subject: t.subject, htmlBody: t.htmlBody, plainText: t.textBody,
        variables: Object.entries(t.variables || {}).map(([name, type]) => ({ name, type: type as TemplateVariable["type"] })),
      }))
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [workspaceId, templateId])

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!form.name.trim()) { setNameError("Name is required."); return }
    setIsSaving(true)
    try {
      const payload = {
        subject: form.subject,
        htmlBody: form.htmlBody,
        textBody: form.plainText,
        variables: Object.fromEntries(form.variables.map((v) => [v.name, v.type])),
        publish: publishNow,
      }
      const isBuiltin = templateId && initialTemplates.some((t) => t.id === templateId)
      if (templateId && !isBuiltin) {
        await transactionalService.updateTemplate(workspaceId, templateId, payload)
      } else {
        await transactionalService.createTemplate(workspaceId, { name: form.name, ...payload })
      }
      router.push(`/transactional/${workspaceId}?tab=templates`)
    } catch (err) {
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

  const previewHtml = form.htmlBody.replace(/\{\{(\w+)\}\}/g, (_, k) =>
    `<span style="background:#6B728020;color:#9CA3AF;padding:0 2px;border-radius:3px">{{${k}}}</span>`
  )

  if (isLoading) return (
    <div className="flex items-center justify-center py-24"><Loader2 className="w-6 h-6 text-[#6B7280] animate-spin" /></div>
  )

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6 max-w-[900px] mx-auto select-none">
      <div>
        <button onClick={() => router.push(`/transactional/${workspaceId}?tab=templates`)} className="flex items-center gap-1.5 text-[10px] font-medium text-[#8A8D96] hover:text-[#FFFFFF] transition-colors mb-3 cursor-pointer">
          <ArrowLeft className="w-3 h-3" /> Back
        </button>
        <span className="text-[10px] text-[#8A8D96] font-medium uppercase tracking-wider">Transactional</span>
        <h1 className="text-2xl font-bold tracking-tight text-[#FFFFFF] mt-1">{isBuiltinId(templateId) ? "Use Template" : templateId ? "Edit Template" : "New Template"}</h1>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-[#202126] w-fit gap-0">
        {(["edit", "preview"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-5 py-2.5 text-[10px] font-medium font-medium uppercase tracking-wider transition-colors cursor-pointer border-b-2 -mb-px capitalize ${tab === t ? "border-[#696CFF] text-[#FFFFFF]" : "border-transparent text-[#8A8D96] hover:text-[#FFFFFF]"}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="enterprise-card p-6">
        {tab === "edit" ? (
          <div className="space-y-5">
            <Field label="Name *">
              <input value={form.name} onChange={(e) => { set("name", e.target.value); setNameError("") }} placeholder="e.g. Welcome Email" className={inp} />
              {nameError && <p className="text-[10px] text-red-400 font-medium mt-1">{nameError}</p>}
            </Field>
            <Field label="Subject * (supports {{variable}})">
              <input value={form.subject} onChange={(e) => set("subject", e.target.value)} placeholder="Welcome, {{first_name}}!" className={inp} />
            </Field>
            <Field label="HTML Body (supports {{variable}})">
              <textarea value={form.htmlBody} onChange={(e) => set("htmlBody", e.target.value)} placeholder="<h1>Hello {{first_name}}</h1>" rows={8} className={`${inp} font-medium resize-y`} />
            </Field>
            <Field label="Plain Text Fallback">
              <textarea value={form.plainText} onChange={(e) => set("plainText", e.target.value)} placeholder="Plain text version..." rows={3} className={`${inp} font-medium resize-y`} />
            </Field>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className={lbl}>Variables</label>
                <button onClick={() => set("variables", [...form.variables, { name: "", type: "string" }])} className="flex items-center gap-1 text-[10px] font-medium text-[#8A8D96] hover:text-[#FFFFFF] transition-colors cursor-pointer">
                  <Plus className="w-3 h-3" /> Add
                </button>
              </div>
              {form.variables.length === 0 && <p className="text-[10px] text-[#8A8D96] font-medium">No variables defined.</p>}
              {form.variables.map((v, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input value={v.name} onChange={(e) => set("variables", form.variables.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} placeholder="variable_name" className={`${inp} flex-1 font-medium`} />
                  <div className="relative w-28 shrink-0">
                    <select value={v.type} onChange={(e) => set("variables", form.variables.map((x, j) => j === i ? { ...x, type: e.target.value as TemplateVariable["type"] } : x))} className="w-full appearance-none pl-2.5 pr-7 py-2.5 bg-[#0D0E12] border border-[#202126] hover:border-[#8A8D96] focus:border-[#696CFF] rounded-[12px] text-xs text-[#FFFFFF] font-medium cursor-pointer focus:outline-none transition-colors">
                      <option value="string">string</option>
                      <option value="number">number</option>
                      <option value="boolean">boolean</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[#8A8D96] pointer-events-none" />
                  </div>
                  <button onClick={() => set("variables", form.variables.filter((_, j) => j !== i))} className="p-2 rounded-[8px] hover:bg-red-500/10 text-[#8A8D96] hover:text-red-400 transition-all cursor-pointer"><X className="w-3.5 h-3.5" /></button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {(["desktop", "mobile"] as const).map((m) => (
                <button key={m} onClick={() => setPreviewMode(m)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-[10px] font-medium font-medium border transition-all cursor-pointer ${previewMode === m ? "bg-[#25262B] border-transparent text-[#FFFFFF]" : "bg-transparent border-transparent text-[#8A8D96] hover:bg-[#25262B] hover:text-[#FFFFFF]"}`}>
                  {m === "desktop" ? <Monitor className="w-3 h-3" /> : <Smartphone className="w-3 h-3" />} {m}
                </button>
              ))}
            </div>
            <div className="p-3 rounded-[12px] bg-[#0D0E12] border border-[#202126]">
              <p className="text-[9px] font-medium text-[#8A8D96] uppercase mb-1">Subject</p>
              <p className="text-xs font-semibold text-[#FFFFFF]">{form.subject || <span className="text-[#8A8D96]">No subject</span>}</p>
            </div>
            <div className={`rounded-[12px] border border-[#202126] overflow-hidden bg-white ${previewMode === "mobile" ? "max-w-[375px] mx-auto" : "w-full"}`}>
              {form.htmlBody
                ? <iframe srcDoc={previewHtml} className="w-full h-[360px] border-0" sandbox="allow-same-origin" title="Preview" />
                : <div className="h-[160px] flex items-center justify-center text-xs text-zinc-400 bg-zinc-900">No HTML content</div>
              }
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={publishNow} onChange={(e) => setPublishNow(e.target.checked)} className="w-3.5 h-3.5 accent-[#696CFF]" />
          <span className="text-[10px] font-medium text-[#8A8D96]">Publish immediately</span>
        </label>
        <div className="flex items-center gap-3">
          <button onClick={() => router.push(`/transactional/${workspaceId}?tab=templates`)} className="px-4 py-2 bg-transparent hover:bg-[#25262B] border border-transparent rounded-[8px] text-xs font-semibold text-[#8A8D96] hover:text-[#FFFFFF] transition-all cursor-pointer">Cancel</button>
          <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-1.5 px-4 py-2 bg-[#696CFF] hover:bg-[#5A5CE6] disabled:opacity-50 text-[#FFFFFF] rounded-[12px] text-xs font-semibold shadow-none transition-all cursor-pointer">
            {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {isBuiltinId(templateId) ? "Save as My Template" : templateId ? "Save Changes" : "Create Template"}
          </button>
        </div>
      </div>
    </motion.div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><label className={lbl}>{label}</label>{children}</div>
}

const inp = "w-full px-3.5 py-2.5 bg-[#0D0E12] border border-[#202126] hover:border-[#8A8D96] focus:border-[#696CFF] rounded-[12px] text-xs text-[#FFFFFF] font-medium placeholder-[#8A8D96] focus:outline-none transition-colors"
const lbl = "text-[9px] font-medium font-semibold text-[#8A8D96] uppercase tracking-wider block"
