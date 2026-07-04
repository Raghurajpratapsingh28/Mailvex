import { use } from "react"
import SettingsView from "@/components/settings/settings-view"

export default function WorkspaceSettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return <SettingsView workspaceId={id} />
}
