import SegmentsView from "@/components/segments/segments-view"
import { use } from "react"

export default function WorkspaceSegmentsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  return <SegmentsView workspaceId={slug} />
}
