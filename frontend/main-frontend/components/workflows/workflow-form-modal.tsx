"use client"

import { useState, useEffect } from "react"
import { Workflow, WorkflowNode, defaultNodes, validateNodes } from "@/lib/workflows-data"
import WorkflowGraph from "./workflow-graph"
import { X, AlertCircle } from "lucide-react"

interface Props {
  isOpen: boolean
  onClose: () => void
  workflow?: Workflow | null
  onSave: (data: { name: string; nodes: WorkflowNode[] }) => void
}

export default function WorkflowFormModal({ isOpen, onClose, workflow, onSave }: Props) {
  const [name, setName] = useState("")
  const [nodes, setNodes] = useState<WorkflowNode[]>(defaultNodes())
  const [nameError, setNameError] = useState("")

  useEffect(() => {
    if (workflow) { setName(workflow.name); setNodes(workflow.nodes) }
    else { setName(""); setNodes(defaultNodes()) }
    setNameError("")
  }, [workflow, isOpen])

  if (!isOpen) return null

  const graphErrors = validateNodes(nodes)

  const handleSave = () => {
    if (!name.trim()) { setNameError("Name is required."); return }
    onSave({ name: name.trim(), nodes })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col enterprise-card border-none overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#202126] shrink-0">
          <div>
            <span className="text-[10px] text-[#8A8D96] font-medium uppercase tracking-wider">
              {workflow ? "Edit Workflow" : "New Workflow"}
            </span>
            <h2 className="text-sm font-semibold text-[#FFFFFF] mt-0.5">{name || "Untitled Workflow"}</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-[8px] hover:bg-[#25262B] text-[#8A8D96] hover:text-[#FFFFFF] transition-all cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#FFFFFF]">
              Workflow Name <span className="text-red-400">*</span>
            </label>
            <input
              value={name}
              onChange={(e) => { setName(e.target.value); setNameError("") }}
              placeholder="e.g. Trial Onboarding"
              className="w-full max-w-sm px-3.5 py-2.5 bg-[#0D0E12] border border-[#202126] hover:border-[#8A8D96] focus:border-[#696CFF] rounded-[12px] text-sm text-[#FFFFFF] placeholder-[#8A8D96] focus:outline-none transition-colors"
            />
            {nameError && <p className="text-[10px] text-red-400 font-medium">{nameError}</p>}
          </div>

          {/* Graph builder */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#FFFFFF]">
              Flow Graph
            </label>
            <div className="p-4 rounded-[12px] bg-[#0D0E12] border border-[#202126]">
              <WorkflowGraph nodes={nodes} onChange={setNodes} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#202126] shrink-0">
          <div className="flex items-center gap-2">
            {graphErrors.length > 0 && (
              <span className="flex items-center gap-1 text-[10px] text-amber-400 font-medium">
                <AlertCircle className="w-3 h-3" /> {graphErrors.length} validation issue{graphErrors.length > 1 ? "s" : ""}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="px-4 py-2 bg-transparent hover:bg-[#25262B] border border-transparent hover:border-[#202126] rounded-[8px] text-xs font-semibold text-[#8A8D96] hover:text-[#FFFFFF] transition-all cursor-pointer">
              Cancel
            </button>
            <button onClick={handleSave} className="px-4 py-2 bg-[#696CFF] hover:bg-[#5A5CE6] text-[#FFFFFF] rounded-[12px] text-xs font-semibold shadow-none transition-all cursor-pointer">
              {workflow ? "Save Changes" : "Save as Draft"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
