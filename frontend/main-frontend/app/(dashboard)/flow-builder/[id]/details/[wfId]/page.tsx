import { use } from "react"
import WorkflowDetailView from "@/components/workflows/workflow-detail-view"

export default function FlowBuilderDetailPage({ params }: { params: Promise<{ id: string; wfId: string }> }) {
  const { id, wfId } = use(params)
  return <WorkflowDetailView workspaceId={id} workflowId={wfId} />
}
