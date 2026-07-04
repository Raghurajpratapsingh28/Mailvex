"use client"

import { useState } from "react"
import { Save } from "lucide-react"
import { workspaceService, type Workspace } from "@/lib/workspace-service"

export default function WorkspaceTab({ workspace, workspaceId, onUpdate }: { workspace: Workspace; workspaceId: string; onUpdate: () => void }) {
  const [name, setName] = useState(workspace.name)
  const [slug, setSlug] = useState(workspace.slug)
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async () => {
    setIsLoading(true)
    try {
      await workspaceService.updateWorkspace(workspaceId, {
        name,
        slug,
        version: workspace.version,
      })
      onUpdate()
    } catch (error) {
      console.error("Failed to update workspace:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <Section title="Workspace Information">
        <Field label="Name">
          <input value={name} onChange={e => setName(e.target.value)} className={inputCls} />
        </Field>
        <Field label="Slug">
          <input value={slug} onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))} className={inputCls} />
          <p className="text-[9px] text-[#8A8D96] font-medium uppercase tracking-wider mt-1">app.Mailvex.com/{slug}</p>
        </Field>
        <Field label="Plan">
          <div className="text-xs text-[#8A8D96] font-medium uppercase tracking-wider">{workspace.plan}</div>
        </Field>
        <Field label="Status">
          <div className={`inline-flex text-[9px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-lg ${workspace.status === "active" ? "bg-[#3CD3AD]/10 border border-[#3CD3AD]/20 text-[#3CD3AD]" : "bg-[#FFB020]/10 border border-[#FFB020]/20 text-[#FFB020]"}`}>
            {workspace.status}
          </div>
        </Field>
      </Section>

      <button onClick={handleSave} disabled={isLoading} className="flex items-center gap-2 px-5 py-2.5 bg-[#696CFF] hover:bg-[#5A5CE6] text-[#FFFFFF] rounded-[12px] text-xs font-semibold shadow-lg shadow-[#696CFF]/15 transition-all cursor-pointer disabled:opacity-50">
        <Save className="w-3.5 h-3.5" /> {isLoading ? "Saving..." : "Save Changes"}
      </button>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h3 className="text-xs font-semibold text-[#FFFFFF]/80 tracking-tight border-b border-[#202126] pb-2">{title}</h3>
      {children}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-[#FFFFFF]/80 tracking-tight block">{label}</label>
      {children}
    </div>
  )
}

const inputCls = "w-full px-3.5 py-2.5 bg-[#18191C] border border-[#202126] hover:border-[#696CFF] focus:border-[#696CFF] rounded-[12px] text-xs text-[#FFFFFF] placeholder-[#8A8D96] focus:outline-none transition-colors"
