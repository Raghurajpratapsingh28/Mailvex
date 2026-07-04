"use client"

import { Contact } from "@/lib/contacts-data"
import { MoreHorizontal, ShieldAlert, MailX, Eye, Edit2, ShieldAlert as SuppressIcon, Trash2, ShieldCheck } from "lucide-react"
import { useState } from "react"

interface ContactTableProps {
  contacts: Contact[]
  onView: (contact: Contact) => void
  onEdit: (contact: Contact) => void
  onDelete: (contactId: string) => void
  onToggleSuppress: (contactId: string) => void
}

export default function ContactTable({
  contacts,
  onView,
  onEdit,
  onDelete,
  onToggleSuppress
}: ContactTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null)

  // Pagination bounds calculations
  const totalItems = contacts.length
  const totalPages = Math.ceil(totalItems / pageSize) || 1
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, totalItems)
  const paginatedContacts = contacts.slice(startIndex, endIndex)

    const getStageStyle = (stage: string) => {
      switch (stage) {
        case "customer":
          return "bg-[#3CD3AD]/10 border-[#3CD3AD]/25 text-[#3CD3AD]"
        case "prospect":
          return "bg-[#696CFF]/10 border-[#696CFF]/25 text-[#696CFF]"
        case "lead":
          return "bg-[#00E5FF]/10 border-[#00E5FF]/25 text-[#00E5FF]"
        case "churned":
          return "bg-[#FF5A4F]/10 border-[#FF5A4F]/25 text-[#FF5A4F]"
        case "unqualified":
          return "bg-[#FFB020]/10 border-[#FFB020]/25 text-[#FFB020]"
        default:
          return "bg-[#8A8D96]/10 border-[#8A8D96]/25 text-[#8A8D96]"
      }
    }

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  return (
    <div className="enterprise-card rounded-[16px] bg-[#18191C] border-[#202126] overflow-hidden select-none font-sans text-white">
      {/* Table grid wrapper */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#202126] bg-[#0D0E12] text-[10px] text-[#8A8D96] uppercase font-medium tracking-wider">
              <th className="p-4 pl-6">Email / Contact</th>
              <th className="p-4">Name</th>
              <th className="p-4">Phone</th>
              <th className="p-4">Stage</th>
              <th className="p-4">Lead Score</th>
              <th className="p-4">Tags</th>
              <th className="p-4">Status</th>
              <th className="p-4">Created</th>
              <th className="p-4 pr-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#202126] text-xs">
            {paginatedContacts.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-8 text-center text-[#8A8D96]">
                  No matching contacts found in database. Try adjusting your filters.
                </td>
              </tr>
            ) : (
              paginatedContacts.map((contact) => (
                <tr key={contact.id} className="hover:bg-[#25262B] transition-colors duration-300">
                  {/* Email */}
                  <td className="p-4 pl-6 font-medium text-[#FFFFFF]">{contact.email}</td>

                  {/* Name */}
                  <td className="p-4 text-[#8A8D96]">
                    {contact.firstName} {contact.lastName}
                  </td>

                  {/* Phone */}
                  <td className="p-4 font-medium text-[#8A8D96]">{contact.phone || "—"}</td>

                  {/* Lifecycle Stage */}
                  <td className="p-4">
                    <span className={`text-[9px] font-medium px-2 py-0.5 border rounded-full capitalize ${getStageStyle(contact.lifecycleStage)}`}>
                      {contact.lifecycleStage}
                    </span>
                  </td>

                  {/* Lead Score */}
                  <td className="p-4 min-w-[120px]">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-xs text-[#FFFFFF] w-6">{contact.leadScore}</span>
                      <div className="h-1.5 bg-[#0D0E12] rounded-full flex-1 overflow-hidden">
                        <div
                          className="h-full bg-[#696CFF] rounded-full"
                          style={{ width: `${contact.leadScore}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Tags */}
                  <td className="p-4 max-w-[200px]">
                    <div className="flex flex-wrap gap-1">
                      {contact.tags.map((tag) => (
                        <span key={tag} className="px-1.5 py-0.2 bg-[#0D0E12] border border-[#202126] text-[#8A8D96] text-[9px] font-medium rounded">
                          {tag}
                        </span>
                      ))}
                      {contact.tags.length === 0 && <span className="text-[#8A8D96] font-medium">—</span>}
                    </div>
                  </td>

                  {/* Status Indicators */}
                  <td className="p-4">
                    <div className="flex items-center gap-2.5">
                      {contact.emailSuppressed && (
                        <div className="flex items-center gap-1 text-[#FF5A4F] text-[9px] font-medium bg-[#FF5A4F]/10 border border-[#FF5A4F]/25 px-1.5 py-0.2 rounded">
                          <ShieldAlert className="w-3 h-3 text-[#FF5A4F]" />
                          <span>SUPRESSED</span>
                        </div>
                      )}
                      {contact.unsubscribed && (
                        <div className="flex items-center gap-1 text-[#FFB020] text-[9px] font-medium bg-[#FFB020]/10 border border-[#FFB020]/25 px-1.5 py-0.2 rounded">
                          <MailX className="w-3 h-3 text-[#FFB020]" />
                          <span>UNSUB</span>
                        </div>
                      )}
                      {!contact.emailSuppressed && !contact.unsubscribed && (
                        <span className="text-[#3CD3AD] text-[9px] font-medium">Active</span>
                      )}
                    </div>
                  </td>

                  {/* Created Date */}
                  <td className="p-4 font-medium text-[#8A8D96]">
                    {new Date(contact.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric"
                    })}
                  </td>

                  {/* Actions Dropdown */}
                  <td className="p-4 pr-6 text-right relative">
                    <button
                      onClick={() => setActiveMenuId(activeMenuId === contact.id ? null : contact.id)}
                      className="p-1.5 hover:bg-[#25262B] border border-transparent hover:border-[#8A8D96] rounded-lg text-[#8A8D96] hover:text-[#FFFFFF] cursor-pointer transition-colors"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>

                    {/* Popover Action Menu */}
                    {activeMenuId === contact.id && (
                      <>
                        <div className="fixed inset-0 z-30" onClick={() => setActiveMenuId(null)} />
                        <div className="absolute right-6 mt-1 w-44 rounded-[12px] bg-[#18191C] border border-[#202126] shadow-2xl p-1.5 z-40 text-left">
                          <button
                            onClick={() => {
                              onView(contact)
                              setActiveMenuId(null)
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#8A8D96] hover:text-[#FFFFFF] hover:bg-[#25262B] rounded-[8px] cursor-pointer transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Details</span>
                          </button>
                          <button
                            onClick={() => {
                              onEdit(contact)
                              setActiveMenuId(null)
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#8A8D96] hover:text-[#FFFFFF] hover:bg-[#25262B] rounded-[8px] cursor-pointer transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Edit Contact</span>
                          </button>
                          <button
                            onClick={() => {
                              onToggleSuppress(contact.id)
                              setActiveMenuId(null)
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#8A8D96] hover:text-[#FFFFFF] hover:bg-[#25262B] rounded-[8px] cursor-pointer transition-colors"
                          >
                            {contact.emailSuppressed ? (
                              <>
                                <ShieldCheck className="w-3.5 h-3.5 text-[#3CD3AD]" />
                                <span>Unsuppress</span>
                              </>
                            ) : (
                              <>
                                <SuppressIcon className="w-3.5 h-3.5 text-[#FF5A4F]" />
                                <span>Suppress</span>
                              </>
                            )}
                          </button>
                          <div className="h-[1px] bg-[#202126] my-1" />
                          <button
                            onClick={() => {
                              onDelete(contact.id)
                              setActiveMenuId(null)
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#FF5A4F] hover:bg-[#FF5A4F]/10 rounded-[8px] cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete Contact</span>
                          </button>
                        </div>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 bg-[#0D0E12] border-t border-[#202126] flex flex-col sm:flex-row items-center justify-between gap-4 font-medium text-[11px] text-[#8A8D96]">
        <div className="flex items-center gap-2">
          <span>Page size:</span>
          <div className="flex items-center bg-transparent border border-[#202126] hover:border-[#8A8D96] transition-colors rounded-[8px] px-2 py-0.5">
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value))
                setCurrentPage(1)
              }}
              className="bg-transparent text-[#FFFFFF] focus:outline-none cursor-pointer pr-3"
            >
              <option value={10} className="bg-[#18191C]">10</option>
              <option value={20} className="bg-[#18191C]">20</option>
              <option value={50} className="bg-[#18191C]">50</option>
              <option value={100} className="bg-[#18191C]">100</option>
              <option value={200} className="bg-[#18191C]">200</option>
            </select>
          </div>
          <span className="ml-2">
            Showing {startIndex + 1} - {endIndex} of {totalItems} items
          </span>
        </div>

        {/* Page Navigators */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-2 py-1 bg-transparent hover:border-[#8A8D96] disabled:opacity-30 border border-[#202126] rounded-[8px] text-[#FFFFFF] disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            Prev
          </button>
          {Array.from({ length: totalPages }).map((_, idx) => {
            const pageNum = idx + 1
            return (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`px-2.5 py-1 rounded-[8px] text-xs border transition-colors cursor-pointer ${
                  currentPage === pageNum
                    ? "bg-[#696CFF] border-[#696CFF] text-[#FFFFFF]"
                    : "bg-transparent hover:border-[#8A8D96] border-[#202126] text-[#FFFFFF]"
                }`}
              >
                {pageNum}
              </button>
            )
          })}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-2 py-1 bg-transparent hover:border-[#8A8D96] disabled:opacity-30 border border-[#202126] rounded-[8px] text-[#FFFFFF] disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
