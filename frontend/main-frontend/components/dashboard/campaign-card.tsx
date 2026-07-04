"use client"

import { ArrowUpRight } from "lucide-react"

interface CampaignCardProps {
  channelName: string
  metricType: string
  metricValue: string
  trendValue: string
  isPositive: boolean
  secondaryMetric: string
  chartColor: string // hex color for neon trail
  chartPath: string // SVG path string
  icon: React.ComponentType<{ className?: string }>
}

export default function CampaignCard({
  channelName,
  metricType,
  metricValue,
  trendValue,
  isPositive,
  secondaryMetric,
  chartColor,
  chartPath,
  icon: Icon
}: CampaignCardProps) {
  // Generate random IDs for SVG gradients to avoid collision
  const gradId = `chart-grad-${channelName.replace(/\s+/g, "").toLowerCase()}`
  const glowId = `chart-glow-${channelName.replace(/\s+/g, "").toLowerCase()}`

  return (
    <div className="relative p-6 rounded-3xl bg-[#0F1016]/90 border border-[#1C202C] hover:border-[#2C3146] transition-all duration-500 overflow-hidden group select-none flex flex-col justify-between h-[230px]">
      {/* Background radial glow */}
      <div
        className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-[0.03] group-hover:opacity-[0.07] transition-opacity duration-500 pointer-events-none"
        style={{ backgroundColor: chartColor }}
      />

      {/* Top Header Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="p-2.5 rounded-xl border flex items-center justify-center transition-all duration-300"
            style={{
              backgroundColor: `${chartColor}10`,
              borderColor: `${chartColor}25`,
              color: chartColor
            }}
          >
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-[#7A8499] font-mono leading-none uppercase tracking-wider">Active Channel</p>
            <h3 className="text-xs font-semibold text-white mt-1">{channelName}</h3>
          </div>
        </div>
        <button
          className="p-2 bg-[#171922] border border-[#232737] group-hover:border-[#383E58] text-[#B0B8C8] group-hover:text-white rounded-xl transition-all duration-300 cursor-pointer"
          style={{ transitionDelay: "50ms" }}
        >
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* Metric Middle Row */}
      <div className="mt-4 flex items-baseline justify-between relative z-10">
        <div>
          <span className="text-[10px] text-[#7A8499] font-mono block uppercase tracking-wide">{metricType}</span>
          <span className="text-[28px] font-semibold text-white tracking-tight leading-none mt-1.5 block">
            {metricValue}
          </span>
        </div>
        <div
          className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[9px] font-mono font-semibold ${
            isPositive
              ? "bg-[#3CD3AD]/10 border-[#3CD3AD]/25 text-[#3CD3AD]"
              : "bg-[#FE5C5C]/10 border-[#FE5C5C]/25 text-[#FE5C5C]"
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isPositive ? "#3CD3AD" : "#FE5C5C" }} />
          {trendValue}
        </div>
      </div>

      {/* Line Chart & Bottom Metric */}
      <div className="mt-4 flex items-end justify-between relative h-16 w-full">
        {/* Custom SVG Line Chart */}
        <div className="absolute inset-0 top-2 h-12 w-[60%] select-none">
          <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
            <defs>
              {/* Gradient for fill area under line */}
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={chartColor} stopOpacity="0.15" />
                <stop offset="100%" stopColor={chartColor} stopOpacity="0.00" />
              </linearGradient>
              {/* Glow filter */}
              <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="1.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Glowing fill path */}
            <path
              d={`${chartPath} L 100,30 L 0,30 Z`}
              fill={`url(#${gradId})`}
              className="transition-all duration-700"
            />

            {/* Glowing stroke path */}
            <path
              d={chartPath}
              fill="none"
              stroke={chartColor}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter={`url(#${glowId})`}
              className="transition-all duration-700"
            />

            {/* Neon Chart Node Indicator */}
            <circle cx="70" cy="18" r="2.5" fill={chartColor} className="animate-pulse" />
            <circle cx="70" cy="18" r="4.5" fill="none" stroke={chartColor} strokeWidth="0.75" className="opacity-40" />
          </svg>
        </div>

        {/* Secondary Value display */}
        <div className="ml-auto text-right relative z-10">
          <span className="text-[11px] font-mono font-semibold text-[#B0B8C8]">
            {secondaryMetric}
          </span>
        </div>
      </div>
    </div>
  )
}
