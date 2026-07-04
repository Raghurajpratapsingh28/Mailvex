"use client"

import { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
import {
  ChevronLeft, ChevronRight, X, MessageSquare, Bug,
  Lightbulb, Star, Send, CheckCircle2, Loader2
} from "lucide-react"

type FeedbackType = "bug" | "feature" | "general" | "rating"

const FEEDBACK_TYPES = [
  { id: "bug" as FeedbackType, label: "Report a Bug", icon: Bug, color: "#EF4444" },
  { id: "feature" as FeedbackType, label: "Feature Request", icon: Lightbulb, color: "#F59E0B" },
  { id: "general" as FeedbackType, label: "General Feedback", icon: MessageSquare, color: "#6366F1" },
  { id: "rating" as FeedbackType, label: "Rate Experience", icon: Star, color: "#10B981" },
]

export default function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeType, setActiveType] = useState<FeedbackType | null>(null)
  const [message, setMessage] = useState("")
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        handleClose()
      }
    }
    if (isOpen) document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen])

  function handleClose() {
    setIsOpen(false)
    setTimeout(() => {
      setActiveType(null)
      setMessage("")
      setRating(0)
      setIsSubmitted(false)
    }, 300)
  }

  async function handleSubmit() {
    if (!activeType) return
    if (activeType !== "rating" && !message.trim()) return

    setIsSubmitting(true)
    // Simulate API call — replace with real endpoint
    await new Promise((r) => setTimeout(r, 1200))
    setIsSubmitting(false)
    setIsSubmitted(true)
    setTimeout(handleClose, 2000)
  }

  const selectedType = FEEDBACK_TYPES.find((t) => t.id === activeType)
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  if (!mounted) return null

  return createPortal(
    <div className="fixed bottom-6 right-0 z-[9999] flex items-end" ref={panelRef}>
      {/* Slide-in panel */}
      <div
        className={`
          transition-all duration-300 ease-in-out origin-right
          ${isOpen ? "opacity-100 translate-x-0 pointer-events-auto" : "opacity-0 translate-x-4 pointer-events-none"}
        `}
      >
        <div className="mr-2 w-80 rounded-xl border border-[#1E2028] bg-[#13141A] shadow-2xl shadow-black/50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#1E2028]">
            <div className="flex items-center gap-2">
              {activeType && (
                <button
                  onClick={() => { setActiveType(null); setMessage(""); setRating(0) }}
                  className="text-[#6B7280] hover:text-[#9CA3AF] transition-colors p-0.5 rounded"
                >
                  <ChevronLeft size={14} />
                </button>
              )}
              <span className="text-sm font-medium text-[#E5E7EB]">
                {activeType ? selectedType?.label : "Feedback & Reports"}
              </span>
            </div>
            <button
              onClick={handleClose}
              className="text-[#6B7280] hover:text-[#9CA3AF] transition-colors p-1 rounded-md hover:bg-[#1E2028]"
            >
              <X size={14} />
            </button>
          </div>

          {isSubmitted ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <CheckCircle2 size={36} className="text-[#10B981]" />
              <p className="text-sm text-[#9CA3AF]">Thanks for your feedback!</p>
            </div>
          ) : !activeType ? (
            /* Type selector */
            <div className="p-3 flex flex-col gap-1.5">
              <p className="text-xs text-[#6B7280] px-1 pb-1">
                Help us improve Mailvex — select a category
              </p>
              {FEEDBACK_TYPES.map((type) => {
                const Icon = type.icon
                return (
                  <button
                    key={type.id}
                    onClick={() => setActiveType(type.id)}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-left transition-all hover:bg-[#1E2028] group"
                  >
                    <div
                      className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
                      style={{ backgroundColor: type.color + "20" }}
                    >
                      <Icon size={14} style={{ color: type.color }} />
                    </div>
                    <span className="text-sm text-[#D1D5DB] group-hover:text-[#F9FAFB] transition-colors">
                      {type.label}
                    </span>
                    <ChevronRight size={12} className="ml-auto text-[#4B5563] group-hover:text-[#6B7280]" />
                  </button>
                )
              })}
            </div>
          ) : activeType === "rating" ? (
            /* Star rating */
            <div className="p-4 flex flex-col gap-4">
              <p className="text-xs text-[#9CA3AF]">How would you rate your overall experience?</p>
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      size={28}
                      className="transition-colors"
                      fill={(hoverRating || rating) >= star ? "#F59E0B" : "transparent"}
                      stroke={(hoverRating || rating) >= star ? "#F59E0B" : "#4B5563"}
                    />
                  </button>
                ))}
              </div>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Share any additional thoughts… (optional)"
                rows={3}
                className="w-full bg-[#0D0E12] border border-[#1E2028] rounded-lg px-3 py-2 text-sm text-[#D1D5DB] placeholder-[#4B5563] resize-none focus:outline-none focus:border-[#374151] transition-colors"
              />
              <button
                onClick={handleSubmit}
                disabled={rating === 0 || isSubmitting}
                className="flex items-center justify-center gap-2 w-full py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ backgroundColor: selectedType?.color + "20", color: selectedType?.color }}
              >
                {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                {isSubmitting ? "Submitting…" : "Submit Rating"}
              </button>
            </div>
          ) : (
            /* Text feedback */
            <div className="p-4 flex flex-col gap-3">
              <p className="text-xs text-[#9CA3AF]">
                {activeType === "bug"
                  ? "Describe the issue — what happened and what you expected."
                  : activeType === "feature"
                  ? "What feature would help you most? Describe the use case."
                  : "Share your thoughts, suggestions, or anything on your mind."}
              </p>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  activeType === "bug"
                    ? "Steps to reproduce, page, error message…"
                    : activeType === "feature"
                    ? "I wish I could…"
                    : "Your feedback…"
                }
                rows={4}
                autoFocus
                className="w-full bg-[#0D0E12] border border-[#1E2028] rounded-lg px-3 py-2 text-sm text-[#D1D5DB] placeholder-[#4B5563] resize-none focus:outline-none focus:border-[#374151] transition-colors"
              />
              <button
                onClick={handleSubmit}
                disabled={!message.trim() || isSubmitting}
                className="flex items-center justify-center gap-2 w-full py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ backgroundColor: selectedType?.color + "20", color: selectedType?.color }}
              >
                {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                {isSubmitting ? "Submitting…" : "Send Feedback"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Toggle tab — chevron tab on the right edge */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        title="Feedback & Reports"
        className={`
          flex items-center justify-center
          w-6 h-16 rounded-l-lg
          border border-r-0 border-[#1E2028]
          bg-[#13141A] hover:bg-[#1A1B22]
          text-[#6B7280] hover:text-[#9CA3AF]
          transition-all duration-200
          shadow-lg shadow-black/30
        `}
      >
        {isOpen ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </div>,
    document.body
  )
}
