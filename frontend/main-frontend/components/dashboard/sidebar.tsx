"use client"

import { useState } from "react"
import Image from "next/image"
import {
  LayoutDashboard, Users, Megaphone, GitBranch,
  Link as LinkIcon, ShieldAlert, Layers,
  Globe, Send, CreditCard, Settings, UserCircle,
  ChevronLeft, ChevronRight, Zap, Search, LogOut
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useWorkspace } from "@/lib/workspace-context"

const NAV_GROUPS = [
  {
    label: "Core",
    items: [
      { name: "Dashboard",    href: "/home",          icon: LayoutDashboard },
      { name: "Contacts",     href: "/contact",       icon: Users },
      { name: "Segments",     href: "/segments",      icon: Layers },
    ],
  },
  {
    label: "Outreach",
    items: [
      { name: "Campaigns",     href: "/campaigns",    icon: Megaphone },
      { name: "Transactional", href: "/transactional",icon: Send },
      { name: "Flow Builder",  href: "/flow-builder", icon: GitBranch },
    ],
  },
  {
    label: "Infrastructure",
    items: [
      { name: "Domains",      href: "/domains",      icon: Globe },
      { name: "Integrations", href: "/integrations", icon: LinkIcon, api: true },
      { name: "Churn Risk",   href: "/churn-risk",   icon: ShieldAlert, beta: true },
    ],
  },
  {
    label: "Workspace",
    items: [
      { name: "Billing",  href: "/billing",  icon: CreditCard },
      { name: "Settings", href: "/settings", icon: Settings },
      { name: "Account",  href: "/account",  icon: UserCircle },
    ],
  },
] as const

type NavItem = { name: string; href: string; icon: React.ElementType; api?: boolean; beta?: boolean }

export default function Sidebar() {
  const pathname = usePathname()
  const { logout } = useAuth()
  const { workspaceId } = useWorkspace()
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return true
    const stored = localStorage.getItem("sidebar-collapsed")
    return stored === null ? true : stored === "true"
  })

  const toggle = () => {
    const next = !collapsed
    setCollapsed(next)
    localStorage.setItem("sidebar-collapsed", String(next))
  }

  return (
    <aside
      className={`relative flex flex-col h-full bg-[#18191C] rounded-[16px] text-[#FFFFFF] shrink-0 font-sans select-none transition-all duration-300 ease-in-out shadow-[16px_0_48px_-8px_rgba(0,0,0,0.8)] border border-[#202126] z-50 ${
        collapsed ? "w-[68px]" : "w-[230px]"
      }`}
    >
      {/* ── Brand ───────────────────────────────────── */}
      <div className={`flex items-center shrink-0 h-16 mt-4 ${collapsed ? "justify-center px-0" : "px-4 gap-3"}`}>
        <div className="flex items-center justify-center shrink-0 overflow-hidden">
          <Image src="/logos/logo.png" alt="Logo" width={160} height={48} className="h-12 w-auto object-contain" priority />
        </div>
        {!collapsed && (
          <span className="text-xl font-bold text-white">Mailmex</span>
        )}
      </div>

      {/* ── Nav groups ───────────────────────────────── */}
      <nav
        className={`flex-1 overflow-y-auto py-2 z-10 mt-2 ${collapsed ? "px-2" : "px-4"}`}
        style={{ scrollbarWidth: "none" }}
      >
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-2">
            {!collapsed && (
              <p className="text-[10px] font-medium text-[#8A8D96] px-3 pt-3 pb-2">
                {group.label}
              </p>
            )}
            {collapsed && <div className="h-4" />}
            {group.items.map((item) => (
              <NavLink key={item.href} item={item} pathname={pathname} collapsed={collapsed} workspaceId={workspaceId} />
            ))}
          </div>
        ))}
      </nav>

      {/* ── Collapse toggle ───────────────────────────── */}
      <div className={`shrink-0 z-10 p-4 space-y-2`}>
        <button
          onClick={logout}
          className={`flex items-center gap-3 rounded-[12px] transition-all duration-200 cursor-pointer group
            bg-transparent
            hover:bg-[#25262B]
            ${collapsed ? "w-10 h-10 justify-center mx-auto" : "w-full px-3 py-2.5"}`}
        >
          <LogOut className="w-4 h-4 text-[#8A8D96] group-hover:text-[#FF5A4F] transition-colors shrink-0" />
          {!collapsed && <span className="text-[13px] font-medium text-[#8A8D96] group-hover:text-[#FF5A4F] transition-colors">Logout</span>}
        </button>
        
        <button
          onClick={toggle}
          title={collapsed ? "Expand" : "Collapse"}
          className={`flex items-center gap-3 rounded-[12px] transition-all duration-200 cursor-pointer group
            bg-transparent
            hover:bg-[#25262B]
            ${collapsed ? "w-10 h-10 justify-center mx-auto" : "w-full px-3 py-2.5"}`}
        >
          {collapsed
            ? <ChevronRight className="w-4 h-4 text-[#8A8D96] group-hover:text-[#FFFFFF] transition-colors" />
            : <>
                <ChevronLeft className="w-4 h-4 text-[#8A8D96] group-hover:text-[#FFFFFF] transition-colors shrink-0" />
                <span className="text-[13px] font-medium text-[#8A8D96] group-hover:text-[#FFFFFF] transition-colors">Collapse</span>
              </>
          }
        </button>
      </div>
    </aside>
  )
}

