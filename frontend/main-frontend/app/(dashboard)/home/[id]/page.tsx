import { use } from "react"
import HomeDashboard from "@/components/home/home-dashboard"

export default function HomeWorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return <HomeDashboard workspaceId={id} />
}
