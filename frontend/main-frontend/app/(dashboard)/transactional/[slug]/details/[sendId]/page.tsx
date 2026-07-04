import { use } from "react"
import SendDetailView from "@/components/transactional/send-detail-view"

export default function SendDetailPage({ params }: { params: Promise<{ slug: string; sendId: string }> }) {
  const { slug, sendId } = use(params)
  return <SendDetailView workspaceId={slug} sendId={sendId} />
}
