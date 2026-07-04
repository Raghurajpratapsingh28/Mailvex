"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useWorkspace } from "@/lib/workspace-context"
import {
  Search, LayoutDashboard, Users, Megaphone, GitBranch,
  Link as LinkIcon, ShieldAlert, Layers, Globe, Send,
  CreditCard, Settings, UserCircle, Hash, CornerDownLeft,
} from "lucide-react"

interface NavPage {
  name: string
  description: string
  href: string
  icon: React.ElementType
  group: string
  keywords: string[]
  badge?: string
}

const PAGES: NavPage[] = [
  // Core
  { name: "Dashboard", description: "Workspace overview and analytics", href: "/home", icon: LayoutDashboard, group: "Core", keywords: ["home", "overview", "analytics", "stats", "summary"] },
  { name: "Contacts", description: "Manage your contact lists", href: "/contact", icon: Users, group: "Core", keywords: ["contacts", "people", "subscribers", "leads", "users"] },
  { name: "Segments", description: "Create and manage audience segments", href: "/segments", icon: Layers, group: "Core", keywords: ["segments", "audience", "groups", "filter", "tags"] },
  // Outreach
  { name: "Campaigns", description: "Email campaign management", href: "/campaigns", icon: Megaphone, group: "Outreach", keywords: ["campaigns", "email", "broadcast", "newsletter", "send"] },
  { name: "Transactional", description: "Transactional email sends", href: "/transactional", icon: Send, group: "Outreach", keywords: ["transactional", "triggered", "automated", "template", "send"] },
  { name: "Flow Builder", description: "Build automation workflows", href: "/flow-builder", icon: GitBranch, group: "Outreach", keywords: ["flow", "workflow", "automation", "builder", "sequences", "drip"] },
  // Infrastructure
  { name: "Domains", description: "Sending domain setup and verification", href: "/domains", icon: Globe, group: "Infrastructure", keywords: ["domains", "dns", "sending", "spf", "dkim", "dmarc", "verify"] },
  { name: "Integrations", description: "API keys and SDK setup", href: "/integrations", icon: LinkIcon, group: "Infrastructure", keywords: ["api", "keys", "sdk", "integration", "connect", "webhook"] },
  { name: "Churn Risk", description: "Identify at-risk subscribers", href: "/churn-risk", icon: ShieldAlert, group: "Infrastructure", keywords: ["churn", "risk", "unsubscribe", "predict", "retention"], badge: "Beta" },
  // Workspace
  { name: "Billing", description: "Subscription and invoices", href: "/billing", icon: CreditCard, group: "Workspace", keywords: ["billing", "invoice", "plan", "subscription", "payment", "upgrade"] },
  { name: "Settings", description: "Workspace configuration", href: "/settings", icon: Settings, group: "Workspace", keywords: ["settings", "config", "workspace", "preferences", "members", "team"] },
  { name: "Account", description: "Profile and security", href: "/account", icon: UserCircle, group: "Workspace", keywords: ["account", "profile", "password", "security", "sessions", "mfa"] },
]

const GROUP_ORDER = ["Core", "Outreach", "Infrastructure", "Workspace"]

function score(page: NavPage, query: string): number {
  const q = query.toLowerCase()
  const name = page.name.toLowerCase()
  const desc = page.description.toLowerCase()
  if (name === q) return 100
  if (name.startsWith(q)) return 80
  if (name.includes(q)) return 60
  if (desc.includes(q)) return 40
  if (page.keywords.some((k) => k.includes(q))) return 30
  return 0
}

interface Props {
  open: boolean
  onClose: () => void
}

