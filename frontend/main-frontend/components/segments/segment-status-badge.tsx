import { SegmentStatus, SegmentType } from "@/lib/segments-data"
import { Loader2 } from "lucide-react"

const STATUS_STYLES: Record<SegmentStatus, string> = {
  pending: "bg-[#696CFF]/10 border-[#696CFF]/25 text-[#696CFF]",
  computing: "bg-[#696CFF]/10 border-[#696CFF]/25 text-[#696CFF]",
  ready: "bg-[#3CD3AD]/10 border-[#3CD3AD]/25 text-[#3CD3AD]",
  failed: "bg-[#FF5A4F]/10 border-[#FF5A4F]/25 text-[#FF5A4F]",
}

const STATUS_LABELS: Record<SegmentStatus, string> = {
  pending: "Pending",
  computing: "Computing",
  ready: "Ready",
  failed: "Failed",
}

const TYPE_STYLES: Record<SegmentType, string> = {
  static: "bg-[#8A8D96]/10 border-[#8A8D96]/25 text-[#8A8D96]",
  dynamic: "bg-[#00E5FF]/10 border-[#00E5FF]/25 text-[#00E5FF]",
}

export function SegmentStatusBadge({ status }: { status: SegmentStatus }) {
  return (
    <span className={`inline-flex items-center gap-1 text-[9px] font-medium px-2 py-0.5 border rounded-full uppercase ${STATUS_STYLES[status]}`}>
      {status === "computing" && <Loader2 className="w-2.5 h-2.5 animate-spin" />}
      {STATUS_LABELS[status]}
    </span>
  )
}

export function SegmentTypeBadge({ type }: { type: SegmentType }) {
  return (
    <span className={`inline-flex items-center text-[9px] font-medium px-2 py-0.5 border rounded-full uppercase ${TYPE_STYLES[type]}`}>
      {type}
    </span>
  )
}
