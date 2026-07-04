import { use } from "react"
import ApiKeysView from "@/components/integrations/api-keys-view"

export default function IntegrationsWorkspacePage({
  params,
}: {
  params: Promise<{ workspaceId: string }>
}) {
  const { workspaceId } = use(params)
  return <ApiKeysView workspaceId={workspaceId} />
}
