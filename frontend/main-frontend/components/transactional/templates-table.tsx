"use client"

import { EmailTemplate } from "@/lib/transactional-data"
import { TemplateStatusBadge } from "./status-badges"
import { Eye, Pencil, Zap, Trash2, FileText } from "lucide-react"

interface Props {
  templates: EmailTemplate[]
  onView: (t: EmailTemplate) => void
  onEdit: (t: EmailTemplate) => void
  onPublish: (t: EmailTemplate) => void
  onDelete: (t: EmailTemplate) => void
}

export default function TemplatesTable({ templates, onView, onEdit, onPublish, onDelete }: Props) {
  if (templates.length === 0) {
    return (
      <div className="enterprise-card p-12 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-[12px] bg-transparent flex items-center justify-center text-[#696CFF] mb-4">
          <FileText className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-[#FFFFFF]">No Templates Yet</h3>
        <p className="text-xs text-[#8A8D96] mt-1.5 max-w-[280px] leading-relaxed">
          Create reusable email templates with variable support for transactional sends.
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
              {["Name", "Subject", "Status", "Version", "Updated At", "Actions"].map((col) => (
                <th key={col} className="px-4 py-3.5 text-left text-xs font-medium text-[#8A8D96] tracking-tight whitespace-nowrap">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#202126]">
            {templates.map((t) => (
              <tr key={t.id} className="hover:bg-[#25262B] transition-colors duration-200 group">
                <td className="px-4 py-3.5">
                  <button onClick={() => onView(t)} className={`font-medium hover:text-[#FFFFFF] transition-colors text-left ${t.status === "archived" ? "line-through text-zinc-600" : "text-[#FFFFFF]"}`}>
                    {t.name}
                  </button>
                  <p className="text-[9px] text-[#8A8D96] font-medium mt-0.5">{t.variables.length} variable{t.variables.length !== 1 ? "s" : ""}</p>
                </td>
                <td className="px-4 py-3.5 text-[#8A8D96] max-w-[200px] truncate font-medium text-[10px]">{t.subject}</td>
                <td className="px-4 py-3.5"><TemplateStatusBadge status={t.status} /></td>
                <td className="px-4 py-3.5 font-medium text-[#8A8D96]">v{t.version}</td>
                <td className="px-4 py-3.5 text-[#8A8D96] font-medium whitespace-nowrap">
                  {new Date(t.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Btn onClick={() => onView(t)} title="View" color="text-[#6B7280]"><Eye className="w-3.5 h-3.5" /></Btn>
                    {t.status !== "archived" && <Btn onClick={() => onEdit(t)} title="Edit" color="text-[#B0B8C8]"><Pencil className="w-3.5 h-3.5" /></Btn>}
                    {t.status === "draft" && <Btn onClick={() => onPublish(t)} title="Publish" color="text-emerald-400"><Zap className="w-3.5 h-3.5" /></Btn>}
                    {t.status !== "archived" && <Btn onClick={() => onDelete(t)} title="Delete" color="text-red-400"><Trash2 className="w-3.5 h-3.5" /></Btn>}
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
    <button onClick={onClick} title={title} className="p-1.5 bg-transparent hover:bg-[#25262B] text-[#8A8D96] hover:text-[#FFFFFF] rounded-[8px] transition-all cursor-pointer">
      {children}
    </button>
  )
}
