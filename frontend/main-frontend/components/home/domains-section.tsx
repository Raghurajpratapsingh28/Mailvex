"use client"

import { useRouter } from "next/navigation"
import { Globe, Plus, CheckCircle2, AlertCircle, XCircle, ArrowUpRight } from "lucide-react"

interface Props {
  verified: number
  pending: number
  failed: number
  workspaceId: string
}

export default function DomainsSection({ verified, pending, failed, workspaceId }: Props) {
  const router = useRouter()
  const total = verified + pending + failed

  return (
    <div className="p-5 enterprise-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[8px] bg-[#34D399]/10 flex items-center justify-center">
            <Globe className="w-4 h-4 text-[#34D399]" />
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-[#FFFFFF] tracking-tight">Sending Domains</h3>
            <p className="text-[11px] text-[#8A8D96] font-medium">{total} configured</p>
          </div>
        </div>
        <button
          onClick={() => router.push(`/domains/${workspaceId}`)}
          className="text-[12px] text-[#8A8D96] hover:text-[#FFFFFF] transition-colors flex items-center gap-1 cursor-pointer"
        >
          Manage <ArrowUpRight className="w-3 h-3" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="p-3 enterprise-panel flex flex-col items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-[#34D399]" />
          <p className="text-[18px] font-bold text-[#FFFFFF]">{verified}</p>
          <p className="text-[10px] text-[#8A8D96] font-medium uppercase tracking-wide">Verified</p>
        </div>
        <div className="p-3 enterprise-panel flex flex-col items-center gap-1.5">
          <AlertCircle className="w-4 h-4 text-[#FFB020]" />
          <p className="text-[18px] font-bold text-[#FFFFFF]">{pending}</p>
          <p className="text-[10px] text-[#8A8D96] font-medium uppercase tracking-wide">Pending</p>
        </div>
        <div className="p-3 enterprise-panel flex flex-col items-center gap-1.5">
          <XCircle className="w-4 h-4 text-[#FF5A4F]" />
          <p className="text-[18px] font-bold text-[#FFFFFF]">{failed}</p>
          <p className="text-[10px] text-[#8A8D96] font-medium uppercase tracking-wide">Failed</p>
        </div>
      </div>

      {verified === 0 && (
        <div className="p-3 bg-[#FFB020]/5 border border-[#FFB020]/20 rounded-xl mb-4">
          <p className="text-[11px] text-[#FFB020] font-semibold">
            No verified domain — emails may land in spam.
          </p>
        </div>
      )}

      <button
        onClick={() => router.push(`/domains/${workspaceId}`)}
        className="w-full py-2.5 enterprise-btn text-[#FFFFFF] text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer border border-[#202126] hover:border-[#34D399] transition-all rounded-xl"
      >
        <Plus className="w-4 h-4 text-[#34D399]" /> Add Domain
      </button>
    </div>
  )
}
