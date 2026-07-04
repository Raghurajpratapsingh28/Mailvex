"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { GitBranch, ArrowRight, Loader2 } from "lucide-react"
import { workspaceService, type Workspace } from "@/lib/workspace-service"
import { apiClient } from "@/lib/api-client"

export default function FlowBuilderWorkspaceListView() {
  const router = useRouter()
  const [workspaces, setWorkspaces] = useState<Array<{ workspace: Workspace; role: string }>>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    workspaceService.getWorkspaces()
      .then((res) => setWorkspaces(res.items))
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [])

  const handleOpen = async (workspaceId: string) => {
    try {
      const res = await workspaceService.switchWorkspace(workspaceId)
      apiClient.setAccessToken(res.accessToken)
    } catch { /* non-fatal */ }
    router.push(`/flow-builder/${workspaceId}`)
  }

  if (isLoading) return (
    <div className="flex items-center justify-center py-24">
      <Loader2 className="w-6 h-6 text-[#6B7280] animate-spin" />
    </div>
  )

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6 max-w-[1200px] mx-auto select-none">
      <div>
        <span className="text-[10px] text-[#8A8D96] font-medium uppercase tracking-wider">Visual Journeys</span>
        <h1 className="text-2xl font-bold tracking-tight text-[#FFFFFF] mt-1">Flow Builder</h1>
        <p className="text-xs text-[#8A8D96] mt-1.5">Select a workspace to manage its workflows.</p>
      </div>

      <div className="grid gap-4">
        {workspaces.map(({ workspace, role }) => (
          <button key={workspace.id} onClick={() => handleOpen(workspace.id)} className="w-full text-left enterprise-card p-6 hover:border-[#8A8D96] hover:bg-[#18191C] group cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-[12px] bg-transparent border border-[#202126] flex items-center justify-center shrink-0">
                  <GitBranch className="w-5 h-5 text-[#696CFF]" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-base font-semibold text-[#FFFFFF]">{workspace.name}</span>
                    <span className="text-[9px] font-medium px-2 py-0.5 rounded-[6px] bg-transparent border border-[#202126] text-[#8A8D96]">{role}</span>
                    {workspace.status === "inactive" && (
                      <span className="text-[9px] font-medium px-2 py-0.5 rounded-[6px] bg-amber-500/10 border border-amber-500/20 text-amber-400">inactive</span>
                    )}
                  </div>
                  <p className="text-xs text-[#8A8D96] font-medium mt-0.5">/{workspace.slug} · {workspace.plan}</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#8A8D96] group-hover:text-[#FFFFFF] transition-colors shrink-0" />
            </div>
          </button>
        ))}

        {workspaces.length === 0 && (
          <div className="enterprise-card p-12 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-[12px] bg-transparent border border-[#202126] flex items-center justify-center text-[#8A8D96] mb-4">
              <GitBranch className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-[#FFFFFF]">No Workspaces</h3>
            <p className="text-xs text-[#8A8D96] mt-1.5">Create a workspace first from Settings.</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}
