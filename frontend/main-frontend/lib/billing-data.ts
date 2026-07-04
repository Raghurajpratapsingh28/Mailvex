export type BillingInterval = "monthly" | "yearly"
export type InvoiceStatus = "paid" | "open" | "void" | "draft"

export type Plan = {
  id: string
  name: string
  monthlyPrice: number
  yearlyPrice: number
  contacts: number
  emails: number
  events: number
  features: string[]
}

export type UsageMetric = {
  name: string
  used: number
  limit: number
}

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    monthlyPrice: 0,
    yearlyPrice: 0,
    contacts: 1000,
    emails: 3000,
    events: 5000,
    features: [
      "1,000 contacts",
      "3,000 emails/month",
      "Basic automation",
      "1 custom domain",
      "Mailvex branding",
    ],
  },
  {
    id: "starter",
    name: "Starter",
    monthlyPrice: 12,
    yearlyPrice: 120,
    contacts: 10000,
    emails: 25000,
    events: 100000,
    features: [
      "10,000 contacts",
      "25,000 emails/month",
      "Automation workflows",
      "Segments",
      "Custom domains",
      "No branding",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    monthlyPrice: 39,
    yearlyPrice: 390,
    contacts: 50000,
    emails: 150000,
    events: 500000,
    features: [
      "50,000 contacts",
      "150,000 emails/month",
      "Advanced workflows",
      "API access",
      "Webhooks",
      "Analytics",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    monthlyPrice: 99,
    yearlyPrice: 990,
    contacts: 150000,
    emails: 500000,
    events: 2000000,
    features: [
      "150,000 contacts",
      "500,000 emails/month",
      "Priority support",
      "Team members",
      "Advanced permissions",
    ],
  },
  {
    id: "scale",
    name: "Scale",
    monthlyPrice: 249,
    yearlyPrice: 2490,
    contacts: 500000,
    emails: 2000000,
    events: 10000000,
    features: [
      "500,000 contacts",
      "2,000,000 emails/month",
      "Dedicated onboarding",
      "SLA",
      "Premium support",
    ],
  },
]

export const INVOICE_STATUS_META: Record<InvoiceStatus, { label: string; cls: string }> = {
  paid:  { label: "Paid",  cls: "bg-emerald-500/10 border-emerald-500/25 text-emerald-400" },
  open:  { label: "Open",  cls: "bg-amber-500/10 border-amber-500/25 text-amber-400" },
  void:  { label: "Void",  cls: "bg-zinc-500/10 border-zinc-500/25 text-zinc-400" },
  draft: { label: "Draft", cls: "bg-zinc-500/10 border-zinc-500/25 text-zinc-400" },
}

export function usageColor(pct: number): string {
  if (pct >= 90) return "from-red-500 to-red-400"
  if (pct >= 70) return "from-amber-500 to-yellow-400"
  return "from-emerald-500 to-teal-400"
}

export function planPrice(plan: Plan, interval: BillingInterval): number {
  return interval === "yearly" ? plan.yearlyPrice : plan.monthlyPrice
}
