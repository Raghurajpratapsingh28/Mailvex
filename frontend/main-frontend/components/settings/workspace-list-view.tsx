"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Plus, Settings, Users, AlertTriangle, ArrowRightLeft } from "lucide-react"
import { workspaceService, type Workspace } from "@/lib/workspace-service"
import { useWorkspace } from "@/lib/workspace-context"
import { apiClient } from "@/lib/api-client"
import { tokenManager } from "@/lib/token-manager"
import { useAuth } from "@/lib/auth-context"

export default function WorkspaceListView() {
  const router = useRouter()
  const { setWorkspaceId } = useWorkspace()
  const { storeTokensAndUser } = useAuth()
  const [workspaces, setWorkspaces] = useState<Array<{ workspace: Workspace; role: string }>>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [plan, setPlan] = useState("free")
  const [isCreating, setIsCreating] = useState(false)

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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)
    try {
      const result = await workspaceService.createWorkspace({ name, slug: slug || undefined, plan })
      setShowCreateForm(false)
      setName("")
      setSlug("")
      setPlan("free")
      await loadWorkspaces()
      // Auto-switch to newly created workspace
      const newWorkspaceId = result.workspace.id
      const switchRes = await workspaceService.switchWorkspace(newWorkspaceId)
      await storeTokensAndUser({
        accessToken: switchRes.accessToken,
        expiresIn: switchRes.expiresIn,
        refreshToken: tokenManager.getRefreshToken() || "",
        tokenType: "Bearer",
      })
      setWorkspaceId(newWorkspaceId)
      router.push(`/campaigns/${newWorkspaceId}`)
    } catch (error) {
      console.error("Failed to create workspace:", error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleSwitch = async (workspaceId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const res = await workspaceService.switchWorkspace(workspaceId)
      await storeTokensAndUser({
        accessToken: res.accessToken,
        expiresIn: res.expiresIn,
        refreshToken: tokenManager.getRefreshToken() || "",
        tokenType: "Bearer",
      })
      router.push(`/settings/${workspaceId}`)
    } catch (error) {
      console.error("Failed to switch workspace:", error)
    }
  }

  if (isLoading) {
    return <div className="text-[#FFFFFF]">Loading...</div>
  }

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6 max-w-[1200px] mx-auto select-none">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] text-[#8A8D96] font-medium uppercase tracking-wider uppercase tracking-wider">Workspace Management</span>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#FFFFFF] mt-1">Workspaces</h1>
        </div>
        <button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2 px-4 py-2.5 bg-[#696CFF] hover:bg-[#5A5CE6] text-[#FFFFFF] rounded-[12px] text-xs font-semibold shadow-lg shadow-[#696CFF]/15 transition-all cursor-pointer">
          <Plus className="w-4 h-4" /> Create Workspace
        </button>
      </div>

      <div className="grid gap-4">
        {workspaces.map(({ workspace, role }) => (
          <div key={workspace.id} className="p-6 bg-[#18191C] border border-[#202126] rounded-[12px] hover:border-[#696CFF] transition-all">
            <div className="flex items-start justify-between">
              <div className="flex-1 cursor-pointer" onClick={() => router.push(`/settings/${workspace.id}`)}>
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-[#FFFFFF]">{workspace.name}</h3>
                  <span className="text-[9px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-lg bg-[#6B7280]/10 border border-[#6B7280]/20 text-[#8A8D96]">{role}</span>
                  {workspace.status === "inactive" && (
                    <span className="text-[9px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-lg bg-[#FFB020]/10 border border-[#FFB020]/20 text-[#FFB020]">inactive</span>
                  )}
                </div>
                <p className="text-xs text-[#8A8D96] font-medium uppercase tracking-wider mt-1">/{workspace.slug}</p>
                <p className="text-xs text-[#8A8D96] mt-2">Plan: {workspace.plan}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={(e) => handleSwitch(workspace.id, e)} className="p-2 hover:bg-[#18191C] rounded-[12px] text-[#8A8D96] hover:text-[#FFFFFF] transition-all cursor-pointer" title="Switch to this workspace">
                  <ArrowRightLeft className="w-4 h-4" />
                </button>
                <Settings className="w-5 h-5 text-[#8A8D96]" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCreateForm(false)} />
          <div className="relative w-full max-w-md bg-[#18191C] border border-[#202126] rounded-[16px] shadow-2xl shadow-black/50 overflow-hidden">
            <div className="px-6 py-5 border-b border-[#202126]">
              <h2 className="text-sm font-bold text-[#FFFFFF]">Create Workspace</h2>
            </div>
            <form onSubmit={handleCreate} className="px-6 py-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#FFFFFF]/80 block mb-1.5">Name</label>
                <input value={name} onChange={e => setName(e.target.value)} required className="w-full px-3.5 py-2.5 bg-[#18191C] border border-[#202126] hover:border-[#696CFF] focus:border-[#696CFF] rounded-[12px] text-xs text-[#FFFFFF] placeholder-[#8A8D96] focus:outline-none transition-colors" />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#FFFFFF]/80 block mb-1.5">Slug (optional)</label>
                <input value={slug} onChange={e => setSlug(e.target.value)} placeholder="Auto-generated from name" className="w-full px-3.5 py-2.5 bg-[#18191C] border border-[#202126] hover:border-[#696CFF] focus:border-[#696CFF] rounded-[12px] text-xs text-[#FFFFFF] placeholder-[#8A8D96] focus:outline-none transition-colors" />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#FFFFFF]/80 block mb-1.5">Plan</label>
                <select value={plan} onChange={e => setPlan(e.target.value)} className="w-full px-3.5 py-2.5 bg-[#18191C] border border-[#202126] hover:border-[#696CFF] focus:border-[#696CFF] rounded-[12px] text-xs text-[#FFFFFF] cursor-pointer focus:outline-none transition-colors">
                  <option value="free">Free</option>
                  <option value="starter">Starter</option>
                  <option value="growth">Growth</option>
                  <option value="pro">Pro</option>
                  <option value="scale">Scale</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button type="button" onClick={() => setShowCreateForm(false)} className="flex-1 px-4 py-2.5 bg-[#18191C] hover:bg-[#25262B] border border-[#202126] rounded-[12px] text-xs font-semibold text-[#8A8D96] hover:text-[#FFFFFF] transition-all cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={isCreating} className="flex-1 px-4 py-2.5 bg-[#696CFF] hover:bg-[#5A5CE6] text-[#FFFFFF] rounded-[12px] text-xs font-semibold transition-all cursor-pointer disabled:opacity-50">
                  {isCreating ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  )
}
