import { use } from "react"
import CampaignsView from "@/components/campaigns/campaigns-view"

export default function WorkspaceCampaignsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  return <CampaignsView workspaceId={slug} />
}
