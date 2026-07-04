"use client"

import { Mail, Zap, Database, AlertTriangle } from "lucide-react"
import type { WorkspaceSummary } from "@/lib/analytics-service"

type UsageData = WorkspaceSummary["usage"] | null

export default function UsageSection({ usage }: { usage: UsageData }) {
  const metrics = [
    {
      label: "Emails Sent",
      sublabel: "This billing period",
      count: usage?.emails.used ?? 0,
      limit: usage?.emails.limit ?? 0,
      icon: Mail,
      color: "#696CFF",
      bg: "rgba(105,108,255,0.08)",
    },
    {
      label: "Contacts",
      sublabel: "Total in workspace",
      count: usage?.contacts.used ?? 0,
      limit: usage?.contacts.limit ?? 0,
      icon: Database,
      color: "#00E5FF",
      bg: "rgba(0,229,255,0.08)",
    },
    {
      label: "Events",
      sublabel: "Tracked this period",
      count: usage?.events.used ?? 0,
      limit: usage?.events.limit ?? 0,
      icon: Zap,
      color: "#FFB020",
      bg: "rgba(255,176,32,0.08)",
    },
  ]

  const periodEnd = usage?.periodEnd
    ? new Date(usage.periodEnd).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : null

  return (
    <div className="space-y-3">
      {periodEnd && (
        <p className="text-[11px] text-[#8A8D96] font-medium px-1">
          Billing period resets <span className="text-[#FFFFFF]">{periodEnd}</span>
        </p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {metrics.map((m) => {
          const isUnlimited = m.limit === 0 || m.limit >= 2_000_000_000
          const pct = isUnlimited ? 0 : Math.min(100, (m.count / m.limit) * 100)
          const isWarning = !isUnlimited && pct >= 80
          const isCritical = !isUnlimited && pct >= 95

          return (
            <div key={m.label} className="p-5 enterprise-card flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-[12px] flex items-center justify-center"
                    style={{ backgroundColor: m.bg }}
                  >
                    <m.icon className="w-5 h-5" style={{ color: m.color }} />
                  </div>
                  <div>
                    <h3 className="text-[13px] font-bold text-[#FFFFFF]">{m.label}</h3>
                    <p className="text-[11px] text-[#8A8D96] font-medium mt-0.5">{m.sublabel}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[18px] font-bold text-[#FFFFFF]">
                    {m.count.toLocaleString()}
                  </span>
                  {!isUnlimited && (
                    <span className="text-[12px] font-medium text-[#8A8D96] block">
                      / {m.limit >= 1_000_000 ? `${(m.limit / 1_000_000).toFixed(0)}M` : m.limit.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>

              {isUnlimited ? (
                <div className="flex items-center gap-2">
                  <div className="w-full h-1.5 bg-[#0D0E12] rounded-full overflow-hidden">
                    <div className="h-full w-0 rounded-full" style={{ backgroundColor: m.color }} />
                  </div>
                  <span className="text-[10px] font-bold text-[#8A8D96] whitespace-nowrap">Unlimited</span>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold" style={{ color: m.color }}>
                      {pct.toFixed(1)}% used
                    </span>
                    {isCritical && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-[#FF5A4F] px-2 py-0.5 bg-[#FF5A4F]/10 rounded-[6px]">
                        <AlertTriangle className="w-3 h-3" /> Critical
                      </span>
                    )}
                    {isWarning && !isCritical && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-[#FFB020] px-2 py-0.5 bg-[#FFB020]/10 rounded-[6px]">
                        <AlertTriangle className="w-3 h-3" /> Warning
                      </span>
                    )}
                  </div>
                  <div className="w-full h-1.5 bg-[#0D0E12] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: isCritical ? "#FF5A4F" : isWarning ? "#FFB020" : m.color,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
