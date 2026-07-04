"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, AlertCircle, Loader2 } from "lucide-react"
import WorkflowGraph from "./workflow-graph"
import { workflowsService } from "@/lib/workflows-service"
import { defaultNodes, validateNodes, nodesToGraph, graphToNodes, type WorkflowNode, type WorkflowStatus } from "@/lib/workflows-data"

interface Props {
  workspaceId: string
}

export default function WorkflowCreateView({ workspaceId }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get("edit")

  const [name, setName] = useState("")
  const [nodes, setNodes] = useState<WorkflowNode[]>(defaultNodes())
  const [nameError, setNameError] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [isLoadingEdit, setIsLoadingEdit] = useState(!!editId)
  const [editStatus, setEditStatus] = useState<WorkflowStatus>("draft")

  useEffect(() => {
    if (!editId) return
    workflowsService.get(workspaceId, editId)
      .then((res) => {
        setName(res.workflow.name)
        setNodes(res.workflow.graph ? graphToNodes(res.workflow.graph) : defaultNodes())
        setEditStatus(res.workflow.status)
      })
      .catch(console.error)
      .finally(() => setIsLoadingEdit(false))
  }, [workspaceId, editId])

  const graphErrors = validateNodes(nodes)

  const handleSave = async (andPublish = false) => {
    if (!name.trim()) { setNameError("Name is required."); return }
    setIsSaving(true)
    try {
      const graph = nodesToGraph(nodes)
      if (editId) {
        await workflowsService.update(workspaceId, editId, { name: name.trim(), graph })
        if (andPublish) await workflowsService.publish(workspaceId, editId)
      } else {
        const res = await workflowsService.create(workspaceId, { name: name.trim(), graph })
        if (andPublish) await workflowsService.publish(workspaceId, res.workflow.id)
      }
      router.push(`/flow-builder/${workspaceId}`)
    } catch {
      // api-client already shows a toast with the error detail
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoadingEdit) return (
    <div className="flex items-center justify-center py-24"><Loader2 className="w-6 h-6 text-[#6B7280] animate-spin" /></div>
  )

  const canPublish = editId ? editStatus === "draft" || editStatus === "paused" : true

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6 max-w-[1200px] mx-auto select-none">
      <div>
        <button onClick={() => router.push(`/flow-builder/${workspaceId}`)} className="flex items-center gap-1.5 text-[10px] font-medium text-[#8A8D96] hover:text-[#FFFFFF] transition-colors mb-3 cursor-pointer">
          <ArrowLeft className="w-3 h-3" /> Back to Workflows
        </button>
        <span className="text-[10px] text-[#8A8D96] font-medium uppercase tracking-wider">Visual Journeys</span>
        <h1 className="text-2xl font-bold tracking-tight text-[#FFFFFF] mt-1">{editId ? "Edit Workflow" : "New Workflow"}</h1>
      </div>

      <div className="enterprise-card p-6 space-y-6">
        {/* Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#FFFFFF]">Workflow Name <span className="text-red-400">*</span></label>
          <input
            value={name}
            onChange={(e) => { setName(e.target.value); setNameError("") }}
            placeholder="e.g. Trial Onboarding"
            className="w-full max-w-sm px-3.5 py-2.5 bg-[#0D0E12] border border-[#202126] hover:border-[#8A8D96] focus:border-[#696CFF] rounded-[12px] text-sm text-[#FFFFFF] placeholder-[#8A8D96] focus:outline-none transition-colors"
          />
          {nameError && <p className="text-[10px] text-red-400 font-medium">{nameError}</p>}
        </div>

        {/* Graph */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-[#FFFFFF]">Flow Graph</label>
          <div className="p-4 rounded-[12px] bg-[#0D0E12] border border-[#202126]">
            <WorkflowGraph nodes={nodes} onChange={setNodes} />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div>
          {graphErrors.length > 0 && (
            <span className="flex items-center gap-1 text-[10px] text-amber-400 font-medium">
              <AlertCircle className="w-3 h-3" /> {graphErrors.length} validation issue{graphErrors.length > 1 ? "s" : ""}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => router.push(`/flow-builder/${workspaceId}`)} className="px-4 py-2 bg-transparent hover:bg-[#25262B] border border-transparent hover:border-[#202126] rounded-[8px] text-xs font-semibold text-[#8A8D96] hover:text-[#FFFFFF] transition-all cursor-pointer">
            Cancel
          </button>
          <button onClick={() => handleSave(false)} disabled={isSaving} className="flex items-center gap-1.5 px-4 py-2 bg-transparent hover:bg-[#25262B] border border-[#202126] rounded-[8px] text-xs font-semibold text-[#8A8D96] hover:text-[#FFFFFF] disabled:opacity-50 transition-all cursor-pointer">
            {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />} {editId ? "Save Changes" : "Save as Draft"}
          </button>
          {canPublish && (
            <button onClick={() => handleSave(true)} disabled={isSaving || graphErrors.length > 0} className="flex items-center gap-1.5 px-4 py-2 bg-[#696CFF] hover:bg-[#5A5CE6] disabled:opacity-50 text-[#FFFFFF] rounded-[12px] text-xs font-semibold shadow-none transition-all cursor-pointer">
              {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />} {editId ? "Save & Publish" : "Create & Publish"}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
