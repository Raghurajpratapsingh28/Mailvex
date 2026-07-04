"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { Plus, Search, ChevronDown, ArrowLeft, Loader2 } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import SendsTable from "./sends-table"
import TemplatesTable from "./templates-table"
import { SendStatusBadge, TemplateStatusBadge } from "./status-badges"
import { useTransactional } from "@/lib/redux/useCache"

type Tab = "sends" | "templates"

interface Props { workspaceId?: string }

export default function TransactionalView({ workspaceId: propWorkspaceId }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const workspaceId = propWorkspaceId ?? ""

  const [tab, setTab] = useState<Tab>((searchParams.get("tab") as Tab) ?? "sends")

  const {
    sends, sendsTotal, sendsFilters, sendsLoading,
    templates, templatesTotal, templatesFilters, templatesLoading,
    updateSendsFilters, updateTemplatesFilters,
    handlePublishTemplate, handleDeleteTemplate,
  } = useTransactional(workspaceId || null)

  const filteredSends = useMemo(() => sends.filter((s) => {
    if (sendsFilters.recipient && !s.recipient.toLowerCase().includes(sendsFilters.recipient.toLowerCase())) return false
    if (sendsFilters.status !== "all" && s.status !== sendsFilters.status) return false
    if (sendsFilters.dateFrom && new Date(s.createdAt) < new Date(sendsFilters.dateFrom)) return false
    if (sendsFilters.dateTo && new Date(s.createdAt) > new Date(sendsFilters.dateTo)) return false
    return true
  }), [sends, sendsFilters])

  const filteredTemplates = useMemo(() => {
    let list = templates
    if (templatesFilters.search) list = list.filter((t) => t.name.toLowerCase().includes(templatesFilters.search.toLowerCase()))
    if (templatesFilters.status !== "all") list = list.filter((t) => t.status === templatesFilters.status)
    if (templatesFilters.latestOnly) {
      const seen = new Set<string>()
      list = list.filter((t) => { if (seen.has(t.name)) return false; seen.add(t.name); return true })
    }
    return list
  }, [templates, templatesFilters])

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6 max-w-[1200px] mx-auto select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          {propWorkspaceId && (
            <button onClick={() => router.push("/transactional")} className="flex items-center gap-1.5 text-[10px] font-medium text-[#8A8D96] hover:text-[#FFFFFF] transition-colors mb-3 cursor-pointer">
              <ArrowLeft className="w-3 h-3" /> All Workspaces
            </button>
          )}
          <span className="text-[10px] text-[#8A8D96] font-medium uppercase tracking-wider">Developer API</span>
          <h1 className="text-2xl font-bold tracking-tight text-[#FFFFFF] mt-1">Transactional Emails</h1>
        </div>
        {tab === "sends" ? (
          <button onClick={() => router.push(`/transactional/${workspaceId}/send`)} className="flex items-center gap-1.5 px-3.5 py-2 bg-[#696CFF] hover:bg-[#5A5CE6] text-[#FFFFFF] rounded-[12px] text-xs font-semibold transition-all cursor-pointer">
            <Plus className="w-4 h-4" /> Send Email
          </button>
        ) : (
          <button onClick={() => router.push(`/transactional/${workspaceId}/template`)} className="flex items-center gap-1.5 px-3.5 py-2 bg-[#696CFF] hover:bg-[#5A5CE6] text-[#FFFFFF] rounded-[12px] text-xs font-semibold transition-all cursor-pointer">
            <Plus className="w-4 h-4" /> Create Template
          </button>
        )}
      </div>

      <div className="flex border-b border-[#202126] w-full mb-6">
        {(["sends", "templates"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-5 py-3 text-xs font-medium transition-all capitalize cursor-pointer border-b-2 ${tab === t ? "border-[#696CFF] text-[#FFFFFF]" : "border-transparent text-[#8A8D96] hover:text-[#FFFFFF]"}`}>
            {t}<span className="ml-1.5 text-[9px] font-medium opacity-60">({t === "sends" ? sendsTotal : templatesTotal})</span>
          </button>
        ))}
      </div>

      {tab === "sends" && (
        <>
          <div className="enterprise-card p-4 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8A8D96]" />
              <input
                value={sendsFilters.recipient}
                onChange={(e) => updateSendsFilters({ recipient: e.target.value })}
                placeholder="Search by recipient..."
                className="w-full pl-9 pr-3 py-2 bg-[#0D0E12] border border-[#202126] hover:border-[#8A8D96] focus:border-[#696CFF] rounded-[12px] text-xs text-[#FFFFFF] placeholder-[#8A8D96] focus:outline-none transition-colors"
              />
            </div>
            <Sel value={sendsFilters.status} onChange={(v) => updateSendsFilters({ status: v })}>
              <option value="all">All Statuses</option>
              {["queued", "sending", "sent", "failed", "bounced"].map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </Sel>
            <input type="date" value={sendsFilters.dateFrom} onChange={(e) => updateSendsFilters({ dateFrom: e.target.value })} className={dateCls} />
            <span className="text-[10px] text-[#8A8D96] font-medium">to</span>
            <input type="date" value={sendsFilters.dateTo} onChange={(e) => updateSendsFilters({ dateTo: e.target.value })} className={dateCls} />
            {(sendsFilters.recipient || sendsFilters.status !== "all" || sendsFilters.dateFrom || sendsFilters.dateTo) && (
              <button
                onClick={() => updateSendsFilters({ recipient: '', status: 'all', dateFrom: '', dateTo: '' })}
                className="text-[10px] font-medium text-[#8A8D96] hover:text-[#FFFFFF] cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {(["queued", "sending", "sent", "failed", "bounced"] as const).map((s) => (
              <div key={s} className="enterprise-card p-4 flex items-center justify-between">
                <SendStatusBadge status={s} />
                <span className="text-xl font-semibold text-[#FFFFFF]">{sends.filter((x) => x.status === s).length}</span>
              </div>
            ))}
          </div>

          {sendsLoading ? (
            <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 text-[#6B7280] animate-spin" /></div>
          ) : (
            <>
              <SendsTable sends={filteredSends} onView={(s) => router.push(`/transactional/${workspaceId}/details/${s.id}`)} />
              {filteredSends.length > 0 && <p className="text-[10px] font-medium text-[#8A8D96] px-1">Showing {filteredSends.length} of {sendsTotal} sends</p>}
            </>
          )}
        </>
      )}

      {tab === "templates" && (
        <>
          <div className="enterprise-card p-4 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8A8D96]" />
              <input
                value={templatesFilters.search}
                onChange={(e) => updateTemplatesFilters({ search: e.target.value })}
                placeholder="Search templates..."
                className="w-full pl-9 pr-3 py-2 bg-[#0D0E12] border border-[#202126] hover:border-[#8A8D96] focus:border-[#696CFF] rounded-[12px] text-xs text-[#FFFFFF] placeholder-[#8A8D96] focus:outline-none transition-colors"
              />
            </div>
            <Sel value={templatesFilters.status} onChange={(v) => updateTemplatesFilters({ status: v })}>
              <option value="all">All Statuses</option>
              {["draft", "published", "archived"].map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </Sel>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={templatesFilters.latestOnly} onChange={(e) => updateTemplatesFilters({ latestOnly: e.target.checked })} className="w-3.5 h-3.5 accent-[#696CFF]" />
              <span className="text-[10px] font-medium text-[#8A8D96]">Latest only</span>
            </label>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {(["draft", "published", "archived"] as const).map((s) => (
              <div key={s} className="enterprise-card p-4 flex items-center justify-between">
                <TemplateStatusBadge status={s} />
                <span className="text-xl font-semibold text-[#FFFFFF]">{templates.filter((x) => x.status === s).length}</span>
              </div>
            ))}
          </div>

          {templatesLoading ? (
            <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 text-[#6B7280] animate-spin" /></div>
          ) : (
            <TemplatesTable
              templates={filteredTemplates}
              onView={(t) => router.push(`/transactional/${workspaceId}/template?edit=${t.id}`)}
              onEdit={(t) => router.push(`/transactional/${workspaceId}/template?edit=${t.id}`)}
              onPublish={handlePublishTemplate}
              onDelete={handleDeleteTemplate}
            />
          )}
        </>
      )}
    </motion.div>
  )
}

function Sel({ value, onChange, children }: { value: string; onChange: (v: string) => void; children: React.ReactNode }) {
  return (
    <div className="relative">
      <select value={value} onChange={(e) => onChange(e.target.value)} className="appearance-none pl-3 pr-8 py-2 bg-[#0D0E12] border border-[#202126] hover:border-[#8A8D96] focus:border-[#696CFF] rounded-[12px] text-xs text-[#FFFFFF] font-medium cursor-pointer focus:outline-none transition-colors">
        {children}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[#8A8D96] pointer-events-none" />
    </div>
  )
}

const dateCls = "px-3 py-2 bg-[#0D0E12] border border-[#202126] hover:border-[#8A8D96] focus:border-[#696CFF] rounded-[12px] text-xs text-[#FFFFFF] font-medium focus:outline-none transition-colors cursor-pointer"
