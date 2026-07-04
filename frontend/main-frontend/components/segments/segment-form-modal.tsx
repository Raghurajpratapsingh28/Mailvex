"use client"

import { useState, useEffect } from "react"
import { Segment, FilterTree, makeEmptyGroup, makeEmptyRule } from "@/lib/segments-data"
import FilterBuilder from "./filter-builder"
import { X, Users, Zap } from "lucide-react"

interface Props {
  isOpen: boolean
  onClose: () => void
  segment?: Segment | null
  onSave: (data: Partial<Segment>) => void
}

export default function SegmentFormModal({ isOpen, onClose, segment, onSave }: Props) {
  const [name, setName] = useState("")
  const [type, setType] = useState<"static" | "dynamic">("dynamic")
  const [filterTree, setFilterTree] = useState<FilterTree>(makeEmptyGroup("AND"))

  useEffect(() => {
    if (segment) {
      setName(segment.name)
      setType(segment.type)
      setFilterTree(segment.filterTree ?? makeEmptyGroup("AND"))
    } else {
      setName("")
      setType("dynamic")
      setFilterTree({ ...makeEmptyGroup("AND"), children: [makeEmptyRule()] })
    }
  }, [segment, isOpen])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onSave({ name: name.trim(), type, filterTree: type === "dynamic" ? filterTree : undefined })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-[#0F1016] border border-[#1C202C] rounded-3xl shadow-2xl shadow-black/50 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#1C202C]">
          <div>
            <span className="text-[10px] text-[#7A8499] font-mono uppercase tracking-wider">
              {segment ? "Edit Segment" : "New Segment"}
            </span>
            <h2 className="text-base font-bold text-white mt-0.5">
              {segment ? `Edit "${segment.name}"` : "Create Segment"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-[#1C1F2D] text-[#7A8499] hover:text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-white/80 tracking-tight">
                Segment Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. High Value Customers"
                required
                className="w-full px-3.5 py-2.5 bg-[#08090C] border border-[#1E2230] hover:border-[#383E58] focus:border-[#6B7280] rounded-xl text-sm text-white placeholder-[#7A8499] focus:outline-none transition-colors"
              />
            </div>

            {/* Type */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-white/80 tracking-tight">
                Segment Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                {(["dynamic", "static"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      type === t
                        ? t === "dynamic"
                          ? "bg-[#6B7280]/10 border-[#6B7280]/50 text-white"
                          : "bg-zinc-500/10 border-zinc-500/40 text-white"
                        : "bg-[#08090C] border-[#1E2230] hover:border-[#383E58] text-[#B0B8C8]"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {t === "dynamic" ? (
                        <Zap className={`w-4 h-4 ${type === t ? "text-[#9CA3AF]" : "text-[#7A8499]"}`} />
                      ) : (
                        <Users className={`w-4 h-4 ${type === t ? "text-zinc-300" : "text-[#7A8499]"}`} />
                      )}
                      <span className="text-xs font-semibold capitalize">{t}</span>
                    </div>
                    <p className="text-[10px] font-mono text-[#7A8499] leading-relaxed">
                      {t === "dynamic"
                        ? "Auto-computed via filter rules"
                        : "Manually managed contact list"}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Filter Builder (dynamic only) */}
            {type === "dynamic" && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/80 tracking-tight">
                  Filter Rules
                </label>
                <FilterBuilder tree={filterTree} onChange={setFilterTree} />
              </div>
            )}

            {/* Static info */}
            {type === "static" && (
              <div className="p-4 rounded-2xl bg-zinc-500/5 border border-zinc-500/20 text-xs text-[#B0B8C8] leading-relaxed">
                <p className="font-semibold text-white/80 mb-1">Manual Membership</p>
                Contacts are added or removed manually from the segment detail view after creation.
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#1C202C]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#12141A] hover:bg-[#1C1F2D] border border-[#1E2230] hover:border-[#383E58] rounded-xl text-xs font-semibold text-[#B0B8C8] hover:text-white transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-[#6B7280] to-[#6B7280] hover:from-[#4B5563] hover:to-[#374151] text-white rounded-xl text-xs font-semibold shadow-lg shadow-[#6B7280]/15 transition-all cursor-pointer"
            >
              {segment ? "Save Changes" : "Create Segment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
