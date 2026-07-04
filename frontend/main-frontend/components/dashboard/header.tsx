"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, Bell, Settings, Plus, ChevronDown, LayoutDashboard, Calendar } from "lucide-react"
import { useWorkspace } from "@/lib/workspace-context"
import { workspaceService, type Workspace } from "@/lib/workspace-service"
import { apiClient } from "@/lib/api-client"
import CommandPalette from "./command-palette"

export default function Header() {
  const router = useRouter()
  const { workspaceId, setWorkspaceId } = useWorkspace()
  const [workspaces, setWorkspaces] = useState<Array<{ workspace: Workspace; role: string }>>([])
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false)
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null)
  const [paletteOpen, setPaletteOpen] = useState(false)

  const loadWorkspaces = () => {
    workspaceService.getWorkspaces()
      .then((res) => setWorkspaces(res.items))
      .catch(console.error)
  }

  useEffect(() => { loadWorkspaces() }, [])
  useEffect(() => { loadWorkspaces() }, [workspaceId])

  useEffect(() => {
    if (workspaceId && workspaces.length > 0) {
      const ws = workspaces.find(w => w.workspace.id === workspaceId)
      setCurrentWorkspace(ws?.workspace || null)
    }
  }, [workspaceId, workspaces])

  // ⌘K / Ctrl+K global shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setPaletteOpen((v) => !v)
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  const handleSwitchWorkspace = async (wsId: string) => {
    try {
      const res = await workspaceService.switchWorkspace(wsId)
      apiClient.setAccessToken(res.accessToken)
    } catch {}
    setWorkspaceId(wsId)
    setShowWorkspaceMenu(false)
    router.push(`/campaigns/${wsId}`)
  }

  return (
    <>
      <header className="h-16 flex items-center justify-center select-none font-sans text-[#FFFFFF] shrink-0 sticky top-0 z-50 border-b border-[#202126]/60 bg-[#0D0E12]/80 backdrop-blur-md mb-6 pr-3">
        <div className="flex items-center justify-between w-full max-w-[1400px] mx-auto h-full">
          {/* Left - Search trigger */}
          <button
            onClick={() => setPaletteOpen(true)}
            className="relative flex items-center bg-[#18191C] hover:bg-[#25262B] rounded-full px-4 py-2.5 w-80 shadow-sm transition-colors cursor-text group"
            aria-label="Open search"
          >
            <Search className="w-4 h-4 text-[#8A8D96] mr-2 shrink-0" />
            <span className="text-sm text-[#8A8D96] flex-1 text-left">Search...</span>
            <kbd className="hidden sm:flex items-center text-[10px] font-medium text-[#8A8D96] bg-[#25262B] border border-[#2A2B32] rounded px-1.5 py-0.5 shrink-0">
              ⌘K
            </kbd>
          </button>

          {/* Right side navigation utilities */}
          <div className="flex items-center gap-3">
            {/* Date Display */}
            <div className="hidden md:flex items-center gap-2 bg-[#18191C] px-4 py-2.5 rounded-[16px] text-[#8A8D96] text-xs font-medium">
              Wed, 29 May 2024
              <Calendar className="w-4 h-4 ml-1" />
            </div>

            {/* Workspace Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
                className="flex items-center gap-2 bg-[#18191C] rounded-[16px] px-3 py-2 cursor-pointer hover:bg-[#25262B] transition-all h-10"
              >
                <div className="w-6 h-6 rounded-full bg-[#FF5A4F]/20 flex items-center justify-center">
                  <LayoutDashboard className="w-3.5 h-3.5 text-[#FF5A4F]" />
                </div>
                <span className="text-sm font-medium text-[#FFFFFF] max-w-[100px] truncate">{currentWorkspace?.name || 'Workspace'}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#8A8D96]" />
              </button>

              {showWorkspaceMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowWorkspaceMenu(false)} />
                  <div className="absolute top-full right-0 mt-2 w-64 bg-[#202126] rounded-[16px] shadow-lg z-50 py-2 border border-[#2A2B32]">
                    <div className="max-h-60 overflow-y-auto">
                      {workspaces.map(({ workspace }) => (
                        <button
                          key={workspace.id}
                          onClick={() => handleSwitchWorkspace(workspace.id)}
                          className={`w-full text-left px-4 py-2.5 hover:bg-[#2A2B32] transition-colors flex items-center justify-between ${workspace.id === workspaceId ? 'bg-[#2A2B32]' : ''}`}
                        >
                          <span className="text-sm font-medium text-[#FFFFFF]">{workspace.name}</span>
                          {workspace.id === workspaceId && <div className="w-1.5 h-1.5 rounded-full bg-[#FF5A4F]" />}
                        </button>
                      ))}
                    </div>
                    <div className="border-t border-[#2A2B32] mt-1 pt-1 px-2">
                      <button
                        onClick={() => router.push('/settings')}
                        className="w-full flex items-center gap-2 px-2 py-2 text-sm font-medium text-[#8A8D96] hover:text-[#FFFFFF] hover:bg-[#2A2B32] rounded-[12px] transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        New Workspace
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Notifications */}
            <div className="relative p-2.5 bg-[#18191C] rounded-full hover:bg-[#25262B] text-[#8A8D96] hover:text-[#FFFFFF] cursor-pointer transition-all flex items-center justify-center h-10 w-10">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#FF5A4F] rounded-full border-2 border-[#18191C]" />
            </div>

            {/* Settings / Profile */}
            <button
              onClick={() => router.push('/settings')}
              className="p-2.5 bg-[#18191C] hover:bg-[#25262B] text-[#8A8D96] hover:text-[#FFFFFF] rounded-full cursor-pointer transition-all flex items-center justify-center h-10 w-10"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </>
  )
}
