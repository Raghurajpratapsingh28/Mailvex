"use client"

import { Workflow, triggerLabel, validateNodes } from "@/lib/workflows-data"
import { X, Zap, AlertCircle } from "lucide-react"

interface Props {
  workflow: Workflow | null
  onClose: () => void
  onConfirm: (w: Workflow) => void
}

export default function PublishDialog({ workflow, onClose, onConfirm }: Props) {
  if (!workflow) return null

  const errors = validateNodes(workflow.nodes)
  const canPublish = errors.length === 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm enterprise-card border-none overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#202126]">
          <span className="text-[10px] text-[#8A8D96] font-medium uppercase tracking-wider">Publish Workflow</span>
          <button onClick={onClose} className="p-2 rounded-[8px] hover:bg-[#25262B] text-[#8A8D96] hover:text-[#FFFFFF] transition-all cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-[#FFFFFF]">Publish "{workflow.name}"?</h2>
            <p className="text-xs text-[#8A8D96] mt-1.5 leading-relaxed">Once published:</p>
            <ul className="mt-2 space-y-1 text-xs text-[#8A8D96]">
              <li className="flex items-start gap-1.5"><span className="text-[#8A8D96] mt-0.5">•</span> Contacts matching the trigger will be automatically enrolled</li>
              <li className="flex items-start gap-1.5"><span className="text-[#8A8D96] mt-0.5">•</span> Graph cannot be edited — pause first to make changes</li>
            </ul>
          </div>

          <div className="p-4 rounded-[12px] bg-[#0D0E12] border border-[#202126] space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-[#8A8D96] font-medium">Trigger</span>
              <span className="text-[#FFFFFF]">{triggerLabel(workflow.nodes)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8A8D96] font-medium">Steps</span>
              <span className="text-[#FFFFFF] font-medium">{workflow.nodes.length} nodes</span>
            </div>
          </div>

          {errors.length > 0 && (
            <div className="p-4 rounded-[12px] bg-[#FF5A4F]/5 border border-[#FF5A4F]/20 space-y-1.5">
              {errors.map((e) => (
                <div key={e} className="flex items-start gap-2 text-xs text-[#FF5A4F]">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" /> {e}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#202126]">
          <button onClick={onClose} className="px-4 py-2 bg-transparent hover:bg-[#25262B] border border-transparent hover:border-[#202126] rounded-[8px] text-xs font-semibold text-[#8A8D96] hover:text-[#FFFFFF] transition-all cursor-pointer">
            Cancel
          </button>
          <button
            onClick={() => { onConfirm(workflow); onClose() }}
            disabled={!canPublish}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#3CD3AD] hover:bg-[#2BB28D] disabled:opacity-40 disabled:cursor-not-allowed text-[#18191C] rounded-[12px] text-xs font-semibold shadow-none transition-all cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5" /> Publish
          </button>
        </div>
      </div>
    </div>
  )
}
