import { use } from "react"
import TemplateEditView from "@/components/transactional/template-edit-view"

export default function TemplatePage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ edit?: string }> }) {
  const { slug } = use(params)
  const { edit } = use(searchParams)
  return <TemplateEditView workspaceId={slug} templateId={edit} />
}
