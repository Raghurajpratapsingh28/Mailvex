"use client"

import { Workflow, triggerLabel } from "@/lib/workflows-data"
import WorkflowStatusBadge from "./workflow-status-badge"
import { Eye, Pencil, Zap, Pause, Play, Trash2, GitBranch } from "lucide-react"

interface Props {
  workflows: Workflow[]
  onView: (w: Workflow) => void
  onEdit: (w: Workflow) => void
  onPublish: (w: Workflow) => void
  onPause: (w: Workflow) => void
  onResume: (w: Workflow) => void
  onDelete: (w: Workflow) => void
}

export default function WorkflowsTable({ workflows, onView, onEdit, onPublish, onPause, onResume, onDelete }: Props) {
  if (workflows.length === 0) {
    return (
      <div className="enterprise-card p-12 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-[12px] bg-transparent border border-[#202126] flex items-center justify-center text-[#8A8D96] mb-4">
          <GitBranch className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-[#FFFFFF]">No Workflows Yet</h3>
        <p className="text-xs text-[#8A8D96] mt-1.5 max-w-[280px] leading-relaxed">
          Create your first workflow to automate contact journeys with triggers, emails, and delays.
        </p>
      </div>
    )
  }

  return (
    <div className="enterprise-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[#202126]">
              {["Name", "Status", "Trigger", "Executions", "Published At", "Created", "Actions"].map((col) => (
                <th key={col} className="px-4 py-3.5 text-left text-[10px] font-medium text-[#8A8D96] uppercase tracking-wider whitespace-nowrap">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#202126]">
            {workflows.map((w) => (
              <tr key={w.id} className="hover:bg-[#18191C] transition-colors duration-200 group">
                <td className="px-4 py-3.5">
                  <button onClick={() => onView(w)} className={`font-semibold hover:text-[#FFFFFF] transition-colors text-left ${w.status === "archived" ? "line-through text-zinc-600" : "text-[#FFFFFF]"}`}>
                    {w.name}
                  </button>
                  <p className="text-[9px] text-[#8A8D96] font-medium mt-0.5">{w.nodes.length} nodes</p>
                </td>
                <td className="px-4 py-3.5"><WorkflowStatusBadge status={w.status} /></td>
                <td className="px-4 py-3.5 text-[#8A8D96] font-medium max-w-[160px] truncate">{triggerLabel(w.nodes)}</td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2 font-medium text-[10px]">
                    <span className="text-[#FFFFFF]">{w.executionStats.total.toLocaleString()}</span>
                    <span className="text-[#3CD3AD]">{w.executionStats.completed.toLocaleString()}</span>
                    <span className="text-[#FF5A4F]">{w.executionStats.failed}</span>
                    <span className="text-[#696CFF]">{w.executionStats.running}</span>
                  </div>
                </td>
                <td className="px-4 py-3.5 text-[#8A8D96] font-medium whitespace-nowrap">
                  {w.publishedAt ? new Date(w.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                </td>
                <td className="px-4 py-3.5 text-[#8A8D96] font-medium whitespace-nowrap">
                  {new Date(w.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Btn onClick={() => onView(w)} title="View" color="text-[#8A8D96]"><Eye className="w-3.5 h-3.5" /></Btn>
                    {(w.status === "draft" || w.status === "paused") && <Btn onClick={() => onEdit(w)} title="Edit" color="text-[#FFFFFF]"><Pencil className="w-3.5 h-3.5" /></Btn>}
                    {w.status === "draft" && <Btn onClick={() => onPublish(w)} title="Publish" color="text-[#3CD3AD]"><Zap className="w-3.5 h-3.5" /></Btn>}
                    {w.status === "published" && <Btn onClick={() => onPause(w)} title="Pause" color="text-[#FFB020]"><Pause className="w-3.5 h-3.5" /></Btn>}
                    {w.status === "paused" && <Btn onClick={() => onResume(w)} title="Resume" color="text-[#3CD3AD]"><Play className="w-3.5 h-3.5" /></Btn>}
                    {w.status !== "archived" && <Btn onClick={() => onDelete(w)} title="Delete" color="text-[#FF5A4F]"><Trash2 className="w-3.5 h-3.5" /></Btn>}
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
    <button onClick={onClick} title={title} className={`p-1.5 rounded-[8px] bg-transparent border border-transparent hover:border-[#202126] hover:bg-[#25262B] ${color} transition-all cursor-pointer`}>
      {children}
    </button>
  )
}
