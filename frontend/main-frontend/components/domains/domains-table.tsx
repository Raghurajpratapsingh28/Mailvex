"use client"

import { ApiDomain } from "@/lib/domains-service"
import DomainStatusBadge from "./domain-status-badge"
import { Eye, RefreshCw, Trash2, Globe } from "lucide-react"

interface Props {
  domains: ApiDomain[]
  onView: (d: ApiDomain) => void
  onReverify: (d: ApiDomain) => void
  onDelete: (d: ApiDomain) => void
}

export default function DomainsTable({ domains, onView, onReverify, onDelete }: Props) {
  if (domains.length === 0) {
    return (
      <div className="p-12 rounded-[16px] enterprise-card flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-[12px] bg-[#3CD3AD]/10 border border-[#3CD3AD]/25 flex items-center justify-center mb-4"><Globe className="w-6 h-6 text-[#3CD3AD]" /></div>
        <h3 className="text-base font-semibold text-[#FFFFFF]">No Domains Yet</h3>
        <p className="text-xs text-[#8A8D96] mt-1.5 max-w-[280px] leading-relaxed">Add a sending domain to start sending emails from your own domain.</p>
      </div>
    )
  }

  return (
    <div className="rounded-[16px] enterprise-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[#202126]">
              {["Domain", "Status", "Verification Attempts", "Verified At", "Added", "Actions"].map(col => (
                <th key={col} className="px-4 py-3.5 text-left text-xs font-semibold text-[#FFFFFF] tracking-tight whitespace-nowrap">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#202126]">
            {domains.map((d) => (
              <tr key={d.id} className="hover:bg-[#25262B] transition-colors group">
                <td className="px-4 py-3.5">
                  <button onClick={() => onView(d)} className="font-semibold text-[#FFFFFF] hover:text-[#3CD3AD] transition-colors font-medium text-left cursor-pointer">{d.domain}</button>
                </td>
                <td className="px-4 py-3.5"><DomainStatusBadge status={d.status as any} /></td>
                <td className="px-4 py-3.5 font-medium text-[#8A8D96]">{d.verificationAttempts}</td>
                <td className="px-4 py-3.5 font-medium text-[#8A8D96] whitespace-nowrap">
                  {d.verifiedAt ? new Date(d.verifiedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                </td>
                <td className="px-4 py-3.5 font-medium text-[#8A8D96] whitespace-nowrap">
                  {new Date(d.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Btn onClick={() => onView(d)} title="View" color="text-[#8A8D96]"><Eye className="w-3.5 h-3.5" /></Btn>
                    {d.status !== "verified" && d.status !== "deleting" && d.status !== "deleted" && (
                      <Btn onClick={() => onReverify(d)} title="Re-verify" color="text-[#696CFF]"><RefreshCw className="w-3.5 h-3.5" /></Btn>
                    )}
                    {d.status !== "deleting" && d.status !== "deleted" && (
                      <Btn onClick={() => onDelete(d)} title="Delete" color="text-[#FF5A4F]"><Trash2 className="w-3.5 h-3.5" /></Btn>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Btn({ onClick, title, color, children }: { onClick: () => void; title: string; color: string; children: React.ReactNode }) {
  return (
    <button onClick={onClick} title={title} className={`p-1.5 rounded-[8px] bg-transparent border border-transparent hover:border-[#202126] ${color} hover:bg-[#25262B] transition-all cursor-pointer`}>
      {children}
    </button>
  )
}
