"use client"

import { PLANS, BillingInterval, planPrice } from "@/lib/billing-data"
import type { Subscription } from "@/lib/billing-service"
import { X, ArrowRight, AlertTriangle } from "lucide-react"

// ── Change Plan Modal ──────────────────────────────────────────────

interface ChangePlanProps {
  targetPlanId: string | null
  interval: BillingInterval
  currentSubscription: Subscription
  onClose: () => void
  onConfirm: (planId: string, interval: BillingInterval) => void
}

export function ChangePlanModal({ targetPlanId, interval, currentSubscription, onClose, onConfirm }: ChangePlanProps) {
  if (!targetPlanId) return null
  const currentPlan = PLANS.find((p) => p.id === currentSubscription.plan)
  const targetPlan = PLANS.find((p) => p.id === targetPlanId)
  if (!currentPlan || !targetPlan) return null

  const currentInterval: BillingInterval = (currentSubscription.billingInterval as BillingInterval) ?? "monthly"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-[#18191C] border border-[#202126] rounded-[16px] shadow-2xl shadow-black/50 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#202126]">
          <span className="text-[10px] text-[#8A8D96] font-medium uppercase tracking-wider">Change Plan</span>
          <button onClick={onClose} className="p-2 rounded-[12px] hover:bg-[#25262B] text-[#8A8D96] hover:text-[#FFFFFF] transition-all cursor-pointer"><X className="w-4 h-4" /></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-bold text-[#FFFFFF]">Change to {targetPlan.name} plan?</h2>

          <div className="flex items-center gap-3 p-3.5 rounded-[12px] bg-[#18191C] border border-[#202126] text-xs">
            <div className="text-center flex-1">
              <p className="text-[9px] font-medium uppercase tracking-wider text-[#8A8D96]">Current</p>
              <p className="font-semibold text-[#FFFFFF]/80 mt-0.5">{currentPlan.name}</p>
              <p className="font-medium uppercase tracking-wider text-[#8A8D96]">${planPrice(currentPlan, currentInterval)}/{currentInterval === "yearly" ? "yr" : "mo"}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-[#8A8D96] shrink-0" />
            <div className="text-center flex-1">
              <p className="text-[9px] font-medium uppercase tracking-wider text-[#8A8D96]">New</p>
              <p className="font-semibold text-[#8A8D96] mt-0.5">{targetPlan.name}</p>
              <p className="font-medium uppercase tracking-wider text-[#8A8D96]">${planPrice(targetPlan, interval)}/{interval === "yearly" ? "yr" : "mo"}</p>
            </div>
          </div>

          <div className="space-y-1.5 text-xs text-[#8A8D96]">
            <p className="flex items-start gap-1.5"><span className="mt-0.5">•</span> Proration applied immediately</p>
            <p className="flex items-start gap-1.5"><span className="mt-0.5">•</span> New limits take effect now</p>
            <p className="flex items-start gap-1.5"><span className="mt-0.5">•</span> {targetPlan.contacts.toLocaleString()} contacts · {targetPlan.emails.toLocaleString()} emails/mo</p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#202126]">
          <button onClick={onClose} className="px-4 py-2 bg-[#18191C] hover:bg-[#25262B] border border-[#202126] rounded-[12px] text-xs font-semibold text-[#8A8D96] hover:text-[#FFFFFF] transition-all cursor-pointer">Cancel</button>
          <button
            onClick={() => { onConfirm(targetPlanId, interval); onClose() }}
            className="px-4 py-2 bg-[#696CFF] hover:bg-[#5A5CE6] text-[#FFFFFF] rounded-[12px] text-xs font-semibold shadow-lg shadow-[#696CFF]/15 transition-all cursor-pointer"
          >
            Confirm Change
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Cancel Subscription Modal ──────────────────────────────────────

interface CancelProps {
  isOpen: boolean
  subscription: Subscription
  onClose: () => void
  onConfirm: () => void
}

export function CancelModal({ isOpen, subscription: sub, onClose, onConfirm }: CancelProps) {
  if (!isOpen) return null
  const plan = PLANS.find((p) => p.id === sub.plan)
  const periodEnd = sub.currentPeriodEnd
    ? new Date(sub.currentPeriodEnd).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "period end"

  const freePlan = PLANS.find((p) => p.id === "free")
  const freeContacts = freePlan ? freePlan.contacts.toLocaleString() : "1,000"
  const freeEmails = freePlan ? freePlan.emails.toLocaleString() : "3,000"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-[#18191C] border border-[#202126] rounded-[16px] shadow-2xl shadow-black/50 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#202126]">
          <span className="text-[10px] text-[#8A8D96] font-medium uppercase tracking-wider">Cancel Subscription</span>
          <button onClick={onClose} className="p-2 rounded-[12px] hover:bg-[#25262B] text-[#8A8D96] hover:text-[#FFFFFF] transition-all cursor-pointer"><X className="w-4 h-4" /></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="flex items-start gap-3 p-3.5 rounded-[12px] bg-[#FFB020]/10 border border-[#FFB020]/20">
            <AlertTriangle className="w-4 h-4 text-[#FFB020] shrink-0 mt-0.5" />
            <p className="text-xs text-[#FFB020]">Your {plan?.name} plan will remain active until <strong>{periodEnd}</strong>.</p>
          </div>
          <div className="space-y-1.5 text-xs text-[#8A8D96]">
            <p className="font-semibold text-[#FFFFFF]/80 mb-2">After {periodEnd}:</p>
            <p className="flex items-start gap-1.5"><span className="text-[#FF5A4F] mt-0.5">•</span> Workspace downgrades to Free plan</p>
            <p className="flex items-start gap-1.5"><span className="text-[#FF5A4F] mt-0.5">•</span> Limits: {freeContacts} contacts, {freeEmails} emails/mo</p>
            <p className="flex items-start gap-1.5"><span className="text-[#FF5A4F] mt-0.5">•</span> Excess contacts will be read-only</p>
          </div>
          <p className="text-[10px] text-[#8A8D96] font-medium uppercase tracking-wider">You can resume anytime before {periodEnd}.</p>
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#202126]">
          <button onClick={onClose} className="px-4 py-2 bg-[#18191C] hover:bg-[#25262B] border border-[#202126] rounded-[12px] text-xs font-semibold text-[#8A8D96] hover:text-[#FFFFFF] transition-all cursor-pointer">Keep Plan</button>
          <button onClick={() => { onConfirm(); onClose() }} className="px-4 py-2 bg-[#FF5A4F]/10 hover:bg-[#FF5A4F]/20 border border-[#FF5A4F]/25 rounded-[12px] text-xs font-semibold text-[#FF5A4F] transition-all cursor-pointer">
            Cancel Plan
          </button>
        </div>
      </div>
    </div>
  )
}
