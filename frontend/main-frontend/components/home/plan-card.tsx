"use client"

import { Calendar, Sparkles } from "lucide-react"
import type { WorkspaceSummary } from "@/lib/analytics-service"

type SubscriptionData = WorkspaceSummary["subscription"]

interface Props { subscription: SubscriptionData; workspaceId: string; onPortal: () => void }

interface PlanTheme {
  badge: string
  badgeDot: string
  accent: string
  accentText: string
  border: string
  glow: string
  button: string
  buttonText: string
  planNameClass: string
}

const PLAN_THEMES: Record<string, PlanTheme> = {
  free: {
    badge: "bg-[#2A2B36] text-[#6B7280]",
    badgeDot: "bg-[#4B5563]",
    accent: "#4B5563",
    accentText: "#9CA3AF",
    border: "border-[#2A2B36]",
    glow: "",
    button: "bg-[#1F2028] hover:bg-[#2A2B36] border border-[#3A3B47] text-[#9CA3AF]",
    buttonText: "#9CA3AF",
    planNameClass: "text-[#9CA3AF]",
  },
  starter: {
    badge: "bg-[#0D2B1F] text-[#34D399]",
    badgeDot: "bg-[#34D399]",
    accent: "#10B981",
    accentText: "#34D399",
    border: "border-[#10B981]/25",
    glow: "shadow-[0_0_24px_0_rgba(16,185,129,0.10)]",
    button: "bg-gradient-to-r from-[#059669] to-[#10B981] hover:from-[#047857] hover:to-[#059669] text-white",
    buttonText: "#ffffff",
    planNameClass: "text-[#34D399]",
  },
  growth: {
    badge: "bg-[#061A1A] text-[#2DD4BF]",
    badgeDot: "bg-[#2DD4BF]",
    accent: "#0D9488",
    accentText: "#2DD4BF",
    border: "border-[#0D9488]/30",
    glow: "shadow-[0_0_24px_0_rgba(13,148,136,0.14)]",
    button: "bg-gradient-to-r from-[#0F766E] to-[#2DD4BF] hover:from-[#0D6B63] hover:to-[#0F766E] text-white",
    buttonText: "#ffffff",
    planNameClass: "text-[#2DD4BF]",
  },
  pro: {
    badge: "bg-[#1A1500] text-[#FBBF24]",
    badgeDot: "bg-gradient-to-r from-[#CA8A04] to-[#EAB308]",
    accent: "#CA8A04",
    accentText: "#EAB308",
    border: "border-[#CA8A04]/40",
    glow: "shadow-[0_0_32px_0_rgba(202,138,4,0.18)]",
    button: "bg-gradient-to-r from-[#92400E] via-[#CA8A04] to-[#EAB308] hover:from-[#78350F] hover:via-[#B45309] hover:to-[#CA8A04] text-[#1A1500]",
    buttonText: "#1A1500",
    planNameClass: "bg-gradient-to-r from-[#CA8A04] via-[#EAB308] to-[#FDE68A] bg-clip-text text-transparent",
  },
  scale: {
    badge: "bg-[#25153c] text-[#a78bfa]",
    badgeDot: "bg-[#a78bfa]",
    accent: "#7c3aed",
    accentText: "#a78bfa",
    border: "border-[#7c3aed]/40",
    glow: "shadow-[0_0_32px_0_rgba(124,58,237,0.18)]",
    button: "bg-gradient-to-r from-[#6d28d9] via-[#7c3aed] to-[#a78bfa] hover:from-[#5b21b6] hover:via-[#6d28d9] hover:to-[#7c3aed] text-white",
    buttonText: "#ffffff",
    planNameClass: "bg-gradient-to-r from-[#7c3aed] via-[#a78bfa] to-[#c084fc] bg-clip-text text-transparent",
  },
}

export default function PlanCard({ subscription, onPortal }: Props) {
  const plan = subscription?.plan ?? "free"
  const interval = subscription?.billingInterval ?? "—"
  const renewal = subscription?.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : "—"
  const cancelPending = subscription?.cancelAtPeriodEnd

  const theme = PLAN_THEMES[plan.toLowerCase()] ?? PLAN_THEMES.pro

  return (
    <div className={`p-5 enterprise-card flex flex-col justify-between h-full border ${theme.border} ${theme.glow} transition-all duration-300`}>
      <div className="flex items-center justify-between">
        <span className="text-[12px] text-[#8A8D96] font-medium tracking-wide uppercase">Active Plan</span>
        <span className={`${theme.badge} text-[10px] font-bold px-3 py-1 rounded-[12px] uppercase tracking-widest flex items-center gap-1.5`}>
          <span className={`w-1.5 h-1.5 rounded-full ${theme.badgeDot} inline-block`} />
          {interval}
        </span>
      </div>
      <div className="mt-4">
        <h3 className={`text-3xl font-sans font-bold tracking-tight capitalize ${theme.planNameClass}`}>{plan} Plan</h3>
        <div className="flex items-center gap-1.5 text-sm text-[#8A8D96] mt-2">
          <Calendar className="w-4 h-4 text-[#8A8D96]" />
          <span>{cancelPending ? "Cancels" : "Renews"}: <span className="text-[#FFFFFF] font-medium">{renewal}</span></span>
        </div>
        {cancelPending && <p className="text-[11px] text-[#FF5A4F] font-medium mt-1">Cancellation pending at period end</p>}
      </div>
      <button onClick={onPortal} className={`mt-6 w-full py-3 ${theme.button} rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all duration-200`}>
        Manage Subscription <Sparkles className="w-4 h-4" />
      </button>
    </div>
  )
}