export default function CommandPalette({ open, onClose }: Props) {
  const router = useRouter()
  const { workspaceId } = useWorkspace()
  const [query, setQuery] = useState("")
  const [activeIdx, setActiveIdx] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const resolveHref = useCallback(
    (page: NavPage) => {
      if (workspaceId && page.href !== "/home" && page.href !== "/account") {
        return `${page.href}/${workspaceId}`
      }
      return page.href
    },
    [workspaceId]
  )

  const filtered = query.trim()
    ? PAGES.map((p) => ({ page: p, s: score(p, query.trim()) }))
        .filter((x) => x.s > 0)
        .sort((a, b) => b.s - a.s)
        .map((x) => x.page)
    : PAGES

  // Group for display
  const grouped: { label: string; items: NavPage[] }[] = query.trim()
    ? [{ label: "Results", items: filtered }]
    : GROUP_ORDER.map((g) => ({ label: g, items: PAGES.filter((p) => p.group === g) }))

  const flat = grouped.flatMap((g) => g.items)

  useEffect(() => { setActiveIdx(0) }, [query])

  useEffect(() => {
    if (open) {
      setQuery("")
      setActiveIdx(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  // Scroll active item into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${activeIdx}"]`)
    el?.scrollIntoView({ block: "nearest" })
  }, [activeIdx])

  const navigate = useCallback(
    (page: NavPage) => {
      router.push(resolveHref(page))
      onClose()
    },
    [router, resolveHref, onClose]
  )

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveIdx((i) => Math.min(i + 1, flat.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveIdx((i) => Math.max(i - 1, 0))
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (flat[activeIdx]) navigate(flat[activeIdx])
    } else if (e.key === "Escape") {
      onClose()
    }
  }

  if (!open) return null

  let globalIdx = 0

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[12vh] px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="relative w-full max-w-[580px] rounded-2xl overflow-hidden shadow-2xl border border-white/[0.08] bg-[#0F1014]/95 backdrop-blur-2xl"
        style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06)" }}
      >
        {/* Top accent */}
        <div className="absolute top-0 left-12 right-12 h-px bg-gradient-to-r from-transparent via-[#FF5A4F]/50 to-transparent" />

        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.06]">
          <Search className="w-4 h-4 text-[#4B4D57] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search pages, features…"
            className="flex-1 bg-transparent text-[14px] text-white placeholder-[#4B4D57] focus:outline-none"
          />
          <kbd className="flex items-center text-[10px] font-medium text-[#4B4D57] bg-white/[0.05] border border-white/[0.08] rounded px-1.5 py-0.5">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div
          ref={listRef}
          className="overflow-y-auto max-h-[400px] py-2"
          style={{ scrollbarWidth: "none" }}
        >
          {flat.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <Hash className="w-5 h-5 text-[#4B4D57]" />
              <p className="text-[13px] text-[#4B4D57]">No results for &ldquo;{query}&rdquo;</p>
            </div>
          ) : (
            grouped.map((group) => (
              <div key={group.label}>
                <p className="text-[10px] font-semibold text-[#4B4D57] uppercase tracking-widest px-4 pt-3 pb-1.5">
                  {group.label}
                </p>
                {group.items.map((page) => {
                  const idx = globalIdx++
                  const isActive = idx === activeIdx
                  const Icon = page.icon
                  return (
                    <button
                      key={page.href}
                      data-idx={idx}
                      onClick={() => navigate(page)}
                      onMouseEnter={() => setActiveIdx(idx)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 mx-1 rounded-xl transition-colors text-left cursor-pointer ${
                        isActive ? "bg-white/[0.07]" : "hover:bg-white/[0.04]"
                      }`}
                      style={{ width: "calc(100% - 8px)" }}
                    >
                      {/* Icon */}
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                        isActive
                          ? "bg-[#FF5A4F]/15 border border-[#FF5A4F]/25"
                          : "bg-white/[0.05] border border-white/[0.06]"
                      }`}>
                        <Icon className={`w-3.5 h-3.5 transition-colors ${isActive ? "text-[#FF5A4F]" : "text-[#4B4D57]"}`} />
                      </div>

                      {/* Label */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-[13px] font-medium transition-colors ${isActive ? "text-white" : "text-[#9A9CA8]"}`}>
                            {page.name}
                          </span>
                          {page.badge && (
                            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md bg-[#FF5A4F]/10 text-[#FF5A4F] uppercase tracking-wide">
                              {page.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#4B4D57] truncate">{page.description}</p>
                      </div>

                      {/* Enter hint */}
                      {isActive && (
                        <div className="flex items-center gap-1 shrink-0">
                          <CornerDownLeft className="w-3 h-3 text-[#4B4D57]" />
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-white/[0.06]">
          <div className="flex items-center gap-3 text-[10px] text-[#4B4D57]">
            <span className="flex items-center gap-1">
              <kbd className="bg-white/[0.05] border border-white/[0.08] rounded px-1.5 py-0.5 font-medium">↑↓</kbd>
              navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="bg-white/[0.05] border border-white/[0.08] rounded px-1.5 py-0.5 font-medium">↵</kbd>
              open
            </span>
            <span className="flex items-center gap-1">
              <kbd className="bg-white/[0.05] border border-white/[0.08] rounded px-1.5 py-0.5 font-medium">ESC</kbd>
              close
            </span>
          </div>
          <span className="text-[10px] text-[#4B4D57]">{flat.length} page{flat.length !== 1 ? "s" : ""}</span>
        </div>
      </div>
    </div>
  )
}
