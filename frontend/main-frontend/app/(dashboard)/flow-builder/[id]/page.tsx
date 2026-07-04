import { use } from "react"
import WorkflowsView from "@/components/workflows/workflows-view"

export default function FlowBuilderWorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return <WorkflowsView workspaceId={id} />
}
