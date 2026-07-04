import { WorkflowStatus } from "@/lib/workflows-data"

const META: Record<WorkflowStatus, { label: string; cls: string }> = {
  draft:     { label: "Draft",     cls: "bg-[#18191C] border-[#202126] text-[#8A8D96]" },
  published: { label: "Published", cls: "bg-[#18191C] border-[#202126] text-[#3CD3AD]" },
  paused:    { label: "Paused",    cls: "bg-[#18191C] border-[#202126] text-[#FFB020]" },
  archived:  { label: "Archived",  cls: "bg-[#18191C] border-[#202126] text-[#8A8D96]" },
}

export default function WorkflowStatusBadge({ status }: { status: WorkflowStatus }) {
  const m = META[status]
  return (
    <span className={`inline-flex items-center text-[9px] font-medium font-semibold px-2 py-0.5 border rounded-full uppercase ${m.cls}`}>
      {m.label}
    </span>
  )
}
