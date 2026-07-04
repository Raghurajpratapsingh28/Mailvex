import { use } from "react"
import TransactionalView from "@/components/transactional/transactional-view"

export default function TransactionalWorkspacePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  return <TransactionalView workspaceId={slug} />
}
