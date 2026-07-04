"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import { useShortcut } from "@/lib/keyboard-shortcuts"
import { Plus, Upload, ArrowLeft, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import ContactFilters from "./contact-filters"
import ContactTable from "./contact-table"
import ContactDrawer from "./contact-drawer"
import BulkImport from "./bulk-import"
import { contactsService } from "@/lib/contacts-service"
import type { Contact as ApiContact } from "@/lib/contacts-service"
import type { Contact } from "@/lib/contacts-data"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"
import { useContacts } from "@/lib/redux/useCache"

interface Props {
  workspaceId?: string
}

export default function ContactsView({ workspaceId: propWorkspaceId }: Props) {
  const { user } = useAuth()
  const router = useRouter()

  const workspaceId = propWorkspaceId ?? user?.workspaces?.[0]?.id ?? ""

  const { contacts: apiContacts, total, filters, loading, updateFilters, patch, remove, refetch } = useContacts(workspaceId || null)
  const contacts = apiContacts as unknown as Contact[]

  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [drawerMode, setDrawerMode] = useState<"view" | "create" | "edit">("view")
  useShortcut("n", () => { setDrawerMode("create"); setSelectedContact(null); setIsDrawerOpen(true) })
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [isImportOpen, setIsImportOpen] = useState(false)

  const availableTags = useMemo(() => {
    const tagsSet = new Set<string>()
    contacts.forEach(c => c.tags?.forEach(t => tagsSet.add(t)))
    return Array.from(tagsSet).slice(0, 8)
  }, [contacts])

  const handleToggleTag = (tag: string) => {
    const next = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag]
    updateFilters({ tags: next })
  }

  const handleOpenDrawer = (mode: "view" | "create" | "edit", contact: Contact | null) => {
    setDrawerMode(mode)
    setSelectedContact(contact)
    setIsDrawerOpen(true)
  }

  const handleSaveContact = async (formData: Partial<Contact>) => {
    try {
      if (drawerMode === "create") {
        await contactsService.createContact(workspaceId, formData as Partial<ApiContact>)
      } else if (drawerMode === "edit" && selectedContact) {
        const res = await contactsService.updateContact(workspaceId, selectedContact.id, formData as Partial<ApiContact>)
        patch({ ...res.contact, id: selectedContact.id })
      }
      setIsDrawerOpen(false)
      refetch()
    } catch (error) {
      console.error("Failed to save contact:", error)
    }
  }

  const handleDeleteContact = async (contactId: string) => {
    if (!confirm("Delete this contact?")) return
    try {
      await contactsService.deleteContact(workspaceId, contactId)
      remove(contactId)
    } catch (error) {
      console.error("Failed to delete contact:", error)
    }
  }

  const handleBulkImportComplete = (imported: number, skipped: number) => {
    toast.success("Import complete", {
      description: `${imported} contact${imported !== 1 ? "s" : ""} imported, ${skipped} duplicate${skipped !== 1 ? "s" : ""} skipped.`,
    })
    setIsImportOpen(false)
    refetch()
  }

  const handleSuppress = async (contactId: string) => {
    try {
      const res = await contactsService.suppressContact(workspaceId, contactId)
      patch({ ...res.contact, id: contactId } as ApiContact & { id: string })
    } catch (error) {
      console.error("Failed to suppress contact:", error)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 max-w-[1400px] mx-auto select-none"
    >
      <div className="flex items-center justify-between">
        <div>
          {propWorkspaceId && (
            <button
              onClick={() => router.push("/contact")}
              className="flex items-center gap-1.5 text-[10px] font-medium text-[#8A8D96] hover:text-[#FFFFFF] transition-colors mb-2 cursor-pointer"
            >
              <ArrowLeft className="w-3 h-3" /> All Workspaces
            </button>
          )}
          <span className="text-[10px] text-[#8A8D96] font-medium uppercase tracking-wider">Contact Management</span>
          <div className="flex items-center gap-3 mt-1">
            <h1 className="text-2xl font-bold tracking-tight text-[#FFFFFF] leading-none">Contacts</h1>
            <div className="flex items-baseline gap-1 bg-[#18191C] border border-[#202126] px-2.5 py-0.5 rounded-full text-xs font-medium text-[#8A8D96]">
              <span className="text-[#FFFFFF] font-bold">{total}</span>
              <span className="text-[9px] uppercase">Total</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsImportOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 enterprise-btn bg-transparent border border-[#202126] rounded-[12px] text-xs font-semibold text-[#FFFFFF] hover:border-[#8A8D96] transition-all cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-[#8A8D96]" /> Import
          </button>
          <button
            onClick={() => handleOpenDrawer("create", null)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#696CFF] hover:bg-[#5A5CE6] text-[#FFFFFF] rounded-[12px] text-xs font-semibold transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-white" /> Add Contact
          </button>
        </div>
      </div>

      <ContactFilters
        searchQuery={filters.search}
        setSearchQuery={(v) => updateFilters({ search: v })}
        lifecycleStage={filters.lifecycleStage}
        setLifecycleStage={(v) => updateFilters({ lifecycleStage: v })}
        selectedTags={filters.tags}
        availableTags={availableTags}
        toggleTag={handleToggleTag}
        showSuppressed={filters.showSuppressed}
        setShowSuppressed={(v) => updateFilters({ showSuppressed: v })}
        showUnsubscribed={filters.showUnsubscribed}
        setShowUnsubscribed={(v) => updateFilters({ showUnsubscribed: v })}
        dateFrom={filters.dateFrom}
        setDateFrom={(v) => updateFilters({ dateFrom: v })}
        dateTo={filters.dateTo}
        setDateTo={(v) => updateFilters({ dateTo: v })}
      />

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-6 h-6 text-[#8A8D96] animate-spin" />
        </div>
      ) : (
        <ContactTable
          contacts={contacts}
          onView={(c) => handleOpenDrawer("view", c)}
          onEdit={(c) => handleOpenDrawer("edit", c)}
          onDelete={(id) => handleDeleteContact(id)}
          onToggleSuppress={(id) => handleSuppress(id)}
        />
      )}

      {!loading && total > 0 && (
        <div className="flex items-center justify-between text-[11px] font-medium text-[#8A8D96] px-1">
          <span>Showing {contacts.length} of {total} contacts</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => updateFilters({ page: Math.max(1, filters.page - 1) })}
              disabled={filters.page === 1}
              className="px-2.5 py-1 bg-transparent text-[#FFFFFF] border border-[#202126] rounded-[8px] disabled:opacity-40 hover:border-[#8A8D96] transition-all cursor-pointer disabled:cursor-not-allowed"
            >
              Prev
            </button>
            <span className="text-[#FFFFFF]">Page {filters.page}</span>
            <button
              onClick={() => updateFilters({ page: filters.page + 1 })}
              disabled={contacts.length < 50}
              className="px-2.5 py-1 bg-transparent text-[#FFFFFF] border border-[#202126] rounded-[8px] disabled:opacity-40 hover:border-[#8A8D96] transition-all cursor-pointer disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <ContactDrawer
        isOpen={isDrawerOpen}
        mode={drawerMode}
        contact={selectedContact}
        onClose={() => setIsDrawerOpen(false)}
        onSave={handleSaveContact}
      />

      <BulkImport
        isOpen={isImportOpen}
        workspaceId={workspaceId}
        onClose={() => setIsImportOpen(false)}
        onImportComplete={handleBulkImportComplete}
      />
    </motion.div>
  )
}
