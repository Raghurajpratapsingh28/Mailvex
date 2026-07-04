"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { useShortcut } from "@/lib/keyboard-shortcuts"
import { Plus, ArrowLeft, ChevronDown, Loader2 } from "lucide-react"
import DomainsTable from "./domains-table"
import AddDomainModal from "./add-domain-modal"
import { domainsService, type ApiDomain } from "@/lib/domains-service"
import { toast } from "sonner"
import { useDomains } from "@/lib/redux/useCache"

interface Props { workspaceId: string }

export default function DomainsView({ workspaceId }: Props) {
  const router = useRouter()
  const { domains, total, filters, loading, updateFilters, add, remove, refetch } = useDomains(workspaceId)

  const [addOpen, setAddOpen] = useState(false)
  useShortcut("n", () => setAddOpen(true))

  const handleReverify = async (d: ApiDomain) => {
    try {
      await domainsService.verify(workspaceId, d.id)
      refetch()
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  const handleDelete = async (d: ApiDomain) => {
    if (!window.confirm(`Delete domain "${d.domain}"?\n\nThis will remove the SES identity and prevent sending from this domain.`)) return
    try {
      await domainsService.delete(workspaceId, d.id)
      remove(d.id)
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  const handleAdded = (d: ApiDomain) => {
    add(d)
    setAddOpen(false)
    router.push(`/domains/${workspaceId}/${d.id}`)
  }

  const COUNTS = {
    total,
    verified: domains.filter(d => d.status === "verified").length,
    verifying: domains.filter(d => d.status === "verifying" || d.status === "pending").length,
    failed: domains.filter(d => d.status === "failed").length,
  }

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6 max-w-[1500px] mx-auto select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button onClick={() => router.push("/domains")} className="flex items-center gap-1.5 text-[10px] font-medium text-[#8A8D96] hover:text-[#FFFFFF] transition-colors mb-3 cursor-pointer">
            <ArrowLeft className="w-3 h-3" /> All Workspaces
          </button>
          <span className="text-[10px] text-[#8A8D96] font-medium uppercase tracking-wider">Email Infrastructure</span>
          <div className="flex items-center gap-3 mt-1.5">
            <h1 className="text-3xl font-extrabold tracking-tight text-[#FFFFFF] leading-none">Domains</h1>
            <div className="flex items-baseline gap-1 bg-[#18191C] border border-[#202126] px-2.5 py-0.5 rounded-full text-xs font-bold text-[#3CD3AD]">
              <span>{total}</span><span className="text-[9px] text-[#8A8D96] font-normal uppercase">Total</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={filters.status}
              onChange={(e) => updateFilters({ status: e.target.value })}
              className="appearance-none pl-3 pr-8 py-2 bg-[#0D0E12] border border-[#202126] hover:border-[#8A8D96] focus:border-[#3CD3AD] rounded-[12px] text-xs text-[#FFFFFF] font-medium cursor-pointer focus:outline-none transition-colors"
            >
              <option value="all">All Statuses</option>
              {["pending", "verifying", "verified", "failed"].map(s => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[#8A8D96] pointer-events-none" />
          </div>
          <button onClick={() => setAddOpen(true)} className="flex items-center gap-1.5 px-3.5 py-2 bg-[#696CFF] hover:bg-[#5A5CE6] text-[#FFFFFF] font-bold rounded-[12px] text-xs transition-all cursor-pointer">
            <Plus className="w-4 h-4" /> Add Domain
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total", value: COUNTS.total, color: "text-[#FFFFFF]" },
          { label: "Verified", value: COUNTS.verified, color: "text-[#3CD3AD]" },
          { label: "Verifying", value: COUNTS.verifying, color: "text-[#696CFF]" },
          { label: "Failed", value: COUNTS.failed, color: "text-[#FF5A4F]" },
        ].map(({ label, value, color }) => (
          <div key={label} className="p-4 rounded-[16px] enterprise-card flex items-center justify-between">
            <span className="text-[10px] font-medium text-[#8A8D96] uppercase tracking-wider">{label}</span>
            <span className={`text-xl font-bold ${color}`}>{value}</span>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24"><Loader2 className="w-6 h-6 text-[#696CFF] animate-spin" /></div>
      ) : (
        <>
          <DomainsTable
            domains={domains}
            onView={(d) => router.push(`/domains/${workspaceId}/${d.id}`)}
            onReverify={handleReverify}
            onDelete={handleDelete}
          />
          {total > 0 && <p className="text-[10px] font-medium text-[#8A8D96] px-1">Showing {domains.length} of {total} domains</p>}
        </>
      )}

      <AddDomainModal isOpen={addOpen} onClose={() => setAddOpen(false)} workspaceId={workspaceId} onAdded={handleAdded} />
    </motion.div>
  )
}
