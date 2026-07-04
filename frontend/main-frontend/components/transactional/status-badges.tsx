import { SendStatus, TemplateStatus, SEND_STATUS_META, TEMPLATE_STATUS_META } from "@/lib/transactional-data"
import { Loader2 } from "lucide-react"

export function SendStatusBadge({ status }: { status: SendStatus }) {
  const m = SEND_STATUS_META[status]
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 border border-[#202126] bg-[#18191C] rounded-[6px] ${m.cls}`}>
      {m.spinner && <Loader2 className="w-2.5 h-2.5 animate-spin" />}
      {m.label}
    </span>
  )
}

export function TemplateStatusBadge({ status }: { status: TemplateStatus }) {
  const m = TEMPLATE_STATUS_META[status]
  return (
    <span className={`inline-flex items-center text-[11px] font-medium px-2 py-0.5 border border-[#202126] bg-[#18191C] rounded-[6px] ${m.cls}`}>
      {m.label}
    </span>
  )
}
