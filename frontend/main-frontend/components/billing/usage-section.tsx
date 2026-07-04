import { UsageMetric, usageColor } from "@/lib/billing-data"

export default function UsageSection({ metrics, period }: { metrics: UsageMetric[]; period: string }) {
  return (
    <div className="p-6 rounded-[16px] bg-[#18191C] border border-[#202126]">
      <div className="flex items-center justify-between border-b border-[#202126]/60 pb-4 mb-5">
        <div>
          <h3 className="text-xs font-semibold text-[#FFFFFF]/80 tracking-tight">Usage</h3>
          <p className="text-[11px] text-[#8A8D96] mt-0.5">{period}</p>
        </div>
      </div>
      <div className="space-y-5">
        {metrics.map((m) => {
          const pct = Math.min((m.used / m.limit) * 100, 100)
          const color = usageColor(pct)
          return (
            <div key={m.name}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[#FFFFFF]/90">{m.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-[#8A8D96]">{pct.toFixed(1)}%</span>
                  <span className="text-xs font-medium uppercase tracking-wider font-semibold text-[#FFFFFF]/80">
                    {m.used.toLocaleString()}
                    <span className="text-[#8A8D96] font-normal"> / {m.limit.toLocaleString()}</span>
                  </span>
                </div>
              </div>
              <div className="h-2 bg-[#12141C] rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${color} rounded-full transition-all duration-500`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
