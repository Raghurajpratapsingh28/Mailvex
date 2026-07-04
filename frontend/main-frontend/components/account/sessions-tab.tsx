"use client"

import { useState } from "react"
import { Session, parseDevice } from "@/lib/account-data"
import { X, ShieldCheck } from "lucide-react"

export default function SessionsTab({ sessions: init }: { sessions: Session[] }) {
  const [sessions, setSessions] = useState(init)
  const [revokeTarget, setRevokeTarget] = useState<Session | null>(null)

  const revoke = (id: string) => {
    setSessions(sessions.filter((s) => s.id !== id))
    setRevokeTarget(null)
  }

  const revokeAllOthers = () => {
    setSessions(sessions.filter((s) => s.isCurrent))
  }

  const others = sessions.filter((s) => !s.isCurrent)

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-medium uppercase tracking-wider text-[#8A8D96]">{sessions.length} active session{sessions.length !== 1 ? "s" : ""}</span>
        {others.length > 0 && (
          <button onClick={revokeAllOthers} className="px-3.5 py-2 bg-[#18191C] hover:bg-[#25262B] border border-[#202126] hover:border-red-500/30 rounded-[12px] text-[10px] font-medium uppercase tracking-wider font-semibold text-[#8A8D96] hover:text-[#FF5A4F] transition-all cursor-pointer">
            Revoke All Other Sessions
          </button>
        )}
      </div>

      {/* Session cards */}
      <div className="space-y-3">
        {sessions.map((s) => {
          const { icon, label } = parseDevice(s.userAgent)
          return (
            <div key={s.id} className={`p-5 rounded-[12px] border transition-all ${s.isCurrent ? "bg-[#6B7280]/5 border-[#6B7280]/25" : "bg-[#18191C] border-[#202126]"}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="text-xl mt-0.5">{icon}</span>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[#FFFFFF]/90">{label}</span>
                      {s.isCurrent && (
                        <span className="flex items-center gap-1 text-[9px] font-medium uppercase tracking-wider font-semibold px-2 py-0.5 border rounded-full bg-[#3CD3AD]/10 border-[#3CD3AD]/25 text-[#3CD3AD]">
                          <ShieldCheck className="w-2.5 h-2.5" /> Current
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-[#8A8D96] font-medium uppercase tracking-wider">IP: {s.ipAddress}</p>
                    <p className="text-[10px] text-[#8A8D96] font-medium uppercase tracking-wider truncate max-w-[380px]">{s.userAgent}</p>
                    <div className="flex items-center gap-4 text-[9px] font-medium uppercase tracking-wider text-[#8A8D96]">
                      <span>Created: {new Date(s.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                      <span>Expires: {new Date(s.expiresAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                    </div>
                  </div>
                </div>
                {!s.isCurrent && (
                  <button onClick={() => setRevokeTarget(s)} className="shrink-0 px-3 py-1.5 bg-[#FF5A4F]/10 hover:bg-[#FF5A4F]/20 border border-[#FF5A4F]/25 rounded-[12px] text-[10px] font-medium uppercase tracking-wider font-semibold text-[#FF5A4F] transition-all cursor-pointer">
                    Revoke
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Revoke confirm */}
      {revokeTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setRevokeTarget(null)} />
          <div className="relative w-full max-w-sm bg-[#18191C] border border-[#202126] rounded-[16px] shadow-2xl shadow-black/50 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#202126]">
              <h2 className="text-sm font-bold text-[#FFFFFF]">Revoke this session?</h2>
              <button onClick={() => setRevokeTarget(null)} className="p-2 rounded-[12px] hover:bg-[#25262B] text-[#8A8D96] hover:text-[#FFFFFF] transition-all cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <div className="px-6 py-5 space-y-3">
              <div className="p-3.5 rounded-[12px] bg-[#18191C] border border-[#202126] space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#8A8D96] font-medium uppercase tracking-wider">Device</span>
                  <span className="text-[#FFFFFF]/80">{parseDevice(revokeTarget.userAgent).label} ({revokeTarget.ipAddress})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8A8D96] font-medium uppercase tracking-wider">Created</span>
                  <span className="text-[#FFFFFF]/80 font-medium uppercase tracking-wider">{new Date(revokeTarget.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <p className="text-xs text-[#8A8D96]">This device will be logged out immediately.</p>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#202126]">
              <button onClick={() => setRevokeTarget(null)} className="px-4 py-2 bg-[#18191C] hover:bg-[#25262B] border border-[#202126] rounded-[12px] text-xs font-semibold text-[#8A8D96] hover:text-[#FFFFFF] transition-all cursor-pointer">Cancel</button>
              <button onClick={() => revoke(revokeTarget.id)} className="px-4 py-2 bg-[#FF5A4F]/10 hover:bg-[#FF5A4F]/20 border border-[#FF5A4F]/25 rounded-[12px] text-xs font-semibold text-[#FF5A4F] transition-all cursor-pointer">Revoke</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
