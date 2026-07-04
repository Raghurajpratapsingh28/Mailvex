"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { PLANS } from "@/lib/billing-data"
import CurrentPlanCard from "./current-plan-card"
import UsageSection from "./usage-section"
import PlansGrid from "./plans-grid"
import InvoicesTable from "./invoices-table"
import { ChangePlanModal, CancelModal } from "./billing-modals"
import { billingService, type Subscription, type Usage, type Invoice } from "@/lib/billing-service"
import { contactsService } from "@/lib/contacts-service"
import { useAuth } from "@/lib/auth-context"

const ACTIVE_STATUSES = ["active", "trialing", "past_due"]

export default function BillingView({ workspaceSlug }: { workspaceSlug?: string }) {
  const { user } = useAuth()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [usage, setUsage] = useState<Usage | null>(null)
  const [contactsTotal, setContactsTotal] = useState<number | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [changePlanTarget, setChangePlanTarget] = useState<string | null>(null)
  const [changePlanInterval, setChangePlanInterval] = useState<"monthly" | "yearly">("monthly")
  const [cancelOpen, setCancelOpen] = useState(false)
  const [workspaceId, setWorkspaceId] = useState<string>("")
  const [userRole, setUserRole] = useState<string>("viewer")

  useEffect(() => {
    if (!user?.workspaces?.length) return
    const ws = workspaceSlug
      ? (user.workspaces.find(w => w.id === workspaceSlug) ?? user.workspaces.find(w => w.slug === workspaceSlug) ?? user.workspaces[0])
      : user.workspaces[0]
    setWorkspaceId(ws.id)
    setUserRole(ws.role ?? "viewer")
    setSubscription(null)
    setUsage(null)
    setInvoices([])
    setContactsTotal(null)
    setIsLoading(true)
    loadData(ws.id)
  }, [user, workspaceSlug])

  const loadData = async (wsId: string) => {
    setIsLoading(true)
    try {
      const [subRes, usageRes, invoicesRes, contactsRes] = await Promise.allSettled([
        billingService.getSubscription(wsId),
        billingService.getUsage(wsId),
        billingService.getInvoices(wsId),
        contactsService.getContacts(wsId, { pageSize: 1 }),
      ])
      if (subRes.status === "fulfilled") setSubscription(subRes.value)
      if (usageRes.status === "fulfilled") setUsage(usageRes.value)
      if (invoicesRes.status === "fulfilled") setInvoices(invoicesRes.value.items)
      if (contactsRes.status === "fulfilled") setContactsTotal(contactsRes.value.total)
    } catch (error) {
      console.error("Failed to load billing data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectPlan = async (planId: string, interval: "monthly" | "yearly") => {
    if (!subscription) return
    const hasActiveSub = subscription.plan !== "free" && ACTIVE_STATUSES.includes(subscription.status)
    if (!hasActiveSub) {
      try {
        const res = await billingService.createCheckout(workspaceId, { plan: planId, billingInterval: interval })
        window.location.href = res.checkoutUrl
      } catch (error) {
        console.error("Failed to create checkout:", error)
      }
      return
    }
    setChangePlanTarget(planId)
    setChangePlanInterval(interval)
  }

  const handleConfirmChange = async (planId: string, interval: "monthly" | "yearly") => {
    try {
      const res = await billingService.changePlan(workspaceId, { plan: planId, billingInterval: interval })
      setSubscription(res)
      setChangePlanTarget(null)
      loadData(workspaceId)
    } catch (error) {
      console.error("Failed to change plan:", error)
    }
  }

  const handleCancel = async () => {
    try {
      const res = await billingService.cancelSubscription(workspaceId)
      setSubscription(res)
      setCancelOpen(false)
    } catch (error) {
      console.error("Failed to cancel subscription:", error)
    }
  }

  const handleResume = async () => {
    try {
      const res = await billingService.resumeSubscription(workspaceId)
      setSubscription(res)
    } catch (error) {
      console.error("Failed to resume subscription:", error)
    }
  }

  const handleManageBilling = async () => {
    try {
      const res = await billingService.createPortal(workspaceId)
      window.location.href = res.url
    } catch (error) {
      console.error("Failed to open billing portal:", error)
    }
  }

  if (isLoading || !subscription || !usage) {
    return <div className="text-[#FFFFFF]">Loading...</div>
  }

  const period = `${new Date(usage.periodStart).toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${new Date(usage.periodEnd).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`

  const usageMetrics = [
    { name: "Contacts", used: contactsTotal ?? usage.contacts.used, limit: usage.contacts.limit },
    { name: "Emails Sent", used: usage.emails.used, limit: usage.emails.limit },
    { name: "Events Tracked", used: usage.events.used, limit: usage.events.limit },
  ]

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6 max-w-[1200px] mx-auto select-none">
      <div>
        <span className="text-[10px] text-[#8A8D96] font-medium uppercase tracking-wider">Subscription & Payments</span>
        <h1 className="text-3xl font-bold tracking-tight text-[#FFFFFF] mt-1">Billing</h1>
      </div>

      <CurrentPlanCard subscription={subscription} userRole={userRole} onChangePlan={() => document.getElementById("plans-grid")?.scrollIntoView({ behavior: "smooth" })} onCancel={() => setCancelOpen(true)} onResume={handleResume} onUpgrade={() => document.getElementById("plans-grid")?.scrollIntoView({ behavior: "smooth" })} onManageBilling={handleManageBilling} />

      <UsageSection metrics={usageMetrics} period={period} />

      <div id="plans-grid"><PlansGrid currentPlanId={subscription.plan} userRole={userRole} onSelectPlan={handleSelectPlan} /></div>

      <InvoicesTable invoices={invoices} />

      <ChangePlanModal targetPlanId={changePlanTarget} interval={changePlanInterval} currentSubscription={subscription} onClose={() => setChangePlanTarget(null)} onConfirm={handleConfirmChange} />
      <CancelModal isOpen={cancelOpen} subscription={subscription} onClose={() => setCancelOpen(false)} onConfirm={handleCancel} />
    </motion.div>
  )
}
