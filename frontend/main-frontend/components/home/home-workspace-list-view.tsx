"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { LayoutDashboard, ArrowRight, Loader2 } from "lucide-react"
import { workspaceService, type Workspace } from "@/lib/workspace-service"
import { useWorkspace } from "@/lib/workspace-context"
import { apiClient } from "@/lib/api-client"

export default function HomeWorkspaceListView() {
  const router = useRouter()
  const { setWorkspaceId } = useWorkspace()
  const [workspaces, setWorkspaces] = useState<Array<{ workspace: Workspace; role: string }>>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    workspaceService.getWorkspaces()
      .then((res) => {
        console.log('Workspaces loaded:', res)
        setWorkspaces(res.items)
      })
      .catch((err) => {
        console.error('Failed to load workspaces:', err)
        setError(err.message || 'Failed to load workspaces')
      })
      .finally(() => setIsLoading(false))
  }, [])

  const handleOpen = async (workspaceId: string) => {
    try { const res = await workspaceService.switchWorkspace(workspaceId); apiClient.setAccessToken(res.accessToken) } catch { /* non-fatal */ }
    setWorkspaceId(workspaceId)
    router.push(`/home/${workspaceId}`)
  }

  if (isLoading) return <div className="flex items-center justify-center py-24"><Loader2 className="w-6 h-6 text-[#888888] animate-spin" /></div>

  if (error) return (
    <div className="flex items-center justify-center py-24">
      <div className="text-center">
        <div className="text-[#888888] text-sm mb-2">Error loading workspaces</div>
        <div className="text-xs text-[#666666]">{error}</div>
      </div>
    </div>
  )

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6 max-w-[1200px] mx-auto select-none">
      <div>
        <span className="text-[10px] text-[#888888] font-mono uppercase tracking-wider">Account Control Panel</span>
        <h1 className="text-3xl font-bold tracking-tight text-[#E0E0E0] mt-1">Workspace Home</h1>
        <p className="text-sm text-[#B0B0B0] mt-1.5">Select a workspace to view its dashboard.</p>
      </div>
      <div className="grid gap-4">
        {workspaces.map(({ workspace, role }) => (
          <button key={workspace.id} onClick={() => handleOpen(workspace.id)} className="w-full text-left p-8 enterprise-card enterprise-card-interactive group cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#1F1F1F] border border-[#333333] flex items-center justify-center shrink-0">
                  <LayoutDashboard className="w-5 h-5 text-[#B0B0B0]" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-base font-semibold text-[#E0E0E0]">{workspace.name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#1F1F1F] border border-[#333333] text-[#B0B0B0]">{role}</span>
                    {workspace.status === "inactive" && <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#1F1F1F] border border-[#333333] text-[#888888]">inactive</span>}
                  </div>
                  <p className="text-xs text-[#B0B0B0] font-mono mt-1">/{workspace.slug} · {workspace.plan}</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#444444] group-hover:text-[#B0B0B0] transition-colors shrink-0" />
            </div>
          </button>
        ))}
        {workspaces.length === 0 && (
          <div className="p-12 enterprise-card flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-[#1F1F1F] border border-[#333333] flex items-center justify-center mb-5"><LayoutDashboard className="w-6 h-6 text-[#B0B0B0]" /></div>
            <h3 className="text-sm font-semibold text-[#E0E0E0]">No Workspaces</h3>
            <p className="text-xs text-[#B0B0B0] mt-1.5">Create a workspace first from Settings.</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}
