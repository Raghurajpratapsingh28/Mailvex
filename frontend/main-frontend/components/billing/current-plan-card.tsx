"use client"

import { PLANS } from "@/lib/billing-data"
import type { Subscription } from "@/lib/billing-service"
import { CheckCircle2, AlertTriangle, XCircle, Clock, ExternalLink } from "lucide-react"

interface Props {
  subscription: Subscription
  userRole: string
  onChangePlan: () => void
  onCancel: () => void
  onResume: () => void
  onUpgrade: () => void
  onManageBilling?: () => void
}

export default function CurrentPlanCard({ subscription: sub, userRole, onChangePlan, onCancel, onResume, onUpgrade, onManageBilling }: Props) {
  const plan = PLANS.find((p) => p.id === sub.plan)
  const isOwner = userRole === "owner"
  const isFree = sub.plan === "free"

  const periodEnd = sub.currentPeriodEnd
    ? new Date(sub.currentPeriodEnd).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "—"
  const periodStart = sub.currentPeriodStart
    ? new Date(sub.currentPeriodStart).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : "—"

  const interval = sub.billingInterval ?? "monthly"

  type BadgeStatus = "active" | "trialing" | "past_due" | "canceled" | "free"
  const STATUS_BADGE: Record<BadgeStatus, React.ReactNode> = {
    active:   <Badge cls="bg-[#3CD3AD]/10 border-[#3CD3AD]/25 text-[#3CD3AD]"><CheckCircle2 className="w-3 h-3" /> Active</Badge>,
    trialing: <Badge cls="bg-[#696CFF]/10 border-[#696CFF]/25 text-[#696CFF]"><Clock className="w-3 h-3" /> Trial</Badge>,
    past_due: <Badge cls="bg-[#FF5A4F]/10 border-[#FF5A4F]/25 text-[#FF5A4F]"><XCircle className="w-3 h-3" /> Past Due</Badge>,
    canceled: <Badge cls="bg-zinc-500/10 border-zinc-500/25 text-[#8A8D96]"><XCircle className="w-3 h-3" /> Canceled</Badge>,
    free:     <Badge cls="bg-zinc-500/10 border-zinc-500/25 text-[#8A8D96]">Free</Badge>,
  }

  const statusKey = (isFree ? "free" : sub.status) as BadgeStatus

  return (
    <div className="p-6 rounded-[16px] bg-gradient-to-b from-[#111318] to-[#0A0713] border border-[#1F2937] relative overflow-hidden shadow-lg shadow-[#6B7280]/5">
      <div className="absolute top-0 right-0 w-40 h-40 bg-[#6B7280]/8 blur-3xl rounded-full pointer-events-none" />

      <div className="flex items-start justify-between mb-5 z-10 relative">
        <div>
          <span className="text-[10px] text-[#8A8D96] font-medium uppercase tracking-wider">Current Plan</span>
          <div className="flex items-center gap-3 mt-1.5">
            <h2 className="text-2xl font-bold text-[#FFFFFF] tracking-tight">{plan?.name ?? "Free"}</h2>
            {STATUS_BADGE[statusKey]}
          </div>
          {!isFree && plan && (
            <p className="text-sm text-[#8A8D96] mt-1 font-medium uppercase tracking-wider">
              ${interval === "yearly" ? plan.yearlyPrice : plan.monthlyPrice}/{interval === "yearly" ? "yr" : "mo"}
              <span className="text-[#8A8D96] ml-1.5 capitalize">({interval})</span>
            </p>
          )}
        </div>
        {isOwner && onManageBilling && !isFree && (
          <button onClick={onManageBilling} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#6B7280]/10 hover:bg-[#6B7280]/20 border border-[#6B7280]/30 rounded-[12px] text-[10px] font-medium uppercase tracking-wider font-semibold text-[#8A8D96] transition-all cursor-pointer">
            <ExternalLink className="w-3 h-3" /> Manage Billing
          </button>
        )}
      </div>

      {sub.cancelAtPeriodEnd && (
        <div className="mb-4 p-3.5 rounded-[12px] bg-[#FFB020]/10 border border-[#FFB020]/20 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-[#FFB020] shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs text-[#FFB020] font-semibold">Cancels on {periodEnd}</p>
            <p className="text-[10px] text-[#8A8D96] mt-0.5">Your plan remains active until then. You can resume anytime.</p>
          </div>
          {isOwner && <button onClick={onResume} className="text-[10px] font-semibold text-[#FFB020] hover:underline cursor-pointer whitespace-nowrap">Resume Plan</button>}
        </div>
      )}
      {sub.status === "past_due" && (
        <div className="mb-4 p-3.5 rounded-[12px] bg-[#FF5A4F]/5 border border-[#FF5A4F]/20 flex items-start gap-3">
          <XCircle className="w-4 h-4 text-[#FF5A4F] shrink-0 mt-0.5" />
          <p className="text-xs text-[#FF5A4F]">Payment failed. <button className="underline cursor-pointer" onClick={onManageBilling}>Update payment method</button> to avoid service interruption.</p>
        </div>
      )}
      {sub.status === "trialing" && sub.trialEndsAt && (
        <div className="mb-4 p-3.5 rounded-[12px] bg-[#696CFF]/5 border border-[#696CFF]/20">
          <p className="text-xs text-[#696CFF]">Trial ends on {new Date(sub.trialEndsAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}.</p>
        </div>
      )}

      {!isFree && (
        <div className="p-3.5 rounded-[12px] bg-[#18191C] border border-[#202126] space-y-1.5 text-xs mb-5">
          <div className="flex justify-between">
            <span className="text-[#8A8D96] font-medium uppercase tracking-wider">Billing period</span>
            <span className="text-[#FFFFFF]/80 font-medium uppercase tracking-wider">{periodStart} – {periodEnd}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#8A8D96] font-medium uppercase tracking-wider">Next renewal</span>
            <span className="text-[#FFFFFF]/80 font-medium uppercase tracking-wider">{periodEnd}</span>
          </div>
        </div>
      )}

      {isOwner && (
        <div className="flex items-center gap-2 flex-wrap">
          {isFree ? (
            <button onClick={onUpgrade} className="px-4 py-2 bg-[#696CFF] hover:bg-[#5A5CE6] text-[#FFFFFF] rounded-[12px] text-xs font-semibold shadow-lg shadow-[#696CFF]/15 transition-all cursor-pointer">
              Upgrade Plan
            </button>
          ) : sub.status === "canceled" ? (
            <button onClick={onUpgrade} className="px-4 py-2 bg-gradient-to-r from-[#696CFF] to-[#6B7280] text-[#FFFFFF] rounded-[12px] text-xs font-semibold cursor-pointer">
              Resubscribe
            </button>
          ) : (
            <>
              {!sub.cancelAtPeriodEnd && (
                <button onClick={onChangePlan} className="px-4 py-2 bg-[#18191C] hover:bg-[#25262B] border border-[#202126] hover:border-[#696CFF] rounded-[12px] text-xs font-semibold text-[#8A8D96] hover:text-[#FFFFFF] transition-all cursor-pointer">
                  Change Plan
                </button>
              )}
              {!sub.cancelAtPeriodEnd && (
                <button onClick={onCancel} className="px-4 py-2 bg-[#FF5A4F]/10 hover:bg-[#FF5A4F]/20 border border-[#FF5A4F]/25 rounded-[12px] text-xs font-semibold text-[#FF5A4F] transition-all cursor-pointer">
                  Cancel Subscription
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

function Badge({ cls, children }: { cls: string; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1 text-[9px] font-medium uppercase tracking-wider font-semibold px-2 py-0.5 border rounded-full ${cls}`}>
      {children}
    </span>
  )
}
