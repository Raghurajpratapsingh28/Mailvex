import { use } from "react"
import DomainDetailPage from "@/components/domains/domain-detail-page"

export default function DomainDetailRoute({ params }: { params: Promise<{ slug: string; id: string }> }) {
  const { slug, id } = use(params)
  return <DomainDetailPage workspaceId={slug} domainId={id} />
}
