const META: Record<string, { label: string; cls: string }> = {
  pending:   { label: "Pending",   cls: "bg-[#8A8D96]/10 border-[#8A8D96]/20 text-[#8A8D96]" },
  verifying: { label: "Verifying", cls: "bg-[#696CFF]/10 border-[#696CFF]/20 text-[#696CFF]" },
  verified:  { label: "Verified",  cls: "bg-[#3CD3AD]/10 border-[#3CD3AD]/20 text-[#3CD3AD]" },
  failed:    { label: "Failed",    cls: "bg-[#FF5A4F]/10 border-[#FF5A4F]/20 text-[#FF5A4F]" },
  deleting:  { label: "Deleting",  cls: "bg-[#FFB020]/10 border-[#FFB020]/20 text-[#FFB020]" },
  deleted:   { label: "Deleted",   cls: "bg-[#8A8D96]/10 border-[#8A8D96]/20 text-[#8A8D96]" },
}

export default function DomainStatusBadge({ status }: { status: string }) {
  const m = META[status] ?? { label: status, cls: "bg-[#8A8D96]/10 border-[#8A8D96]/20 text-[#8A8D96]" }
  return (
    <span className={`inline-flex items-center text-[9px] font-medium px-2 py-0.5 border rounded-[8px] uppercase ${m.cls}`}>
      {m.label}
    </span>
  )
}