function NavLink({ item, pathname, collapsed, workspaceId }: { item: NavItem; pathname: string; collapsed: boolean; workspaceId: string | null }) {
  const href = workspaceId && item.href !== "/" && item.href !== "/account" ? `${item.href}/${workspaceId}` : item.href
  const isActive = pathname === href || pathname.startsWith(href + "/")
  const Icon = item.icon
  const [tipY, setTipY] = useState<number | null>(null)

  return (
    <Link href={href}>
      <div
        className={`relative flex items-center rounded-[12px] cursor-pointer transition-all duration-150 group ${
          collapsed ? "justify-center p-[10px]" : "gap-3 px-3 py-2.5"
        } ${
          isActive
            ? "bg-[#FF5A4F]/10 text-[#FF5A4F]"
            : "text-[#8A8D96] hover:text-[#FFFFFF] hover:bg-[#25262B]"
        }`}
        onMouseEnter={(e) => collapsed && setTipY(e.currentTarget.getBoundingClientRect().top)}
        onMouseLeave={() => setTipY(null)}
      >
        <Icon className={`w-4 h-4 shrink-0 transition-colors ${
          isActive ? "text-[#FF5A4F]" : "text-[#8A8D96] group-hover:text-[#FFFFFF]"
        }`} />

        {!collapsed && (
          <>
            <span className={`text-[13px] font-medium flex-1 leading-none ${isActive ? "text-[#FF5A4F]" : ""}`}>
              {item.name}
            </span>
            {item.beta && (
              <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-[6px] bg-[#25262B] text-[#8A8D96]">
                Beta
              </span>
            )}
            {item.api && (
              <span className="text-[11px] text-[#8A8D96] transition-colors">↗</span>
            )}
          </>
        )}

        {/* Fixed tooltip */}
        {collapsed && tipY !== null && (
          <div
            className="pointer-events-none fixed left-[84px] z-[9999] px-3 py-2 bg-[#25262B] rounded-[8px] text-[12px] font-medium text-[#FFFFFF] whitespace-nowrap shadow-xl flex items-center gap-2 animate-in fade-in duration-100"
            style={{ top: tipY + 4 }}
          >
            {item.name}
            {item.beta && <span className="text-[9px] text-[#FF5A4F]">Beta</span>}
          </div>
        )}
      </div>
    </Link>
  )
}
