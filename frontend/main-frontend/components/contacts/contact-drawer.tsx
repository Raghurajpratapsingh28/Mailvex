"use client"

import { Contact } from "@/lib/contacts-data"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ShieldAlert, Edit, Trash2, ShieldCheck, Plus, Sparkles } from "lucide-react"

interface ContactDrawerProps {
  isOpen: boolean
  onClose: () => void
  mode: "view" | "create" | "edit"
  contact: Contact | null
  onSave: (contact: Partial<Contact>) => void
  onDelete?: (contact: Contact) => void
  onToggleSuppress?: (contact: Contact) => void
}

export default function ContactDrawer({
  isOpen,
  onClose,
  mode,
  contact,
  onSave,
  onDelete,
  onToggleSuppress
}: ContactDrawerProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "properties" | "tags">("overview")

  // Form State
  const [email, setEmail] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phone, setPhone] = useState("")
  const [lifecycleStage, setLifecycleStage] = useState<Contact["lifecycleStage"]>("lead")
  const [leadScore, setLeadScore] = useState(50)
  const [tagInput, setTagInput] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [sourceChannel, setSourceChannel] = useState("Direct Signup")

  // Custom properties key-value state
  const [customProps, setCustomProps] = useState<Array<{ key: string; value: any }>>([])

  // Load contact data when entering edit or view mode
  useEffect(() => {
    if (contact && (mode === "edit" || mode === "view")) {
      setEmail(contact.email)
      setFirstName(contact.firstName)
      setLastName(contact.lastName)
      setPhone(contact.phone || "")
      setLifecycleStage(contact.lifecycleStage as any)
      setLeadScore(contact.leadScore)
      setTags(contact.tags)
      setSourceChannel(contact.source?.channel || "")
      setCustomProps(
        Object.entries(contact.properties || {}).map(([k, v]) => ({
          key: k,
          value: typeof v === "object" ? JSON.stringify(v) : v
        }))
      )
    } else if (mode === "create") {
      setEmail("")
      setFirstName("")
      setLastName("")
      setPhone("")
      setLifecycleStage("lead")
      setLeadScore(50)
      setTags([])
      setSourceChannel("Direct Ingest")
      setCustomProps([{ key: "company", value: "Acme Inc" }])
    }
  }, [contact, mode, isOpen])

  const handleAddPropRow = () => {
    setCustomProps([...customProps, { key: "", value: "" }])
  }

  const handleRemovePropRow = (idx: number) => {
    setCustomProps(customProps.filter((_, i) => i !== idx))
  }

  const handlePropChange = (idx: number, field: "key" | "value", val: string) => {
    const updated = [...customProps]
    updated[idx][field] = val
    setCustomProps(updated)
  }

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault()
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()])
      }
      setTagInput("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const propertiesObj: Record<string, any> = {}
    customProps.forEach((item) => {
      if (item.key.trim()) {
        let val = item.value
        if (val === "true") val = true
        else if (val === "false") val = false
        else if (!isNaN(Number(val)) && val.trim() !== "") val = Number(val)
        propertiesObj[item.key.trim()] = val
      }
    })

    onSave({
      email,
      firstName,
      lastName,
      phone,
      lifecycleStage,
      leadScore,
      tags,
      source: { channel: sourceChannel },
      properties: propertiesObj
    })
    onClose()
  }

  // Generate initials for avatar
  const getInitials = () => {
    if (!firstName && !lastName) return "U"
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-50 cursor-pointer"
          />

          {/* Sliding sheet container */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-[#0D0E12] border-l border-[#202126] text-[#FFFFFF] z-50 flex flex-col justify-between font-sans overflow-hidden"
          >
            {/* 1. Header block */}
            <div className="p-6 border-b border-[#202126] flex items-center justify-between bg-[#0D0E12]">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[#8A8D96] font-medium uppercase tracking-widest leading-none">
                  CRM Inspector
                </span>
                <span className="bg-[#25262B] text-[#8A8D96] text-[9px] font-medium px-2 py-0.5 rounded-[8px] uppercase">
                  {mode} Mode
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-[#25262B] border border-transparent hover:border-[#202126] rounded-[8px] text-[#8A8D96] hover:text-[#FFFFFF] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 2. Scrollable Body Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {mode === "view" && contact && (
                /* INSPECTOR DETAIL VIEW */
                <div className="space-y-6">
                  {/* Profile banner */}
                  <div className="flex items-center gap-4 bg-[#18191C] p-5 rounded-[16px] border border-[#202126]">
                    <div className="w-14 h-14 rounded-[12px] bg-gradient-to-br from-[#696CFF] to-[#5A5CE6] flex items-center justify-center font-bold text-lg tracking-tight select-none shadow-md shadow-[#696CFF]/10 text-[#FFFFFF]">
                      {getInitials()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-[#FFFFFF] leading-snug truncate">
                        {contact.firstName} {contact.lastName}
                      </h3>
                      <p className="text-xs text-[#8A8D96] font-medium truncate leading-none mt-1">{contact.email}</p>
                      <div className="flex items-center gap-2 mt-2.5">
                        <span className="bg-[#18191C] border border-[#202126] text-[#8A8D96] text-[9px] font-medium px-2 py-0.5 rounded-full capitalize">
                          {contact.lifecycleStage}
                        </span>
                        <span className="bg-[#18191C] border border-[#202126] text-[#8A8D96] text-[9px] font-medium px-2 py-0.5 rounded-[8px]">
                          Score: {contact.leadScore}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Inspector Quick actions */}
                  <div className="flex gap-2">
                    {onToggleSuppress && (
                      <button
                        onClick={() => onToggleSuppress(contact)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold border transition-all duration-300 cursor-pointer ${
                          contact.suppressed
                            ? "bg-[#3CD3AD]/10 border-[#3CD3AD]/25 text-[#3CD3AD] hover:bg-[#3CD3AD]/20"
                            : "bg-[#FE5C5C]/10 border-[#FE5C5C]/25 text-[#FE5C5C] hover:bg-[#FE5C5C]/20"
                        }`}
                      >
                        {contact.suppressed ? (
                          <>
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Unsuppress Profile</span>
                          </>
                        ) : (
                          <>
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>Suppress Profile</span>
                          </>
                        )}
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => {
                          onDelete(contact)
                          onClose()
                        }}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-[#FE5C5C]/5 border border-[#FE5C5C]/15 hover:bg-[#FE5C5C]/15 text-xs font-semibold text-[#FE5C5C] py-2 rounded-xl transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Contact</span>
                      </button>
                    )}
                  </div>

                  {/* Tabs Section selectors */}
                  <div className="border-b border-[#202126] flex gap-4 text-xs font-semibold">
                    {[
                      { id: "overview", label: "Overview" },
                      { id: "properties", label: "Custom Details" },
                      { id: "tags", label: "Tag Chips" }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`pb-2.5 relative transition-colors duration-300 cursor-pointer ${
                          activeTab === tab.id ? "text-[#696CFF]" : "text-[#8A8D96] hover:text-[#FFFFFF]"
                        }`}
                      >
                        <span>{tab.label}</span>
                        {activeTab === tab.id && (
                          <motion.div layoutId="tab-glow-bar" className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#696CFF]" />
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Tab Contents */}
                  <div className="pt-2">
                    {activeTab === "overview" && (
                      <div className="space-y-4 text-xs">
                        {[
                          { label: "Phone Connection", val: contact.phone || "—", mono: false },
                          { label: "Traffic Source", val: contact.sourceChannel, mono: false },
                          { label: "Profile Created", val: new Date(contact.createdAt).toLocaleString(), mono: false },
                          { label: "Database ID", val: contact.id, mono: false }
                        ].map((row) => (
                          <div key={row.label} className="flex justify-between py-2 border-b border-[#202126]">
                            <span className="text-[#8A8D96]">{row.label}</span>
                            <span className={`font-semibold text-[#FFFFFF]`}>{row.val}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {activeTab === "properties" && (
                      <div className="space-y-3.5">
                        {Object.entries(contact.customProperties ?? {}).length === 0 ? (
                          <p className="text-xs text-[#8A8D96] font-medium italic">No custom JSON fields registered.</p>
                        ) : (
                          Object.entries(contact.customProperties ?? {}).map(([k, v]) => (
                            <div key={k} className="p-3 bg-[#0D0E12] border border-[#202126] rounded-[12px] flex items-center justify-between">
                              <span className="text-xs font-medium text-[#8A8D96]">{k}</span>
                              <span className="text-xs font-medium text-[#FFFFFF]">
                                {typeof v === "object" ? JSON.stringify(v) : String(v)}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {activeTab === "tags" && (
                      <div className="flex flex-wrap gap-1.5">
                        {contact.tags.map((tag) => (
                          <span key={tag} className="px-2.5 py-0.5 bg-[#18191C] border border-[#202126] text-[#8A8D96] text-[10px] rounded-full font-semibold">
                            {tag}
                          </span>
                        ))}
                        {contact.tags.length === 0 && (
                          <p className="text-xs text-[#8A8D96] italic">No tags attached to this profile.</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {mode !== "view" && (
                /* CREATE / EDIT FORM VIEW */
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Email (Required) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#8A8D96] uppercase tracking-wider">Email address *</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="name@company.com"
                      className="w-full px-4 py-2.5 bg-[#0D0E12] border border-[#202126] focus:border-[#696CFF]/50 rounded-[12px] text-xs placeholder-[#8A8D96] focus:outline-none text-[#FFFFFF]"
                    />
                  </div>

                  {/* First & Last Name */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#8A8D96] uppercase tracking-wider">First Name</label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Amélie"
                        className="w-full px-4 py-2.5 bg-[#0D0E12] border border-[#202126] focus:border-[#696CFF]/50 rounded-[12px] text-xs placeholder-[#8A8D96] focus:outline-none text-[#FFFFFF]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#8A8D96] uppercase tracking-wider">Last Name</label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Laurent"
                        className="w-full px-4 py-2.5 bg-[#0D0E12] border border-[#202126] focus:border-[#696CFF]/50 rounded-[12px] text-xs placeholder-[#8A8D96] focus:outline-none text-[#FFFFFF]"
                      />
                    </div>
                  </div>

                  {/* Phone Connection */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#8A8D96] uppercase tracking-wider">Phone number</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 019-2834"
                      className="w-full px-4 py-2.5 bg-[#0D0E12] border border-[#202126] focus:border-[#696CFF]/50 rounded-[12px] text-xs placeholder-[#8A8D96] focus:outline-none text-[#FFFFFF]"
                    />
                  </div>

                  {/* Lifecycle Dropdown */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#8A8D96] uppercase tracking-wider">Lifecycle Stage</label>
                    <div className="relative">
                      <select
                        value={lifecycleStage}
                        onChange={(e) => setLifecycleStage(e.target.value as any)}
                        className="w-full px-4 py-2.5 bg-[#0D0E12] border border-[#202126] focus:border-[#696CFF]/50 rounded-[12px] text-xs focus:outline-none appearance-none cursor-pointer text-[#FFFFFF]"
                      >
                        <option value="lead">Lead</option>
                        <option value="prospect">Prospect</option>
                        <option value="customer">Customer</option>
                        <option value="churned">Churned</option>
                        <option value="unqualified">Unqualified</option>
                      </select>
                      <X className="w-3.5 h-3.5 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#8A8D96]" />
                    </div>
                  </div>

                  {/* Lead Score Slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-baseline">
                      <label className="text-xs font-semibold text-[#B0B8C8] uppercase tracking-wider">Lead Score</label>
                      <span className="text-xs font-mono font-bold text-[#9CA3AF]">{leadScore} / 100</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={leadScore}
                        onChange={(e) => setLeadScore(Number(e.target.value))}
                        className="w-full accent-[#6B7280] h-1 bg-[#1E2230] rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Creatable Tags Field */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#8A8D96] uppercase tracking-wider">Tags (Press Enter to add)</label>
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleAddTag}
                      placeholder="Add tag and hit Enter..."
                      className="w-full px-4 py-2.5 bg-[#0D0E12] border border-[#202126] focus:border-[#696CFF]/50 rounded-[12px] text-xs placeholder-[#8A8D96] focus:outline-none text-[#FFFFFF]"
                    />
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {tags.map((t) => (
                        <span
                          key={t}
                          className="px-2 py-0.5 bg-[#18191C] border border-[#202126] text-[#8A8D96] text-[10px] rounded-[8px] flex items-center gap-1.5"
                        >
                          <span>{t}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(t)}
                            className="hover:text-[#FFFFFF] transition-colors cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Custom properties JSONB builder */}
                  <div className="space-y-2.5 pt-2 border-t border-[#202126]">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-[#8A8D96] uppercase tracking-wider">Custom Properties (JSONB)</label>
                      <button
                        type="button"
                        onClick={handleAddPropRow}
                        className="text-[10px] font-semibold text-[#696CFF] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Property</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {customProps.map((prop, idx) => (
                        <div key={idx} className="flex gap-2 items-center">
                          <input
                            type="text"
                            placeholder="Property Key"
                            value={prop.key}
                            onChange={(e) => handlePropChange(idx, "key", e.target.value)}
                            className="w-1/2 px-3 py-2 bg-[#0D0E12] border border-[#202126] rounded-[12px] text-xs font-medium placeholder-[#8A8D96] focus:outline-none text-[#FFFFFF]"
                          />
                          <input
                            type="text"
                            placeholder="Value (text, number, bool)"
                            value={prop.value}
                            onChange={(e) => handlePropChange(idx, "value", e.target.value)}
                            className="w-1/2 px-3 py-2 bg-[#0D0E12] border border-[#202126] rounded-[12px] text-xs font-medium placeholder-[#8A8D96] focus:outline-none text-[#FFFFFF]"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemovePropRow(idx)}
                            className="p-2 bg-transparent text-[#8A8D96] hover:text-[#FF5A4F] transition-colors cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Traffic source */}
                  <div className="space-y-1.5 pt-2 border-t border-[#202126]">
                    <label className="text-xs font-semibold text-[#8A8D96] uppercase tracking-wider">Source Channel</label>
                    <input
                      type="text"
                      value={sourceChannel}
                      onChange={(e) => setSourceChannel(e.target.value)}
                      placeholder="e.g. Google Search, Direct Signup"
                      className="w-full px-4 py-2.5 bg-[#0D0E12] border border-[#202126] focus:border-[#696CFF]/50 rounded-[12px] text-xs placeholder-[#8A8D96] focus:outline-none text-[#FFFFFF]"
                    />
                  </div>
                </form>
              )}
            </div>

            {/* 3. Footer row actions */}
            {mode !== "view" && (
              <div className="p-6 border-t border-[#202126] bg-[#0D0E12] flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 bg-transparent hover:bg-[#25262B] border border-[#202126] hover:border-[#8A8D96] text-xs font-semibold text-[#8A8D96] hover:text-[#FFFFFF] rounded-[12px] transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 py-2.5 bg-[#696CFF] hover:bg-[#5A5CE6] text-xs font-semibold text-[#FFFFFF] rounded-[12px] shadow-none transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{mode === "create" ? "Create Profile" : "Save Changes"}</span>
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
