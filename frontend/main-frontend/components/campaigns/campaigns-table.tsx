"use client"

import { Campaign } from "@/lib/campaigns-data"
import CampaignStatusBadge from "./campaign-status-badge"
import { Eye, Pencil, Calendar, Play, Pause, Trash2, Send, Megaphone } from "lucide-react"

interface Props {
  campaigns: Campaign[]
  onView: (c: Campaign) => void
  onEdit: (c: Campaign) => void
  onSchedule: (c: Campaign) => void
  onSendNow: (c: Campaign) => void
  onPause: (c: Campaign) => void
  onResume: (c: Campaign) => void
  onDelete: (c: Campaign) => void
}

export default function CampaignsTable({ campaigns, onView, onEdit, onSchedule, onSendNow, onPause, onResume, onDelete }: Props) {
  if (campaigns.length === 0) {
    return (
      <div className="p-12 enterprise-card flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-[12px] bg-[#8A8D96]/10 border border-[#8A8D96]/25 flex items-center justify-center text-[#8A8D96] mb-4">
          <Megaphone className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-[#FFFFFF]">No Campaigns Found</h3>
        <p className="text-xs text-[#8A8D96] mt-1.5 max-w-[280px] leading-relaxed">
          Create your first campaign to start sending emails to your segments.
        </p>
      </div>
    )
  }

  return (
    <div className="enterprise-card rounded-[16px] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[#202126] bg-[#0D0E12]">
              {["Name", "Subject", "Status", "Segment", "Scheduled At", "Recipients", "Created", "Actions"].map((col) => (
                <th key={col} className="px-4 py-3 text-left text-[10px] uppercase font-medium text-[#8A8D96] tracking-wider whitespace-nowrap">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#202126]">
            {campaigns.map((c) => (
              <tr key={c.id} className="hover:bg-[#25262B] transition-colors duration-200 group">
                <td className="px-4 py-3.5">
                  <button onClick={() => onView(c)} className={`font-medium hover:text-[#8A8D96] transition-colors text-left ${c.status === "cancelled" ? "line-through text-[#8A8D96] opacity-50" : "text-[#FFFFFF]"}`}>
                    {c.name}
                  </button>
                </td>
                <td className="px-4 py-3.5 text-[#8A8D96] max-w-[180px] truncate">{c.subject}</td>
                <td className="px-4 py-3.5"><CampaignStatusBadge status={c.status} /></td>
                <td className="px-4 py-3.5 text-[#8A8D96] whitespace-nowrap">{c.segmentName}</td>
                <td className="px-4 py-3.5 text-[#8A8D96] font-medium whitespace-nowrap">
                  {c.scheduledAt ? new Date(c.scheduledAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}
                </td>
                <td className="px-4 py-3.5 font-medium text-[#FFFFFF]">
                  {c.recipientCount > 0 ? c.recipientCount.toLocaleString() : "—"}
                </td>
                <td className="px-4 py-3.5 text-[#8A8D96] font-medium whitespace-nowrap">
                  {new Date(c.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Btn onClick={() => onView(c)} title="View" color="text-[#8A8D96]"><Eye className="w-3.5 h-3.5" /></Btn>
                    {(c.status === "draft" || c.status === "scheduled") && (
                      <Btn onClick={() => onEdit(c)} title="Edit" color="text-[#8A8D96]"><Pencil className="w-3.5 h-3.5" /></Btn>
                    )}
                    {c.status === "draft" && (
                      <>
                        <Btn onClick={() => onSchedule(c)} title="Schedule" color="text-[#3CD3AD]"><Calendar className="w-3.5 h-3.5" /></Btn>
                        <Btn onClick={() => onSendNow(c)} title="Send Now" color="text-[#696CFF]"><Send className="w-3.5 h-3.5" /></Btn>
                      </>
                    )}
                    {(c.status === "scheduled" || c.status === "sending") && (
                      <Btn onClick={() => onPause(c)} title="Pause" color="text-[#FFB020]"><Pause className="w-3.5 h-3.5" /></Btn>
                    )}
                    {c.status === "paused" && (
                      <Btn onClick={() => onResume(c)} title="Resume" color="text-[#3CD3AD]"><Play className="w-3.5 h-3.5" /></Btn>
                    )}
                    {["draft", "scheduled", "paused", "failed"].includes(c.status) && (
                      <Btn onClick={() => onDelete(c)} title="Delete" color="text-[#FF5A4F]"><Trash2 className="w-3.5 h-3.5" /></Btn>
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
    <button onClick={onClick} title={title} className={`p-1.5 rounded-[8px] bg-transparent border border-transparent hover:border-[#8A8D96] ${color} hover:bg-[#25262B] transition-all cursor-pointer`}>
      {children}
    </button>
  )
}
