import { use } from "react"
import WorkflowCreateView from "@/components/workflows/workflow-create-view"

export default function FlowBuilderCreatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return <WorkflowCreateView workspaceId={id} />
}
