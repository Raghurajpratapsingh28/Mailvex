"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Users, ArrowRight } from "lucide-react"
import { workspaceService, type Workspace } from "@/lib/workspace-service"

export default function ContactWorkspaceSelector() {
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
    router.push(`/contact/${slug}`)
  }

  if (isLoading) {
    return <div className="text-white">Loading...</div>
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.4 }} 
      className="space-y-6 max-w-[1200px] mx-auto select-none"
    >
      <div>
        <span className="text-[10px] text-[#7A8499] font-mono uppercase tracking-wider">Contact Management</span>
        <h1 className="text-3xl font-extrabold tracking-tight text-white/95 mt-1">Select Workspace</h1>
        <p className="text-sm text-[#7A8499] mt-2">Choose a workspace to manage its contacts</p>
      </div>

      <div className="grid gap-4">
        {workspaces.map(({ workspace, role }) => (
          <motion.div
            key={workspace.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => handleSelectWorkspace(workspace.slug)}
            className="p-6 bg-[#08090C] border border-[#1E2230] rounded-2xl hover:border-[#383E58] transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[#6B7280]/10 border border-[#6B7280]/20 rounded-xl group-hover:bg-[#6B7280]/20 transition-all">
                  <Users className="w-5 h-5 text-[#9CA3AF]" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-white group-hover:text-white/90 transition-colors">{workspace.name}</h3>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded-lg bg-[#6B7280]/10 border border-[#6B7280]/20 text-[#9CA3AF]">
                      {role}
                    </span>
                    {workspace.status === "inactive" && (
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
                        inactive
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#7A8499] font-mono mt-1">/{workspace.slug}</p>
                  <p className="text-xs text-[#B0B8C8] mt-1">Plan: <span className="capitalize">{workspace.plan}</span></p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-[#7A8499] group-hover:text-white group-hover:translate-x-1 transition-all" />
            </div>
          </motion.div>
        ))}
      </div>

      {workspaces.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-[#7A8499] mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No workspaces found</h3>
          <p className="text-sm text-[#7A8499]">You don't have access to any workspaces yet.</p>
        </div>
      )}
    </motion.div>
  )
}