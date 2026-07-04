"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Layers, ArrowRight, Loader2 } from "lucide-react"
import { workspaceService, type Workspace } from "@/lib/workspace-service"
import { apiClient } from "@/lib/api-client"

export default function SegmentWorkspaceListView() {
  const router = useRouter()
  const [workspaces, setWorkspaces] = useState<Array<{ workspace: Workspace; role: string }>>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    workspaceService.getWorkspaces()
      .then((res) => setWorkspaces(res?.items ?? []))
      .catch((err) => console.error("Failed to load workspaces:", err))
      .finally(() => setIsLoading(false))
  }, [])

  const handleOpen = async (workspaceId: string) => {
    try {
      const res = await workspaceService.switchWorkspace(workspaceId)
      apiClient.setAccessToken(res.accessToken)
    } catch {
      // non-fatal — navigate anyway, the current token may still work
    }
    router.push(`/segments/${workspaceId}`)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 text-[#6B7280] animate-spin" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 max-w-[1200px] mx-auto select-none"
    >
      <div>
        <span className="text-[10px] text-[#7A8499] font-mono uppercase tracking-wider">Audience Builder</span>
        <h1 className="text-3xl font-extrabold tracking-tight text-white/95 mt-1">Segments</h1>
        <p className="text-xs text-[#7A8499] mt-1.5">Select a workspace to manage its segments.</p>
      </div>

      <div className="grid gap-4">
        {workspaces.map(({ workspace, role }) => (
          <button
            key={workspace.id}
            onClick={() => handleOpen(workspace.id)}
            className="w-full text-left p-6 bg-[#08090C] border border-[#1E2230] rounded-2xl hover:border-[#383E58] hover:bg-[#0F1016] transition-all group cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#6B7280]/10 border border-[#6B7280]/25 flex items-center justify-center shrink-0">
                  <Layers className="w-5 h-5 text-[#9CA3AF]" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-base font-bold text-white">{workspace.name}</span>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded-lg bg-[#6B7280]/10 border border-[#6B7280]/20 text-[#9CA3AF]">
                      {role}
                    </span>
                    {workspace.status === "inactive" && (
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
                        inactive
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#7A8499] font-mono mt-0.5">/{workspace.slug} · {workspace.plan}</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#383E58] group-hover:text-[#9CA3AF] transition-colors shrink-0" />
            </div>
          </button>
        ))}

        {workspaces.length === 0 && (
          <div className="p-12 rounded-3xl bg-[#0F1016]/95 border border-[#1C202C] flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#6B7280]/10 border border-[#6B7280]/25 flex items-center justify-center text-[#6B7280] mb-4">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-white">No Workspaces</h3>
            <p className="text-xs text-[#B0B8C8] mt-1.5">Create a workspace first from Settings.</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}
