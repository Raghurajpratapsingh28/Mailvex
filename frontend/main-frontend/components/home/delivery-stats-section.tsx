"use client"

import { MailOpen, MousePointerClick, Send, TrendingDown, UserMinus } from "lucide-react"
import type { WorkspaceSummary } from "@/lib/analytics-service"

type Delivery = WorkspaceSummary["campaigns"]["delivery"]

function pct(value: number) {
  return `${(value * 100).toFixed(1)}%`
}

export default function DeliveryStatsSection({ delivery }: { delivery: Delivery }) {
  const stats = [
    {
      label: "Delivery Rate",
      value: pct(delivery.deliveryRate),
      raw: delivery.delivered,
      icon: Send,
      color: "#696CFF",
      bg: "rgba(105,108,255,0.08)",
      good: delivery.deliveryRate >= 0.95,
      warn: delivery.deliveryRate < 0.85,
    },
    {
      label: "Open Rate",
      value: pct(delivery.openRate),
      raw: delivery.opened,
      icon: MailOpen,
      color: "#00E5FF",
      bg: "rgba(0,229,255,0.08)",
      good: delivery.openRate >= 0.2,
      warn: delivery.openRate < 0.1,
    },
    {
      label: "Click Rate",
      value: pct(delivery.clickRate),
      raw: delivery.clicked,
      icon: MousePointerClick,
      color: "#FFB020",
      bg: "rgba(255,176,32,0.08)",
      good: delivery.clickRate >= 0.025,
      warn: delivery.clickRate < 0.01,
    },
    {
      label: "Bounce Rate",
      value: pct(delivery.bounceRate),
      raw: delivery.bounced,
      icon: TrendingDown,
      color: "#FF5A4F",
      bg: "rgba(255,90,79,0.08)",
      good: delivery.bounceRate < 0.02,
      warn: delivery.bounceRate >= 0.05,
    },
    {
      label: "Unsubscribes",
      value: delivery.unsubscribed.toLocaleString(),
      raw: null,
      icon: UserMinus,
      color: "#8A8D96",
      bg: "rgba(138,141,150,0.08)",
      good: false,
      warn: false,
    },
  ]

  if (delivery.totalRecipients === 0) return null

  return (
    <div className="enterprise-card p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-[16px] font-bold text-[#FFFFFF] tracking-tight">Email Performance</h3>
          <p className="text-[11px] text-[#8A8D96] font-medium mt-0.5">
            Across all campaigns — {delivery.totalRecipients.toLocaleString()} total recipients
          </p>
        </div>
        <span className="text-[10px] font-bold text-[#8A8D96] uppercase tracking-widest px-3 py-1 bg-[#0D0E12] rounded-[8px]">
          All Time
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="p-4 enterprise-panel flex flex-col gap-2">
            <div
              className="w-8 h-8 rounded-[8px] flex items-center justify-center"
              style={{ backgroundColor: s.bg }}
            >
              <s.icon className="w-4 h-4" style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-[22px] font-bold text-[#FFFFFF] tracking-tight leading-none">
                {s.value}
              </p>
              {s.raw !== null && (
                <p className="text-[11px] text-[#8A8D96] font-medium mt-1">
                  {s.raw.toLocaleString()} recipients
                </p>
              )}
            </div>
            <div className="flex items-center justify-between mt-auto">
              <p className="text-[11px] text-[#8A8D96] font-semibold">{s.label}</p>
              {s.good && (
                <span className="text-[9px] font-bold text-[#34D399] bg-[#34D399]/10 px-1.5 py-0.5 rounded-[4px]">
                  GOOD
                </span>
              )}
              {s.warn && (
                <span className="text-[9px] font-bold text-[#FF5A4F] bg-[#FF5A4F]/10 px-1.5 py-0.5 rounded-[4px]">
                  LOW
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
