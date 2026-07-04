import { use } from "react"
import CampaignFormView from "@/components/campaigns/campaign-form-view"

export default function CampaignEditPage({ params }: { params: Promise<{ slug: string; id: string }> }) {
  const { slug, id } = use(params)
  return <CampaignFormView workspaceId={slug} campaignId={id} />
}
