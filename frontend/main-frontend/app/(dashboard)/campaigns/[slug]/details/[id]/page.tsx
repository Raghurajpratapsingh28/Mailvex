import { use } from "react"
import CampaignDetailPage from "@/components/campaigns/campaign-detail-page"

export default function CampaignDetailsPage({ params }: { params: Promise<{ slug: string; id: string }> }) {
  const { slug, id } = use(params)
  return <CampaignDetailPage workspaceId={slug} campaignId={id} />
}
