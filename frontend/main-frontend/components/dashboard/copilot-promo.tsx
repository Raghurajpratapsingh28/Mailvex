"use client"

import { Sparkles, ArrowRight, ShieldCheck, Lock } from "lucide-react"

export default function CopilotPromo() {
  return (
    <div className="relative p-7 rounded-3xl bg-gradient-to-b from-[#111318] to-[#0A0713] border border-[#1F2937] hover:border-[#3D326D] transition-all duration-500 overflow-hidden group flex flex-col justify-between h-[230px] shadow-xl shadow-[#6B7280]/5">
      {/* Dynamic light gradient beam overlay */}
      <div className="absolute top-0 right-0 w-44 h-44 bg-[#6B7280]/10 blur-3xl rounded-full pointer-events-none group-hover:scale-110 transition-transform duration-700" />
      <div className="absolute left-[-20%] bottom-[-25%] w-40 h-40 bg-pink-500/5 blur-3xl rounded-full pointer-events-none" />

      {/* Top row with Badge */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          {/* Company Mini Icon */}
          <div className="w-5 h-5 rounded bg-[#6B7280]/20 flex items-center justify-center border border-[#6B7280]/30">
            <Sparkles className="w-3 h-3 text-[#9CA3AF]" />
          </div>
          <span className="text-xs font-semibold text-white/95">Mailvex</span>
        </div>
        <span className="bg-[#6B7280]/20 border border-[#6B7280]/40 text-[#D1D5DB] text-[9px] font-mono font-bold px-2 py-0.5 rounded-md tracking-wider uppercase">
          New
        </span>
      </div>

      {/* Content description */}
      <div className="mt-3 z-10">
        <h3 className="text-lg font-serif font-light text-white leading-snug">
          Autonomous <span className="bg-gradient-to-r from-pink-400 via-purple-300 to-indigo-300 bg-clip-text text-transparent font-medium">Growth Engine</span>
        </h3>
        <p className="text-[11px] text-[#A7ABB3] leading-relaxed mt-2 max-w-[95%]">
          An all-in-one visual designer that helps you create automated loops, campaign strategies, and conversion workflows natively.
        </p>
      </div>

      {/* Action Buttons Row */}
      <div className="mt-4 flex gap-2.5 z-10">
        <button className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#6B7280] to-[#6B7280] hover:from-[#4B5563] hover:to-[#374151] text-white py-2.5 px-4 rounded-xl text-xs font-semibold shadow-md shadow-[#6B7280]/20 transition-all duration-300 cursor-pointer">
          <span>Launch AI Copilot</span>
          <Sparkles className="w-3.5 h-3.5 text-white" />
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 bg-[#191724]/80 border border-[#2D2A42] hover:bg-[#252233] hover:border-[#423C62] text-xs font-semibold text-[#A7ABB3] hover:text-white py-2.5 px-4 rounded-xl transition-all duration-300 cursor-pointer">
          <span>Build Manually</span>
          <Lock className="w-3 h-3 text-[#7A8499]" />
        </button>
      </div>
    </div>
  )
}
