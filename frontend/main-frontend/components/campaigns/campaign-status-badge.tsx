import { CampaignStatus, STATUS_META } from "@/lib/campaigns-data"
import { Loader2 } from "lucide-react"

export default function CampaignStatusBadge({ status }: { status: CampaignStatus }) {
  const m = STATUS_META[status] ?? { label: status, color: "text-[#8A8D96]", bg: "bg-[#8A8D96]/10", border: "border-[#8A8D96]/25" }
  return (
    <span className={`inline-flex items-center gap-1 text-[9px] font-medium px-2 py-0.5 border rounded-full uppercase ${m.bg} ${m.border} ${m.color}`}>
      {status === "sending" && <Loader2 className="w-2.5 h-2.5 animate-spin" />}
      {m.label}
    </span>
  )
}
