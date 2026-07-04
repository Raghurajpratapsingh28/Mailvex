"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import ProfileTab from "./profile-tab"
import SecurityTab from "./security-tab"
import { User, Shield } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

type Tab = "profile" | "security"

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "profile",  label: "Profile",  icon: User },
  { id: "security", label: "Security", icon: Shield },
]

export default function AccountView() {
  const { user } = useAuth()
  const [tab, setTab] = useState<Tab>("profile")

  if (!user) return null

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6 max-w-[1200px] mx-auto select-none">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-[12px] bg-gradient-to-br from-[#696CFF] to-[#6B7280] flex items-center justify-center text-base font-bold text-[#FFFFFF] shadow-lg shadow-[#6B7280]/20">
          {user.firstName[0]}{user.lastName[0]}
        </div>
        <div>
          <span className="text-[10px] text-[#8A8D96] font-medium uppercase tracking-wider">Personal Account</span>
          <h1 className="text-3xl font-bold tracking-tight text-[#FFFFFF] mt-0.5">{user.firstName} {user.lastName}</h1>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar nav */}
        <nav className="w-44 shrink-0 space-y-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-[12px] text-xs font-semibold transition-all cursor-pointer text-left ${
                tab === id
                  ? "bg-[#8A8D96]/10 border border-[#8A8D96]/20 text-[#FFFFFF]"
                  : "text-[#8A8D96] hover:bg-[#18191C] hover:text-[#FFFFFF]"
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              {label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {tab === "profile"  && <ProfileTab />}
          {tab === "security" && <SecurityTab />}
        </div>
      </div>
    </motion.div>
  )
}
