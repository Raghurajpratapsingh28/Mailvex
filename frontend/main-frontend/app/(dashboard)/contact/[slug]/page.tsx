import { use } from "react"
import ContactsView from "@/components/contacts/contacts-view"

export default function ContactWorkspacePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  return <ContactsView workspaceId={slug} />
}
