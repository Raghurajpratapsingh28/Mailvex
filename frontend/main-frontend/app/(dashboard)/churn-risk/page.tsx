"use client"

import { motion } from "framer-motion"
import { ShieldAlert, Sparkles } from "lucide-react"

export default function ChurnRiskPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="space-y-6 max-w-[1500px] mx-auto select-none"
    >
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] text-[#7A8499] font-mono uppercase tracking-wider">Predictive AI Analytics</span>
          <h1 className="text-3xl font-extrabold tracking-tight text-white/95 mt-1">Churn Retention</h1>
        </div>
        <button className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-[#6B7280] to-[#6B7280] hover:from-[#4B5563] hover:to-[#374151] rounded-xl text-xs font-semibold text-white transition-all cursor-pointer">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Launch AI Run</span>
        </button>
      </div>

      <div className="p-8 rounded-3xl bg-[#0F1016]/95 border border-[#1C202C] min-h-[400px] flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-2xl bg-[#6B7280]/10 border border-[#6B7280]/25 flex items-center justify-center text-[#9CA3AF] mb-4 font-mono font-bold">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-white">No Retention Analytics Generated</h3>
        <p className="text-xs text-[#B0B8C8] mt-1.5 max-w-[320px] leading-relaxed">
          Enable the AI Copilot to run statistical predictions on telemetry drop-offs and discover customers at risk.
        </p>
        <button className="mt-5 px-4 py-2 border border-[#6B7280]/35 bg-[#6B7280]/10 hover:bg-[#6B7280]/20 text-xs font-semibold text-[#9CA3AF] rounded-xl cursor-pointer transition-colors duration-300">
          Activate Predictive Models
        </button>
      </div>
    </motion.div>
  )
}
