"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, RefreshCw, Trash2, CheckCircle2, AlertTriangle, Info, Loader2 } from "lucide-react"
import DomainStatusBadge from "./domain-status-badge"
import DnsRecordsTable from "./dns-records-table"
import { domainsService, type ApiDomain } from "@/lib/domains-service"
import { toast } from "sonner"

interface Props { workspaceId: string; domainId: string }

const STEPS = ["Add Domain", "Publish DNS Records", "Verification", "Ready to Send"]

function stepIndex(status: ApiDomain["status"]): number {
  return { pending: 1, verifying: 2, verified: 3, failed: 2, deleting: 0, deleted: 0 }[status] ?? 0
}

export default function DomainDetailPage({ workspaceId, domainId }: Props) {
  const router = useRouter()
  const [domain, setDomain] = useState<ApiDomain | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isReverifying, setIsReverifying] = useState(false)

  const load = useCallback(async () => {
    try { setDomain(await domainsService.get(workspaceId, domainId)) }
    catch (err) { console.error(err) }
    finally { setIsLoading(false) }
  }, [workspaceId, domainId])

  useEffect(() => { load() }, [load])

  const handleReverify = async () => {
    if (!domain) return
    setIsReverifying(true)
    try {
      await domainsService.verify(workspaceId, domain.id)
      await load()
    } catch (e: any) { toast.error(e.message) }
    finally { setIsReverifying(false) }
  }

  const handleDelete = async () => {
    if (!domain || !window.confirm(`Delete domain "${domain.domain}"?\n\nThis will remove the SES identity and prevent sending from this domain.`)) return
    try { await domainsService.delete(workspaceId, domain.id); router.push(`/domains/${workspaceId}`) }
    catch (e: any) { toast.error(e.message) }
  }

  if (isLoading) return <div className="flex items-center justify-center py-24"><Loader2 className="w-6 h-6 text-[#8A8D96] animate-spin" /></div>
  if (!domain) return <div className="flex items-center justify-center py-24"><p className="text-sm text-[#8A8D96] font-medium">Domain not found.</p></div>

  const d = domain
  const activeStep = stepIndex(d.status)

  const BANNER: Partial<Record<ApiDomain["status"], { icon: React.ElementType; cls: string; msg: string }>> = {
    verifying: { icon: Info, cls: "bg-blue-500/5 border-blue-500/20 text-blue-400", msg: "Verification in progress. Publish the DNS records below and wait up to 72 hours for propagation." },
    pending: { icon: Info, cls: "bg-zinc-500/5 border-zinc-500/20 text-zinc-400", msg: "Domain added. Publish the DNS records below to begin verification." },
    verified: { icon: CheckCircle2, cls: "bg-emerald-500/5 border-emerald-500/20 text-emerald-400", msg: "Domain verified and ready to send. You can now use this domain as a sender." },
    failed: { icon: AlertTriangle, cls: "bg-red-500/5 border-red-500/20 text-red-400", msg: "Verification failed. Ensure DNS records are published correctly, then click Re-verify." },
  }
  const banner = BANNER[d.status]

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6 max-w-[1400px] mx-auto select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <button onClick={() => router.push(`/domains/${workspaceId}`)} className="flex items-center gap-1.5 text-[10px] font-medium text-[#8A8D96] hover:text-[#FFFFFF] transition-colors mb-3 cursor-pointer">
            <ArrowLeft className="w-3 h-3" /> Back to Domains
          </button>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-bold tracking-tight text-[#FFFFFF]">{d.domain}</h1>
            <DomainStatusBadge status={d.status as any} />
          </div>
          <p className="text-[10px] font-medium text-[#8A8D96] mt-1.5 uppercase tracking-wider">ID: {d.id}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {d.status !== "verified" && d.status !== "deleting" && d.status !== "deleted" && (
            <button onClick={handleReverify} disabled={isReverifying} className="flex items-center gap-1.5 px-3.5 py-2 bg-transparent hover:bg-[#25262B] border border-[#202126] hover:border-[#8A8D96] rounded-[12px] text-xs font-semibold text-[#8A8D96] hover:text-[#FFFFFF] disabled:opacity-50 transition-all cursor-pointer">
              <RefreshCw className={`w-3.5 h-3.5 ${isReverifying ? "animate-spin" : ""}`} /> Re-verify
            </button>
          )}
          {d.status !== "deleting" && d.status !== "deleted" && (
            <button onClick={handleDelete} className="flex items-center gap-1.5 px-3.5 py-2 bg-transparent hover:bg-[#25262B] border border-red-500/25 hover:border-red-500/50 rounded-[12px] text-xs font-semibold text-[#FF5A4F] transition-all cursor-pointer">
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          )}
        </div>
      </div>

      {/* Status banner */}
      {banner && (
        <div className={`flex items-start gap-3 p-4 rounded-2xl border ${banner.cls}`}>
          <banner.icon className="w-4 h-4 shrink-0 mt-0.5" />
          <p className="text-xs leading-relaxed">{banner.msg}</p>
        </div>
      )}

      {/* Progress stepper */}
      <div className="p-5 enterprise-card">
        <h3 className="text-xs font-semibold text-[#FFFFFF] tracking-tight mb-4">Setup Progress</h3>
        <div className="flex items-center">
          {STEPS.map((step, idx) => {
            const done = idx < activeStep
            const active = idx === activeStep
            const failed = d.status === "failed" && idx === 2
            return (
              <div key={step} className="flex items-center flex-1 min-w-0">
                <div className="flex flex-col items-center gap-1.5 flex-1">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all ${
                    failed ? "border-[#FF5A4F] bg-[#FF5A4F]/10 text-[#FF5A4F]" :
                    done ? "border-[#3CD3AD] bg-[#3CD3AD]/10 text-[#3CD3AD]" :
                    active ? "border-[#696CFF] bg-[#696CFF]/10 text-[#696CFF]" :
                    "border-[#202126] bg-[#0D0E12] text-[#8A8D96]"
                  }`}>
                    {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                  </div>
                  <span className={`text-[9px] font-medium text-center uppercase tracking-wider leading-tight ${
                    failed ? "text-[#FF5A4F]" : done ? "text-[#3CD3AD]" : active ? "text-[#696CFF]" : "text-[#8A8D96]"
                  }`}>{step}</span>
                </div>
                {idx < STEPS.length - 1 && <div className={`h-px flex-1 mx-1 mb-5 ${done ? "bg-[#3CD3AD]/40" : "bg-[#202126]"}`} />}
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* DNS Records */}
        <div className="xl:col-span-2 p-6 enterprise-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-[#FFFFFF] tracking-tight">DNS Records to Publish</h3>
            <span className="text-[9px] font-medium uppercase tracking-wider text-[#8A8D96]">Add these to your DNS provider</span>
          </div>
          {d.dns ? <DnsRecordsTable dns={d.dns} /> : <p className="text-xs text-[#8A8D96] font-medium">DNS records not available.</p>}
        </div>

        {/* Verification status */}
        <div className="p-6 enterprise-card h-fit space-y-4">
          <h3 className="text-xs font-semibold text-[#FFFFFF] tracking-tight">Verification Details</h3>
          {[
            { label: "Status", value: <DomainStatusBadge status={d.status as any} /> },
            { label: "SES Identity", value: d.sesIdentity },
            { label: "Verification Started", value: d.verificationStartedAt ? new Date(d.verificationStartedAt).toLocaleString() : "—" },
            { label: "Verification Attempts", value: String(d.verificationAttempts) },
            { label: "Verified At", value: d.verifiedAt ? new Date(d.verifiedAt).toLocaleString() : "—" },
            { label: "Version", value: String(d.version) },
            { label: "Created", value: new Date(d.createdAt).toLocaleString() },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-[9px] font-medium text-[#8A8D96] uppercase tracking-wider mb-0.5">{label}</p>
              {typeof value === "string"
                ? <p className="text-xs text-[#FFFFFF] font-medium break-all">{value}</p>
                : value}
            </div>
          ))}

          {/* DKIM tokens */}
          {d.dkimTokens?.length > 0 && (
            <div>
              <p className="text-[9px] font-medium text-[#8A8D96] uppercase tracking-wider mb-1.5">DKIM Tokens</p>
              <div className="space-y-1">
                {d.dkimTokens.map((t) => (
                  <p key={t} className="text-[10px] font-medium text-[#FFFFFF] bg-[#25262B] border border-[#202126] px-2 py-1 rounded-[8px] break-all">{t}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
