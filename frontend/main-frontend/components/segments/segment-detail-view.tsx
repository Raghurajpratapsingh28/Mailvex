"use client"

import { useState } from "react"
import { Segment, ContactPreview, formatRelative } from "@/lib/segments-data"
import { SegmentStatusBadge, SegmentTypeBadge } from "./segment-status-badge"
import FilterBuilder from "./filter-builder"
import AddContactModal from "./add-contact-modal"
import { segmentsService } from "@/lib/segments-service"
import { type Contact } from "@/lib/contacts-service"
import { ArrowLeft, RefreshCw, Pencil, Trash2, Users, UserPlus, X } from "lucide-react"
import { toast } from "sonner"

interface Props {
  segment: Segment
  contacts: ContactPreview[]
  workspaceId: string
  onBack: () => void
  onEdit: (s: Segment) => void
  onRefresh: (s: Segment) => void
  onDelete: (s: Segment) => void
  onContactsChanged: (contacts: ContactPreview[], countDelta: number) => void
}

export default function SegmentDetailView({ segment, contacts, workspaceId, onBack, onEdit, onRefresh, onDelete, onContactsChanged }: Props) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)

  const existingIds = new Set(contacts.map((c) => c.id))

  const handleAddContact = async (contact: Contact) => {
    try {
      await segmentsService.addContactToSegment(workspaceId, segment.id, contact.id)
      const newContact: ContactPreview = {
        id: contact.id,
        email: contact.email,
        firstName: contact.firstName,
        lastName: contact.lastName,
        lifecycleStage: contact.lifecycleStage,
      }
      onContactsChanged([...contacts, newContact], 1)
    } catch (err: any) {
      toast.error(err.message || "Failed to add contact")
    }
  }

  const handleRemoveContact = async (contactId: string) => {
    setRemovingId(contactId)
    try {
      await segmentsService.removeContactFromSegment(workspaceId, segment.id, contactId)
      onContactsChanged(contacts.filter((c) => c.id !== contactId), -1)
    } catch (err: any) {
      toast.error(err.message || "Failed to remove contact")
    } finally {
      setRemovingId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-[10px] font-medium text-[#8A8D96] hover:text-[#FFFFFF] transition-colors mb-3 cursor-pointer"
          >
            <ArrowLeft className="w-3 h-3" /> Back to Segments
          </button>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight text-[#FFFFFF]">{segment.name}</h1>
            <SegmentTypeBadge type={segment.type} />
            <SegmentStatusBadge status={segment.status} />
          </div>
          <div className="flex items-center gap-4 mt-2 text-xs text-[#8A8D96]">
            {segment.status === "ready" && (
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#8A8D96]" />
                <span className="font-medium text-[#FFFFFF]">{segment.contactCount.toLocaleString()}</span>
                <span>contacts</span>
              </span>
            )}
            <span className="font-medium">Last computed: {formatRelative(segment.lastComputed)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {segment.type === "static" && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-transparent hover:bg-[#25262B] border border-transparent hover:border-[#8A8D96] rounded-[8px] text-xs font-medium text-[#8A8D96] hover:text-[#FFFFFF] transition-all cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5 text-[#3CD3AD]" /> Add Contact
            </button>
          )}
          <button
            onClick={() => onRefresh(segment)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-transparent hover:bg-[#25262B] border border-transparent hover:border-[#8A8D96] rounded-[8px] text-xs font-medium text-[#8A8D96] hover:text-[#FFFFFF] transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#696CFF]" /> Refresh
          </button>
          <button
            onClick={() => onEdit(segment)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-transparent hover:bg-[#25262B] border border-transparent hover:border-[#8A8D96] rounded-[8px] text-xs font-medium text-[#8A8D96] hover:text-[#FFFFFF] transition-all cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5 text-[#8A8D96]" /> Edit
          </button>
          <button
            onClick={() => onDelete(segment)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-transparent hover:bg-[#FF5A4F]/10 border border-transparent hover:border-[#FF5A4F]/25 rounded-[8px] text-xs font-medium text-[#FF5A4F] transition-all cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: Filter Rules + Contact Preview */}
        <div className="xl:col-span-2 space-y-6">
          {/* Filter Rules */}
          {segment.type === "dynamic" && segment.filterTree && (
            <div className="enterprise-card p-6">
              <h3 className="text-[10px] font-medium text-[#8A8D96] tracking-wider uppercase mb-4">
                Filter Rules
              </h3>
              <FilterBuilder tree={segment.filterTree} onChange={() => {}} readOnly />
            </div>
          )}

          {segment.type === "static" && (
            <div className="enterprise-card p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[10px] font-medium text-[#8A8D96] tracking-wider uppercase">Membership</h3>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="flex items-center gap-1 text-[10px] font-medium text-[#3CD3AD] hover:text-[#FFFFFF] transition-colors cursor-pointer"
                >
                  <UserPlus className="w-3 h-3" /> Add contact
                </button>
              </div>
              <p className="text-xs text-[#8A8D96]">
                Contacts are managed manually. Use the <span className="text-[#FFFFFF]">Add Contact</span> button to add members.
              </p>
            </div>
          )}

          {/* Contact Preview */}
          <div className="enterprise-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] font-medium text-[#8A8D96] tracking-wider uppercase">
                Contact Preview
              </h3>
              <span className="text-[10px] font-medium text-[#8A8D96]">Showing up to 100</span>
            </div>

            {contacts.length === 0 ? (
              <p className="text-xs text-[#8A8D96] font-medium">No contacts to preview.</p>
            ) : (
              <div className="overflow-x-auto rounded-[12px] border border-[#202126]">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-[#202126] bg-[#0D0E12]">
                      {["Email", "Name", "Lifecycle Stage", ...(segment.type === "static" ? [""] : [])].map((col, i) => (
                        <th key={i} className="px-4 py-3 text-left text-[10px] font-medium text-[#8A8D96] tracking-wider uppercase">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#202126]">
                    {contacts.map((c) => (
                      <tr key={c.id} className="hover:bg-[#25262B] transition-colors">
                        <td className="px-4 py-3 font-medium text-[#FFFFFF]">{c.email}</td>
                        <td className="px-4 py-3 text-[#8A8D96]">{c.firstName} {c.lastName}</td>
                        <td className="px-4 py-3">
                          <span className="text-[9px] font-medium px-2 py-0.5 bg-[#8A8D96]/10 border border-[#8A8D96]/25 text-[#8A8D96] rounded-full uppercase">
                            {c.lifecycleStage}
                          </span>
                        </td>
                        {segment.type === "static" && (
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => handleRemoveContact(c.id)}
                              disabled={removingId === c.id}
                              className="p-1.5 rounded-[8px] hover:bg-[#FF5A4F]/10 text-[#8A8D96] hover:text-[#FF5A4F] transition-colors cursor-pointer disabled:opacity-40"
                              title="Remove from segment"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right: Metadata */}
        <div className="enterprise-card p-6 h-fit">
          <h3 className="text-[10px] font-medium text-[#8A8D96] tracking-wider uppercase mb-4">
            Metadata
          </h3>
          <div className="space-y-4">
            {[
              { label: "Segment ID", value: segment.id },
              { label: "Created By", value: segment.createdBy },
              { label: "Created At", value: new Date(segment.createdAt).toLocaleString() },
              { label: "Updated At", value: new Date(segment.updatedAt).toLocaleString() },
              { label: "Type", value: segment.type },
              { label: "Status", value: segment.status },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-[9px] font-medium text-[#8A8D96] uppercase tracking-wider mb-0.5">{label}</p>
                <p className="text-xs text-[#FFFFFF] font-medium break-all">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <AddContactModal
        isOpen={isAddModalOpen}
        workspaceId={workspaceId}
        segmentId={segment.id}
        existingContactIds={existingIds}
        onAdd={handleAddContact}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  )
}
