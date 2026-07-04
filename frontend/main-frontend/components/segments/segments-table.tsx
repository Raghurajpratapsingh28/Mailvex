"use client"

import { Segment, formatRelative } from "@/lib/segments-data"
import { SegmentStatusBadge, SegmentTypeBadge } from "./segment-status-badge"
import { Eye, Pencil, RefreshCw, Trash2, Users } from "lucide-react"

interface Props {
  segments: Segment[]
  onView: (s: Segment) => void
  onEdit: (s: Segment) => void
  onRefresh: (s: Segment) => void
  onDelete: (s: Segment) => void
}

export default function SegmentsTable({ segments, onView, onEdit, onRefresh, onDelete }: Props) {
  if (segments.length === 0) {
    return (
      <div className="p-12 enterprise-card flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-[12px] bg-[#8A8D96]/10 border border-[#8A8D96]/25 flex items-center justify-center text-[#8A8D96] mb-4">
          <Users className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-[#FFFFFF]">No Segments Found</h3>
        <p className="text-xs text-[#8A8D96] mt-1.5 max-w-[280px] leading-relaxed">
          Create your first segment to start grouping contacts by rules or manual selection.
        </p>
      </div>
    )
  }

  return (
    <div className="enterprise-card rounded-[16px] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[#202126] bg-[#0D0E12]">
              {["Name", "Type", "Contacts", "Status", "Last Computed", "Created", "Actions"].map((col) => (
                <th
                  key={col}
                  className="px-4 py-3 text-left text-[10px] uppercase font-medium text-[#8A8D96] tracking-wider whitespace-nowrap"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#202126]">
            {segments.map((seg) => (
              <tr
                key={seg.id}
                className="hover:bg-[#25262B] transition-colors duration-200 group"
              >
                {/* Name */}
                <td className="px-4 py-3">
                  <button
                    onClick={() => onView(seg)}
                    className="font-medium text-[#FFFFFF] hover:text-[#8A8D96] transition-colors text-left"
                  >
                    {seg.name}
                  </button>
                </td>

                {/* Type */}
                <td className="px-4 py-3">
                  <SegmentTypeBadge type={seg.type} />
                </td>

                {/* Contact Count */}
                <td className="px-4 py-3">
                  <span className="font-medium text-[#FFFFFF]">
                    {seg.status === "ready" ? seg.contactCount.toLocaleString() : "—"}
                  </span>
                </td>

                {/* Status */}
                <td className="px-4 py-3">
                  <SegmentStatusBadge status={seg.status} />
                </td>

                {/* Last Computed */}
                <td className="px-4 py-3 text-[#8A8D96] font-medium">
                  {formatRelative(seg.lastComputed)}
                </td>

                {/* Created */}
                <td className="px-4 py-3 text-[#8A8D96] font-medium whitespace-nowrap">
                  {new Date(seg.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </td>

                {/* Actions */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ActionBtn onClick={() => onView(seg)} title="View" color="text-[#8A8D96]">
                      <Eye className="w-3.5 h-3.5" />
                    </ActionBtn>
                    <ActionBtn onClick={() => onEdit(seg)} title="Edit" color="text-[#8A8D96]">
                      <Pencil className="w-3.5 h-3.5" />
                    </ActionBtn>
                    <ActionBtn onClick={() => onRefresh(seg)} title="Refresh" color="text-[#696CFF]">
                      <RefreshCw className="w-3.5 h-3.5" />
                    </ActionBtn>
                    <ActionBtn onClick={() => onDelete(seg)} title="Delete" color="text-[#FF5A4F]">
                      <Trash2 className="w-3.5 h-3.5" />
                    </ActionBtn>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ActionBtn({
  onClick, title, color, children
}: {
  onClick: () => void
  title: string
  color: string
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded-[8px] bg-transparent border border-transparent hover:border-[#8A8D96] ${color} hover:bg-[#25262B] transition-all cursor-pointer`}
    >
      {children}
    </button>
  )
}
