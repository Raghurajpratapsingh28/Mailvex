"use client"

import { TransactionalSend } from "@/lib/transactional-data"
import { SendStatusBadge } from "./status-badges"
import { Eye, Send } from "lucide-react"

interface Props {
  sends: TransactionalSend[]
  onView: (s: TransactionalSend) => void
}

export default function SendsTable({ sends, onView }: Props) {
  if (sends.length === 0) {
    return (
      <div className="enterprise-card p-12 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-[12px] bg-transparent flex items-center justify-center text-[#696CFF] mb-4">
          <Send className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-[#FFFFFF]">No Sends Yet</h3>
        <p className="text-xs text-[#8A8D96] mt-1.5 max-w-[280px] leading-relaxed">
          Send your first transactional email using the "Send Email" button above.
        </p>
      </div>
    )
  }

  return (
    <div className="enterprise-card overflow-hidden border-none">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[#202126]">
              {["Recipient", "Subject", "Sender", "Status", "Tags", "Sent At", ""].map((col) => (
                <th key={col} className="px-4 py-3.5 text-left text-xs font-medium text-[#8A8D96] tracking-tight whitespace-nowrap">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#202126]">
            {sends.map((s) => (
              <tr key={s.id} className="hover:bg-[#25262B] transition-colors duration-200 group">
                <td className="px-4 py-3.5">
                  <p className="font-medium text-[#FFFFFF]">{s.recipientName}</p>
                  <p className="text-[10px] text-[#8A8D96] font-medium">{s.recipient}</p>
                </td>
                <td className="px-4 py-3.5 text-[#8A8D96] max-w-[180px] truncate font-medium">{s.subject}</td>
                <td className="px-4 py-3.5 text-[#8A8D96] font-medium whitespace-nowrap">{s.fromEmail}</td>
                <td className="px-4 py-3.5"><SendStatusBadge status={s.status} /></td>
                <td className="px-4 py-3.5">
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(s.tags).map(([k, v]) => (
                      <span key={k} className="text-[9px] font-medium px-1.5 py-0.5 bg-transparent border border-[#202126] text-[#8A8D96] rounded-[6px]">
                        {k}: {v}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3.5 text-[#8A8D96] font-medium whitespace-nowrap">
                  {s.sentAt ? new Date(s.sentAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}
                </td>
                <td className="px-4 py-3.5">
                  <button onClick={() => onView(s)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-[8px] bg-transparent text-[#8A8D96] hover:bg-[#25262B] hover:text-[#FFFFFF] transition-all cursor-pointer">
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
