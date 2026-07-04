"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { CreditCard, ArrowRight } from "lucide-react"
import { workspaceService, type Workspace } from "@/lib/workspace-service"

export default function WorkspaceSelector() {
  const router = useRouter()
  const [workspaces, setWorkspaces] = useState<Array<{ workspace: Workspace; role: string }>>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadWorkspaces()
  }, [])

  const loadWorkspaces = async () => {
    try {
      const res = await workspaceService.getWorkspaces()
      setWorkspaces(res.items)
    } catch (error) {
      console.error("Failed to load workspaces:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectWorkspace = (slug: string) => {
    router.push(`/billing/${slug}`)
  }

  if (isLoading) {
    return <div className="text-[#FFFFFF]">Loading...</div>
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.4 }} 
      className="space-y-6 max-w-[1200px] mx-auto select-none"
    >
      <div>
        <span className="text-[10px] text-[#8A8D96] font-medium uppercase tracking-wider uppercase tracking-wider">Subscription & Payments</span>
        <h1 className="text-3xl font-extrabold tracking-tight text-[#FFFFFF] mt-1">Select Workspace</h1>
        <p className="text-sm text-[#8A8D96] mt-2">Choose a workspace to manage its billing and subscription</p>
      </div>

      <div className="grid gap-4">
        {workspaces.map(({ workspace, role }) => (
          <motion.div
            key={workspace.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => handleSelectWorkspace(workspace.slug)}
            className="p-6 bg-[#18191C] border border-[#202126] rounded-[12px] hover:border-[#696CFF] transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[#6B7280]/10 border border-[#6B7280]/20 rounded-[12px] group-hover:bg-[#6B7280]/20 transition-all">
                  <CreditCard className="w-5 h-5 text-[#8A8D96]" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-[#FFFFFF] group-hover:text-[#FFFFFF]/90 transition-colors">{workspace.name}</h3>
                    <span className="text-[9px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-lg bg-[#6B7280]/10 border border-[#6B7280]/20 text-[#8A8D96]">
                      {role}
                    </span>
                    {workspace.status === "inactive" && (
                      <span className="text-[9px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-lg bg-[#FFB020]/10 border border-[#FFB020]/20 text-[#FFB020]">
                        inactive
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#8A8D96] font-medium uppercase tracking-wider mt-1">/{workspace.slug}</p>
                  <p className="text-xs text-[#8A8D96] mt-1">Plan: <span className="capitalize">{workspace.plan}</span></p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-[#8A8D96] group-hover:text-[#FFFFFF] group-hover:translate-x-1 transition-all" />
            </div>
          </motion.div>
        ))}
      </div>

      {workspaces.length === 0 && (
        <div className="text-center py-12">
          <CreditCard className="w-12 h-12 text-[#8A8D96] mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-[#FFFFFF] mb-2">No workspaces found</h3>
          <p className="text-sm text-[#8A8D96]">You don't have access to any workspaces yet.</p>
        </div>
      )}
    </motion.div>
  )
}