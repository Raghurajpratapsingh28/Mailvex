"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Plus, ChevronDown, AlertTriangle, Loader2 } from "lucide-react"
import { X } from "lucide-react"
import { transactionalService } from "@/lib/transactional-service"
import type { EmailTemplate } from "@/lib/transactional-service"
import { initialTemplates } from "@/lib/transactional-data"

interface Props { workspaceId: string }

export default function SendEmailView({ workspaceId }: Props) {
  const router = useRouter()
  // Merge API templates with built-ins; built-ins shown as local-only for variable filling
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [recipients, setRecipients] = useState<string[]>([])
  const [recipientInput, setRecipientInput] = useState("")
  const [fromEmail, setFromEmail] = useState("")
  const [fromName, setFromName] = useState("")
  const [replyTo, setReplyTo] = useState("")
  const [mode, setMode] = useState<"custom" | "template">("custom")
  const [templateId, setTemplateId] = useState("")
  const [variables, setVariables] = useState<Record<string, string>>({})
  const [subject, setSubject] = useState("")
  const [htmlBody, setHtmlBody] = useState("")
  const [plainText, setPlainText] = useState("")
  const [tags, setTags] = useState<Record<string, string>>({})
  const [tagKey, setTagKey] = useState("")
  const [tagVal, setTagVal] = useState("")
  const [idempotencyKey, setIdempotencyKey] = useState("")
  const [errors, setErrors] = useState<string[]>([])
  const [isSending, setIsSending] = useState(false)

  // Convert built-ins to the same shape as API templates for the picker
  const builtinAsApiTemplates: EmailTemplate[] = initialTemplates.map((t) => ({
    id: t.id,
    name: `${t.name} ✦`,
    subject: t.subject,
    htmlBody: t.htmlBody,
    textBody: t.plainText,
    variables: Object.fromEntries(t.variables.map((v) => [v.name, v.type])),
    status: t.status,
    version: t.version,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  }))

  useEffect(() => {
    transactionalService.getTemplates(workspaceId, { status: "published", pageSize: 100 })
      .then((res) => {
        const apiItems = res.items
        // Remove any built-ins already saved as real templates (matched by name)
        const apiNames = new Set(apiItems.map((t) => t.name))
        const filteredBuiltins = builtinAsApiTemplates.filter((t) => !apiNames.has(t.name.replace(" ✦", "")))
        setTemplates([...apiItems, ...filteredBuiltins])
      })
      .catch(() => setTemplates(builtinAsApiTemplates))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId])

  const selectedTemplate = templates.find((t) => t.id === templateId)
  const isBuiltinSelected = templateId ? initialTemplates.some((t) => t.id === templateId) : false

  const addRecipient = () => {
    const email = recipientInput.trim()
    if (!email || recipients.includes(email) || recipients.length >= 50) return
    setRecipients([...recipients, email])
    setRecipientInput("")
  }

  const handleTemplateChange = (id: string) => {
    setTemplateId(id)
    const tpl = templates.find((t) => t.id === id)
    if (tpl) setVariables(Object.fromEntries(Object.keys(tpl.variables || {}).map((k) => [k, ""])))
  }

  const substituteVars = (html: string, vars: Record<string, string>) =>
    html.replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] ?? `{{${k}}}`)

  const validate = () => {
    const errs: string[] = []
    if (recipients.length === 0) errs.push("At least 1 recipient required.")
    if (!fromEmail.trim()) errs.push("Sender email is required.")
    if (mode === "custom" && !subject.trim()) errs.push("Subject is required.")
    if (mode === "custom" && !htmlBody.trim() && !plainText.trim()) errs.push("HTML body or plain text required.")
    if (mode === "template" && !templateId) errs.push("Select a template.")
    return errs
  }

  const handleSend = async () => {
    const errs = validate()
    if (errs.length) { setErrors(errs); return }
    setIsSending(true)
    try {
      const builtin = mode === "template" && isBuiltinSelected
        ? initialTemplates.find((t) => t.id === templateId) : null

      await transactionalService.sendEmail(workspaceId, {
        to: recipients.map((email) => ({ email })),
        from: { email: fromEmail, name: fromName || undefined },
        replyTo: replyTo || undefined,
        // Built-in templates: substitute vars client-side and send as custom HTML
        subject: builtin
          ? substituteVars(builtin.subject, variables)
          : mode === "template" ? undefined : subject,
        html: builtin
          ? substituteVars(builtin.htmlBody, variables)
          : mode === "template" ? undefined : (htmlBody || undefined),
        text: builtin
          ? substituteVars(builtin.plainText, variables)
          : mode === "template" ? undefined : (plainText || undefined),
        templateId: mode === "template" && !isBuiltinSelected ? templateId : undefined,
        templateData: mode === "template" && !isBuiltinSelected ? variables : undefined,
        tags: Object.keys(tags).length ? tags : undefined,
        idempotencyKey: idempotencyKey || undefined,
      })
      router.push(`/transactional/${workspaceId}`)
    } catch (err: any) {
      setErrors([err?.message ?? "Failed to send email."])
    } finally {
      setIsSending(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6 max-w-[800px] mx-auto select-none">
      <div>
        <button onClick={() => router.push(`/transactional/${workspaceId}`)} className="flex items-center gap-1.5 text-[10px] font-medium text-[#8A8D96] hover:text-[#FFFFFF] transition-colors mb-3 cursor-pointer">
          <ArrowLeft className="w-3 h-3" /> Back
        </button>
        <span className="text-[10px] text-[#8A8D96] font-medium uppercase tracking-wider">Transactional</span>
        <h1 className="text-2xl font-bold tracking-tight text-[#FFFFFF] mt-1">Send Email</h1>
      </div>

      <div className="enterprise-card p-6 space-y-6">
        {errors.length > 0 && (
          <div className="p-3.5 rounded-2xl bg-red-500/5 border border-red-500/20 space-y-1">
            {errors.map((e) => <p key={e} className="text-[10px] text-red-400 font-mono flex items-center gap-1.5"><AlertTriangle className="w-3 h-3" />{e}</p>)}
          </div>
        )}

        <Section label="Recipients (max 50)">
          <div className="flex flex-wrap gap-1.5 p-2.5 bg-[#0D0E12] border border-[#202126] rounded-[12px] min-h-[40px]">
            {recipients.map((r) => (
              <span key={r} className="flex items-center gap-1 text-[10px] font-medium bg-transparent border border-[#202126] text-[#8A8D96] px-2 py-0.5 rounded-[6px]">
                {r}
                <button onClick={() => setRecipients(recipients.filter((x) => x !== r))} className="hover:text-red-400 cursor-pointer"><X className="w-2.5 h-2.5" /></button>
              </span>
            ))}
            <input value={recipientInput} onChange={(e) => setRecipientInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addRecipient())} placeholder={recipients.length === 0 ? "Type email and press Enter..." : ""} className="flex-1 min-w-[160px] bg-transparent text-xs text-[#FFFFFF] placeholder-[#8A8D96] focus:outline-none" />
          </div>
          <p className="text-[9px] text-[#8A8D96] font-medium">{recipients.length}/50 recipients</p>
        </Section>

        <Section label="Sender">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className={lbl}>From Email *</label>
              <input type="email" value={fromEmail} onChange={(e) => setFromEmail(e.target.value)} placeholder="hello@yourdomain.com" className={inp} />
            </div>
            <div className="space-y-1.5">
              <label className={lbl}>From Name</label>
              <input value={fromName} onChange={(e) => setFromName(e.target.value)} placeholder="Acme Team" className={inp} />
            </div>
            <div className="space-y-1.5 col-span-2">
              <label className={lbl}>Reply To</label>
              <input type="email" value={replyTo} onChange={(e) => setReplyTo(e.target.value)} placeholder="support@company.com" className={inp} />
            </div>
          </div>
        </Section>

        <Section label="Content">
          <div className="flex gap-3 mb-4">
            {(["custom", "template"] as const).map((m) => (
              <button key={m} onClick={() => setMode(m)} className={`px-3 py-1.5 rounded-[8px] text-[10px] font-medium font-semibold border transition-all cursor-pointer capitalize ${mode === m ? "bg-[#25262B] border-transparent text-[#FFFFFF]" : "bg-transparent border-transparent text-[#8A8D96] hover:bg-[#25262B] hover:text-[#FFFFFF]"}`}>
                {m === "custom" ? "Write Custom" : "Use Template"}
              </button>
            ))}
          </div>
          {mode === "template" ? (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className={lbl}>Template *</label>
                <Sel value={templateId} onChange={handleTemplateChange}>
                  <option value="">Select template...</option>
                  {templates.map((t) => <option key={t.id} value={t.id}>{t.name} (v{t.version})</option>)}
                </Sel>
              </div>
              {selectedTemplate && Object.keys(selectedTemplate.variables || {}).length > 0 && (
                <div className="space-y-2">
                  <label className={lbl}>Variables</label>
                  {Object.keys(selectedTemplate.variables).map((k) => (
                    <div key={k} className="flex items-center gap-2">
                      <span className="text-[10px] font-medium text-[#8A8D96] w-28 shrink-0">{k}</span>
                      <input value={variables[k] ?? ""} onChange={(e) => setVariables({ ...variables, [k]: e.target.value })} placeholder={`Enter ${k}...`} className={inp} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="space-y-1.5"><label className={lbl}>Subject *</label><input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Email subject..." className={inp} /></div>
              <div className="space-y-1.5"><label className={lbl}>HTML Body</label><textarea value={htmlBody} onChange={(e) => setHtmlBody(e.target.value)} placeholder="<h1>Hello</h1>" rows={5} className={`${inp} font-medium resize-y`} /></div>
              <div className="space-y-1.5"><label className={lbl}>Plain Text</label><textarea value={plainText} onChange={(e) => setPlainText(e.target.value)} placeholder="Plain text fallback..." rows={3} className={`${inp} font-medium resize-y`} /></div>
            </div>
          )}
        </Section>

        <Section label="Options">
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className={lbl}>Tags</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {Object.entries(tags).map(([k, v]) => (
                  <span key={k} className="flex items-center gap-1 text-[9px] font-medium bg-transparent border border-[#202126] text-[#8A8D96] px-2 py-0.5 rounded-[6px]">
                    {k}: {v}
                    <button onClick={() => { const t = { ...tags }; delete t[k]; setTags(t) }} className="hover:text-red-400 cursor-pointer"><X className="w-2.5 h-2.5" /></button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input value={tagKey} onChange={(e) => setTagKey(e.target.value)} placeholder="key" className={`${inp} flex-1`} />
                <input value={tagVal} onChange={(e) => setTagVal(e.target.value)} placeholder="value" className={`${inp} flex-1`} />
                <button onClick={() => { if (tagKey && tagVal) { setTags({ ...tags, [tagKey]: tagVal }); setTagKey(""); setTagVal("") } }} className="px-3 py-2 bg-transparent hover:bg-[#25262B] border-transparent rounded-[8px] text-[#8A8D96] hover:text-[#FFFFFF] transition-all cursor-pointer"><Plus className="w-3.5 h-3.5" /></button>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className={lbl}>Idempotency Key (optional)</label>
              <input value={idempotencyKey} onChange={(e) => setIdempotencyKey(e.target.value)} placeholder="e.g. signup-user-123" className={inp} />
            </div>
          </div>
        </Section>
      </div>

      <div className="flex items-center justify-end gap-3">
        <button onClick={() => router.push(`/transactional/${workspaceId}`)} className="px-4 py-2 bg-transparent hover:bg-[#25262B] border border-transparent rounded-[8px] text-xs font-semibold text-[#8A8D96] hover:text-[#FFFFFF] transition-all cursor-pointer">Cancel</button>
        <button onClick={handleSend} disabled={isSending} className="flex items-center gap-1.5 px-4 py-2 bg-[#696CFF] hover:bg-[#5A5CE6] disabled:opacity-50 text-[#FFFFFF] rounded-[12px] text-xs font-semibold transition-all cursor-pointer">
          {isSending && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Send
        </button>
      </div>
    </motion.div>
  )
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-[#FFFFFF] tracking-tight border-b border-[#202126] pb-1.5">{label}</p>
      {children}
    </div>
  )
}

function Sel({ value, onChange, children }: { value: string; onChange: (v: string) => void; children: React.ReactNode }) {
  return (
    <div className="relative">
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full appearance-none pl-3.5 pr-8 py-2.5 bg-[#0D0E12] border border-[#202126] hover:border-[#8A8D96] focus:border-[#696CFF] rounded-[12px] text-xs text-[#FFFFFF] font-medium cursor-pointer focus:outline-none transition-colors">
        {children}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-[#8A8D96] pointer-events-none" />
    </div>
  )
}

const inp = "w-full px-3.5 py-2.5 bg-[#0D0E12] border border-[#202126] hover:border-[#8A8D96] focus:border-[#696CFF] rounded-[12px] text-xs text-[#FFFFFF] font-medium placeholder-[#8A8D96] focus:outline-none transition-colors"
const lbl = "text-[9px] font-medium font-semibold text-[#8A8D96] uppercase tracking-wider"
