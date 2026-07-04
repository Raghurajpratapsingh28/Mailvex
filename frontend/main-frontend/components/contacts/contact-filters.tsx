"use client"

import { Search, Calendar, ChevronDown, Check, X } from "lucide-react"

interface ContactFiltersProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  lifecycleStage: string
  setLifecycleStage: (stage: string) => void
  selectedTags: string[]
  toggleTag: (tag: string) => void
  showSuppressed: boolean
  setShowSuppressed: (val: boolean) => void
  showUnsubscribed: boolean
  setShowUnsubscribed: (val: boolean) => void
  dateFrom: string
  setDateFrom: (val: string) => void
  dateTo: string
  setDateTo: (val: string) => void
  availableTags: string[]
}

export default function ContactFilters({
  searchQuery,
  setSearchQuery,
  lifecycleStage,
  setLifecycleStage,
  selectedTags,
  toggleTag,
  showSuppressed,
  setShowSuppressed,
  showUnsubscribed,
  setShowUnsubscribed,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  availableTags
}: ContactFiltersProps) {
  return (
    <div className="enterprise-card p-5 select-none font-sans text-white space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* 1. Search Query Fuzzy Field (Col span 4) */}
        <div className="md:col-span-4 relative flex items-center bg-[#0D0E12] border border-[#202126] hover:border-[#8A8D96] focus-within:border-[#696CFF]/50 rounded-[12px] transition-all duration-300 px-3 py-2 w-full">
          <Search className="w-4 h-4 text-[#8A8D96] mr-2" />
          <input
            type="text"
            placeholder="Search email, first name, last name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-xs text-[#FFFFFF] placeholder-[#8A8D96] focus:outline-none w-full font-medium"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="text-[#8A8D96] hover:text-[#FFFFFF] transition-colors cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* 2. Lifecycle Stage Selector (Col span 3) */}
        <div className="md:col-span-3 relative flex items-center bg-[#0D0E12] border border-[#202126] rounded-[12px] hover:border-[#8A8D96] px-3 py-2 w-full">
          <span className="text-[10px] text-[#8A8D96] font-medium mr-2 uppercase">Stage:</span>
          <select
            value={lifecycleStage}
            onChange={(e) => setLifecycleStage(e.target.value)}
            className="bg-transparent text-xs text-[#FFFFFF] placeholder-[#8A8D96] focus:outline-none w-full font-semibold cursor-pointer appearance-none pr-6"
          >
            <option value="all" className="bg-[#18191C]">All Stages</option>
            <option value="lead" className="bg-[#18191C]">Lead</option>
            <option value="prospect" className="bg-[#18191C]">Prospect</option>
            <option value="customer" className="bg-[#18191C]">Customer</option>
            <option value="churned" className="bg-[#18191C]">Churned</option>
            <option value="unqualified" className="bg-[#18191C]">Unqualified</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-[#8A8D96] absolute right-3 pointer-events-none" />
        </div>

        {/* 3. Created Date Range Picker (Col span 5) */}
        <div className="md:col-span-5 flex items-center bg-[#0D0E12] border border-[#202126] rounded-[12px] hover:border-[#8A8D96] px-3 py-1.5 gap-2 w-full">
          <Calendar className="w-4 h-4 text-[#8A8D96] shrink-0" />
          <div className="flex items-center gap-1.5 w-full">
            <span className="text-[10px] text-[#8A8D96] font-medium uppercase">From:</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="bg-transparent text-xs text-[#FFFFFF] focus:outline-none w-full font-mono cursor-pointer"
            />
            <span className="text-[10px] text-[#8A8D96] font-medium uppercase">To:</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="bg-transparent text-xs text-[#FFFFFF] focus:outline-none w-full font-mono cursor-pointer"
            />
            {(dateFrom || dateTo) && (
              <button
                onClick={() => {
                  setDateFrom("")
                  setDateTo("")
                }}
                className="text-[#8A8D96] hover:text-[#FFFFFF] cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Filter Row: Tags and Suppression Toggles */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-3 border-t border-[#202126]">
        {/* Multi-select Tags Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] text-[#8A8D96] font-medium uppercase tracking-wider">Tags Filter:</span>
          {availableTags.map((tag) => {
            const isSelected = selectedTags.includes(tag)
            return (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1 rounded-[8px] text-[10px] font-medium border transition-all duration-300 cursor-pointer flex items-center gap-1 ${
                  isSelected
                    ? "bg-[#696CFF]/10 border-[#696CFF]/30 text-[#696CFF]"
                    : "bg-[#0D0E12] border-[#202126] text-[#8A8D96] hover:border-[#8A8D96] hover:text-[#FFFFFF]"
                }`}
              >
                {isSelected && <Check className="w-3 h-3 text-[#696CFF]" />}
                <span>{tag}</span>
              </button>
            )
          })}
          {selectedTags.length > 0 && (
            <button
              onClick={() => selectedTags.forEach((t) => toggleTag(t))}
              className="text-[9px] font-medium text-[#FF5A4F] hover:underline cursor-pointer ml-1"
            >
              Clear Tags
            </button>
          )}
        </div>

        {/* Suppression & Subscription Toggles */}
        <div className="flex items-center gap-4">
          {/* Suppressed Toggle */}
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showSuppressed}
              onChange={(e) => setShowSuppressed(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-[#202126] rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#8A8D96] peer-checked:after:bg-white after:border-none after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#FF5A4F] relative border border-transparent peer-focus:outline-none" />
            <span className={`text-xs font-semibold transition-colors leading-none ${showSuppressed ? 'text-[#FF5A4F]' : 'text-[#8A8D96]'}`}>
              Suppressed Only
            </span>
          </label>

          {/* Unsubscribed Toggle */}
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showUnsubscribed}
              onChange={(e) => setShowUnsubscribed(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-[#202126] rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#8A8D96] peer-checked:after:bg-white after:border-none after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#696CFF] relative border border-transparent peer-focus:outline-none" />
            <span className={`text-xs font-semibold transition-colors leading-none ${showUnsubscribed ? 'text-[#696CFF]' : 'text-[#8A8D96]'}`}>
              Unsubscribed Only
            </span>
          </label>
        </div>
      </div>
    </div>
  )
}
