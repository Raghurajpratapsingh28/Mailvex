import { use } from "react"
import CampaignFormView from "@/components/campaigns/campaign-form-view"

export default function CampaignCreatePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  return <CampaignFormView workspaceId={slug} />
}
