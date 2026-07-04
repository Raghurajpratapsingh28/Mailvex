"use client"

import { useState, useEffect, useRef } from "react"
import { X, Search, Loader2, UserPlus, Check } from "lucide-react"
import { contactsService, type Contact } from "@/lib/contacts-service"

interface Props {
  isOpen: boolean
  workspaceId: string
  segmentId: string
  existingContactIds: Set<string>
  onAdd: (contact: Contact) => void
  onClose: () => void
}

export default function AddContactModal({ isOpen, workspaceId, segmentId, existingContactIds, onAdd, onClose }: Props) {
  const [search, setSearch] = useState("")
  const [contacts, setContacts] = useState<Contact[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [addingId, setAddingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setSearch("")
      setContacts([])
      setError(null)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const timer = setTimeout(async () => {
      setIsLoading(true)
      setError(null)
      try {
        const res = await contactsService.getContacts(workspaceId, { search, pageSize: 20 })
        setContacts(res.items)
      } catch (err: any) {
        setError(err.message || "Failed to search contacts")
      } finally {
        setIsLoading(false)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [search, isOpen, workspaceId])

  const handleAdd = async (contact: Contact) => {
    setAddingId(contact.id)
    try {
      onAdd(contact)
    } finally {
      setAddingId(null)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#0D0F15] border border-[#1E2230] rounded-3xl shadow-2xl shadow-black/50 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1C202C]">
          <div className="flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-[#6B7280]" />
            <h2 className="text-sm font-semibold text-white/90">Add Contact to Segment</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[#1C202C] text-[#7A8499] hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-4 border-b border-[#1C202C]">
          <div className="flex items-center gap-2.5 bg-[#111319] border border-[#1E2230] rounded-xl px-3 py-2.5">
            <Search className="w-3.5 h-3.5 text-[#6B7280] shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by email or name..."
              className="flex-1 bg-transparent text-xs text-white placeholder-[#4B5563] outline-none"
            />
            {isLoading && <Loader2 className="w-3.5 h-3.5 text-[#6B7280] animate-spin shrink-0" />}
          </div>
        </div>

        {/* Results */}
        <div className="max-h-72 overflow-y-auto">
          {error ? (
            <p className="px-6 py-8 text-xs text-red-400 text-center">{error}</p>
          ) : contacts.length === 0 && !isLoading ? (
            <p className="px-6 py-8 text-xs text-[#4B5563] text-center font-mono">
              {search ? "No contacts found" : "Type to search contacts"}
            </p>
          ) : (
            <ul className="divide-y divide-[#1C202C]/60">
              {contacts.map((c) => {
                const already = existingContactIds.has(c.id)
                return (
                  <li key={c.id} className="flex items-center justify-between px-6 py-3 hover:bg-[#111319] transition-colors">
                    <div className="min-w-0">
                      <p className="text-xs text-white/80 truncate font-mono">{c.email}</p>
                      {(c.firstName || c.lastName) && (
                        <p className="text-[10px] text-[#6B7280] truncate mt-0.5">
                          {[c.firstName, c.lastName].filter(Boolean).join(" ")}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => !already && handleAdd(c)}
                      disabled={already || addingId === c.id}
                      className={`ml-3 shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
                        already
                          ? "bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 cursor-default"
                          : "bg-[#1C202C] hover:bg-[#252833] border border-[#2A2F3F] text-white/70 hover:text-white"
                      }`}
                    >
                      {already ? (
                        <><Check className="w-3 h-3" /> Added</>
                      ) : addingId === c.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <><UserPlus className="w-3 h-3" /> Add</>
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#1C202C]">
          <button
            onClick={onClose}
            className="w-full py-2 text-xs font-semibold text-[#6B7280] hover:text-white transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
