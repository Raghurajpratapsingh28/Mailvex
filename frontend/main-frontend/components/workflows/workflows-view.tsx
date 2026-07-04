"use client"

import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { useShortcut } from "@/lib/keyboard-shortcuts"
import { Plus, ArrowLeft, Loader2 } from "lucide-react"
import WorkflowsTable from "./workflows-table"
import { useWorkflows } from "@/lib/redux/useCache"

interface Props {
  workspaceId: string
}

export default function WorkflowsView({ workspaceId }: Props) {
  const router = useRouter()
  const { workflows, total, loading, handlePublish, handlePause, handleResume, handleDelete } = useWorkflows(workspaceId)
  useShortcut("n", () => router.push(`/flow-builder/${workspaceId}/create`))

  const COUNTS = {
    published: workflows.filter((w) => w.status === "published").length,
    draft: workflows.filter((w) => w.status === "draft").length,
    paused: workflows.filter((w) => w.status === "paused").length,
  }

  const active = workflows.filter((w) => w.status !== "archived")
  const archived = workflows.filter((w) => w.status === "archived")

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6 max-w-[1500px] mx-auto select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button onClick={() => router.push("/flow-builder")} className="flex items-center gap-1.5 text-[10px] font-medium text-[#8A8D96] hover:text-[#FFFFFF] transition-colors mb-3 cursor-pointer">
            <ArrowLeft className="w-3 h-3" /> All Workspaces
          </button>
          <span className="text-[10px] text-[#8A8D96] font-medium uppercase tracking-wider">Visual Journeys</span>
          <div className="flex items-center gap-3 mt-1.5">
            <h1 className="text-2xl font-bold tracking-tight text-[#FFFFFF] leading-none">Workflows</h1>
            <div className="flex items-baseline gap-1 bg-[#18191C] border border-[#202126] px-2.5 py-0.5 rounded-full text-xs font-medium font-semibold text-[#8A8D96]">
              <span>{total}</span>
              <span className="text-[9px] text-[#8A8D96] font-normal uppercase">Total</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => router.push(`/flow-builder/${workspaceId}/create`)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-[#696CFF] hover:bg-[#5A5CE6] text-[#FFFFFF] rounded-[12px] text-xs font-semibold shadow-none transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Create Workflow
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total", value: total, color: "text-white" },
          { label: "Published", value: COUNTS.published, color: "text-[#3CD3AD]" },
          { label: "Draft", value: COUNTS.draft, color: "text-[#8A8D96]" },
          { label: "Paused", value: COUNTS.paused, color: "text-[#FFB020]" },
        ].map(({ label, value, color }) => (
          <div key={label} className="enterprise-card p-4 flex items-center justify-between">
            <span className="text-[10px] font-medium text-[#8A8D96] uppercase tracking-wider">{label}</span>
            <span className={`text-xl font-semibold font-mono ${color}`}>{value}</span>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24"><Loader2 className="w-6 h-6 text-[#6B7280] animate-spin" /></div>
      ) : (
        <>
          <WorkflowsTable
            workflows={active}
            onView={(w) => router.push(`/flow-builder/${workspaceId}/details/${w.id}`)}
            onEdit={(w) => router.push(`/flow-builder/${workspaceId}/create?edit=${w.id}`)}
            onPublish={handlePublish}
            onPause={handlePause}
            onResume={handleResume}
            onDelete={handleDelete}
          />

          {archived.length > 0 && (
            <details className="group">
              <summary className="text-[10px] font-medium text-[#8A8D96] hover:text-[#FFFFFF] cursor-pointer transition-colors">
                {archived.length} archived workflow(s)
              </summary>
              <div className="mt-3">
                <WorkflowsTable
                  workflows={archived}
                  onView={(w) => router.push(`/flow-builder/${workspaceId}/details/${w.id}`)}
                  onEdit={(w) => router.push(`/flow-builder/${workspaceId}/create?edit=${w.id}`)}
                  onPublish={handlePublish}
                  onPause={handlePause}
                  onResume={handleResume}
                  onDelete={handleDelete}
                />
              </div>
            </details>
          )}
        </>
      )}
    </motion.div>
  )
}
