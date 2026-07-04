import { use } from "react"
import SendEmailView from "@/components/transactional/send-email-view"

export default function SendEmailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  return <SendEmailView workspaceId={slug} />
}
