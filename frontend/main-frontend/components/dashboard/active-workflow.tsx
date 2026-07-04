"use client"

import { useState } from "react"
import { motion, useMotionValue, useTransform } from "framer-motion"
import {
  Clock,
  Sparkles,
  Link2,
  Share2,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  BarChart2,
  Plus,
  RotateCw,
  SlidersHorizontal,
  Mail,
  Zap,
  Shield,
  Activity,
  Percent
} from "lucide-react"

export default function ActiveWorkflow() {
  const [activeTab, setActiveTab] = useState<"deliverability" | "analytics" | "bounce" | "conversion">("deliverability")
  const [delayWeeks, setDelayWeeks] = useState(4)

  // Drag slider mechanics
  const constraintsRef = { left: 0, right: 350 }
  const x = useMotionValue(150)
  const currentWeek = useTransform(x, [0, 350], [1, 12])

  // Sync state
  x.on("change", (latest) => {
    const calculated = Math.round(1 + (latest / 350) * 11)
    if (calculated !== delayWeeks && calculated >= 1 && calculated <= 12) {
      setDelayWeeks(calculated)
    }
  })

  return (
    <div className="p-8 rounded-3xl bg-[#0F1016]/95 border border-[#1C202C] select-none font-sans text-white relative">
      {/* Background radial glow */}
      <div className="absolute left-[30%] top-[40%] w-60 h-60 bg-[#6B7280]/5 blur-3xl rounded-full pointer-events-none" />

      {/* Top Header Row */}
      <div className="flex items-center justify-between border-b border-[#161920]/80 pb-5">
        <h2 className="text-sm font-semibold text-[#A7ABB3]">Your active workflows</h2>
        <div className="flex items-center gap-2">
          {[BarChart2, Plus, RotateCw, SlidersHorizontal].map((Icon, idx) => (
            <button
              key={idx}
              className="p-2 bg-[#12141B] hover:bg-[#1B1E29] border border-[#1E222D] hover:border-[#2C3145] text-[#B0B8C8] hover:text-white rounded-xl transition-all duration-300 cursor-pointer"
            >
              <Icon className="w-4 h-4" />
            </button>
          ))}
        </div>
      </div>

      {/* Main Stats Area split 60/40 */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left Side: Stats & Details */}
        <div className="lg:col-span-3 flex flex-col justify-between">
          <div>
            {/* Last update tag */}
            <div className="flex items-center gap-2 text-[#7A8499] text-[10px] font-mono uppercase tracking-wider">
              <Clock className="w-3.5 h-3.5" />
              <span>Last Update - 45 minutes ago</span>
            </div>

            {/* Campaign Name Header */}
            <div className="mt-3 flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#6B7280]/15 border border-[#6B7280]/30 text-[#9CA3AF]">
                  <Mail className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">Customer Onboarding Drip</h3>
              </div>
              <span className="text-[10px] font-mono font-bold bg-[#FE8A5C]/10 border border-[#FE8A5C]/25 text-[#FE8A5C] px-2 py-0.5 rounded-full uppercase tracking-wider">
                Active
              </span>
              <div className="flex items-center gap-1.5 ml-2">
                <button className="p-1.5 bg-[#12141A] hover:bg-[#1C1F2D] border border-[#1E222D] rounded-lg text-[#B0B8C8] hover:text-white transition-colors cursor-pointer">
                  <Link2 className="w-3.5 h-3.5" />
                </button>
                <button className="p-1.5 bg-[#12141A] hover:bg-[#1C1F2D] border border-[#1E222D] rounded-lg text-[#B0B8C8] hover:text-white transition-colors cursor-pointer">
                  <Share2 className="w-3.5 h-3.5" />
                </button>
                <button className="flex items-center gap-1 px-2.5 py-1 bg-[#12141A] hover:bg-[#1C1F2D] border border-[#1E222D] rounded-lg text-[10px] text-[#B0B8C8] hover:text-white font-semibold transition-colors cursor-pointer">
                  <span>View Campaign</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* High Precision Metric */}
            <div className="mt-6">
              <p className="text-[10px] text-[#7A8499] font-mono uppercase tracking-widest">Delivered Messages (24H)</p>
              <div className="mt-2.5 flex items-baseline gap-4">
                <span className="text-[52px] font-semibold tracking-tight leading-none text-white font-sans">
                  31.39686<span className="text-2xl text-[#B0B8C8] font-mono ml-0.5">M</span>
                </span>
                <div className="flex gap-2">
                  <button className="bg-[#6B7280]/20 border border-[#6B7280]/35 text-[#D1D5DB] hover:bg-[#6B7280]/30 hover:text-white px-4 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-300 cursor-pointer">
                    Upgrade
                  </button>
                  <button className="bg-transparent border border-[#232737] hover:border-[#3E4562] text-[#B0B8C8] hover:text-white px-4 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-300 cursor-pointer">
                    Pause Flow
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Metric Sub-tabs */}
          <div className="mt-8 pt-5 border-t border-[#161920]/80">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { id: "deliverability", label: "Deliverability", sub: "Growth dynamics", icon: Activity },
                { id: "analytics", label: "Analytics", sub: "Overview metrics", icon: SlidersHorizontal },
                { id: "bounce", label: "Bounce Risk", sub: "Risk assessment", icon: Shield },
                { id: "conversion", label: "Expected CR", sub: "Estimated conversions", icon: Percent },
              ].map((tab) => {
                const isActive = activeTab === tab.id
                return (
                  <div
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`p-3 rounded-2xl border transition-all duration-300 cursor-pointer ${
                      isActive
                        ? "bg-[#141620] border-[#6B7280]/50 shadow-[inset_0_0_12px_rgba(139,92,246,0.1)] text-white"
                        : "bg-[#0B0C10]/40 border-[#1C202C] text-[#B0B8C8] hover:border-[#2C3146] hover:text-white"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold">{tab.label}</span>
                      <tab.icon className={`w-3.5 h-3.5 ${isActive ? "text-[#6B7280]" : "text-[#7A8499]"}`} />
                    </div>
                    <span className="text-[9px] text-[#7A8499] block leading-none">{tab.sub}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Soundwave Timeline Delay Slider */}
        <div className="lg:col-span-2 flex flex-col justify-between border-l border-[#161920]/80 lg:pl-8">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-semibold text-white">Flow Delay Schedule</h4>
                <p className="text-[10px] text-[#7A8499] mt-0.5">Delay cadence between emails</p>
              </div>
              <span className="text-xs font-mono font-semibold bg-[#6B7280]/15 border border-[#6B7280]/25 text-[#9CA3AF] px-2 py-0.5 rounded-lg">
                12 Weeks Max
              </span>
            </div>

            {/* Slider visual track container */}
            <div className="mt-8 relative pt-8 pb-4">
              {/* Endpoint bubble marks */}
              <div className="absolute top-0 left-0 text-[10px] font-mono text-[#7A8499]">1 Wk</div>
              <div className="absolute top-0 right-0 text-[10px] font-mono text-[#7A8499]">12 Wks</div>

              {/* Soundwave/Waveform bars backdrop */}
              <div className="flex items-end justify-between h-8 px-1 opacity-25 pointer-events-none">
                {[4, 6, 8, 5, 9, 12, 10, 8, 6, 4, 3, 5, 8, 12, 10, 6, 4, 5, 7, 9, 11, 8, 5, 4, 3, 5, 8, 10, 9, 6].map(
                  (val, idx) => (
                    <div
                      key={idx}
                      className="w-[2.5px] rounded-full bg-white"
                      style={{ height: `${(val / 12) * 100}%` }}
                    />
                  )
                )}
              </div>

              {/* Slider Track Line */}
              <div className="h-[2px] bg-[#1E222D] rounded-full w-full relative mt-4">
                {/* Active track glow */}
                <div
                  className="absolute left-0 top-0 h-full bg-gradient-to-r from-[#6B7280] to-[#6B7280]"
                  style={{ width: `${((delayWeeks - 1) / 11) * 100}%` }}
                />

                {/* Draggable Handle */}
                <motion.div
                  drag="x"
                  dragElastic={0}
                  dragMomentum={false}
                  dragConstraints={{ left: 0, right: 300 }}
                  style={{ x }}
                  className="absolute top-1/2 -translate-y-1/2 -ml-3 w-6 h-6 rounded-full bg-[#6B7280] hover:bg-[#4B5563] border-4 border-[#090A0E] hover:scale-110 shadow-lg shadow-[#6B7280]/30 cursor-pointer flex items-center justify-center transition-transform"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                </motion.div>
              </div>

              {/* Slider Tooltip */}
              <div
                className="absolute -top-1 mt-0.5 px-3 py-1 bg-gradient-to-r from-[#6B7280] to-[#6B7280] text-[10px] font-semibold text-white font-mono rounded-full pointer-events-none shadow-lg shadow-[#6B7280]/20 transition-all duration-75 flex items-center gap-1.5"
                style={{
                  left: `${((delayWeeks - 1) / 11) * 80}%`,
                  transform: "translateX(-20px)",
                }}
              >
                <span>{delayWeeks} Wks Delay</span>
                <div className="w-2 h-2 rounded-full bg-white/20 flex items-center justify-center">
                  <div className="w-0.5 h-1.5 bg-white rounded-xs" />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-[#161920]/80 mt-6 flex justify-between items-center text-[10px] text-[#7A8499] font-mono">
            <span>AUDITED CADENCE</span>
            <span className="text-[#3CD3AD] font-semibold">OPTIMIZED BY AI</span>
          </div>
        </div>
      </div>

      {/* Grid of 4 small sub-metrics at the absolute bottom */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-6 border-t border-[#161920]/80">
        {/* Metric 1 */}
        <div className="p-4 rounded-2xl bg-[#090A0E] border border-[#161920]/80">
          <p className="text-[9px] text-[#7A8499] font-mono uppercase tracking-wider">Unsubscribe Trend</p>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-xl font-bold font-mono text-white">-0.82%</span>
            <div className="flex items-center gap-1 text-[10px] font-mono font-semibold text-[#3CD3AD]">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>Decrease</span>
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-4 rounded-2xl bg-[#090A0E] border border-[#161920]/80">
          <p className="text-[9px] text-[#7A8499] font-mono uppercase tracking-wider">Cost Per Lead (CPL)</p>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-xl font-bold font-mono text-white">$41.99</span>
            <div className="flex items-center gap-1 text-[10px] font-mono font-semibold text-[#FE5C5C]">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>-1.09%</span>
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-4 rounded-2xl bg-[#090A0E] border border-[#161920]/80">
          <p className="text-[9px] text-[#7A8499] font-mono uppercase tracking-wider">Workflow Sync Ratio</p>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-xl font-bold font-mono text-white">60.6%</span>
            <span className="text-[9px] text-[#7A8499] font-mono">24H AVG</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-4 rounded-2xl bg-[#090A0E] border border-[#161920]/80 flex flex-col justify-between">
          <div className="flex justify-between items-center text-[9px] text-[#7A8499] font-mono uppercase tracking-wider">
            <span>Target CTR Rate</span>
            <span className="text-white/60">2.23%</span>
          </div>
          {/* Double slider progress bar */}
          <div className="mt-3.5 h-[3px] bg-[#1E222D] rounded-full w-full relative">
            {/* Primary metric marker */}
            <div className="absolute left-[35%] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#6B7280] shadow-sm shadow-[#6B7280]/30" />
            {/* Secondary metric marker */}
            <div className="absolute left-[65%] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#FE8A5C] shadow-sm shadow-[#FE8A5C]/30" />
          </div>
          <div className="flex justify-between text-[8px] text-[#7A8499] font-mono mt-2">
            <span>1.46% (48H Ago)</span>
            <span>2.23% (Goal)</span>
          </div>
        </div>
      </div>
    </div>
  )
}
