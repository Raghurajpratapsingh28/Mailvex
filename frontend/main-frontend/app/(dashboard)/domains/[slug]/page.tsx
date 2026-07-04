import { use } from "react"
import DomainsView from "@/components/domains/domains-view"

export default function DomainsWorkspacePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  return <DomainsView workspaceId={slug} />
}
