"use client"

import { useState, useEffect } from "react"
import { validatePassword } from "@/lib/account-data"
import { toast } from "@/lib/toast"
import { Eye, EyeOff, AlertTriangle, CheckCircle2, X, Monitor, Smartphone, Tablet } from "lucide-react"
import { authService, Session } from "@/lib/auth-service"
import { useAuth } from "@/lib/auth-context"
import { format } from "date-fns"

export default function SecurityTab() {
  const { logout } = useAuth()
  const [current, setCurrent] = useState("")
  const [newPw, setNewPw] = useState("")
  const [confirm, setConfirm] = useState("")
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [currentError, setCurrentError] = useState("")
  const [logoutAllOpen, setLogoutAllOpen] = useState(false)
  const [sessions, setSessions] = useState<Session[]>([])
  const [loadingSessions, setLoadingSessions] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadSessions()
  }, [])

  const loadSessions = async () => {
    try {
      const response = await authService.getSessions()
      setSessions(response.items)
    } catch (error) {
      console.error("Failed to load sessions:", error)
    } finally {
      setLoadingSessions(false)
    }
  }

  const handleRevokeSession = async (sessionId: string) => {
    try {
      await authService.deleteSession(sessionId)
      toast.success("Session revoked", "The device has been logged out.")
      loadSessions()
    } catch (error: any) {
      toast.error("Failed to revoke session", error.message)
    }
  }

  const handleLogoutAll = async () => {
    try {
      const response = await authService.logoutAll()
      toast.success("Logged out", `${response.revoked} sessions have been revoked.`)
      setLogoutAllOpen(false)
      await logout()
    } catch (error: any) {
      toast.error("Failed to logout", error.message)
    }
  }

  const getDeviceIcon = (userAgent: string) => {
    if (/mobile/i.test(userAgent)) return <Smartphone className="w-4 h-4" />
    if (/tablet/i.test(userAgent)) return <Tablet className="w-4 h-4" />
    return <Monitor className="w-4 h-4" />
  }

  const pwErrors = validatePassword(newPw)
  const mismatch = confirm.length > 0 && newPw !== confirm

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (pwErrors.length > 0 || mismatch) return
    if (!current) { setCurrentError("Current password is required."); return }
    
    setIsLoading(true)
    try {
      await authService.changePassword({ currentPassword: current, newPassword: newPw })
      setCurrent(""); setNewPw(""); setConfirm("")
      toast.success("Password updated", "All other sessions have been revoked.")
      loadSessions()
    } catch (error: any) {
      if (error.code === "INVALID_CREDENTIALS") {
        setCurrentError("Current password is incorrect")
      } else {
        toast.error("Failed to update password", error.message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8 max-w-xl">
      {/* Change Password */}
      <div className="space-y-4">
        <h3 className={sectionTitle}>Change Password</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <PwField label="Current Password *" value={current} onChange={(v) => { setCurrent(v); setCurrentError("") }} show={showCurrent} onToggle={() => setShowCurrent(!showCurrent)} error={currentError} />
          <div className="space-y-1.5">
            <PwField label="New Password *" value={newPw} onChange={setNewPw} show={showNew} onToggle={() => setShowNew(!showNew)} />
            {/* Strength indicators */}
            {newPw.length > 0 && (
              <div className="grid grid-cols-2 gap-1 mt-2">
                {[
                  { label: "≥12 characters", ok: newPw.length >= 12 },
                  { label: "Uppercase", ok: /[A-Z]/.test(newPw) },
                  { label: "Lowercase", ok: /[a-z]/.test(newPw) },
                  { label: "Digit", ok: /\d/.test(newPw) },
                  { label: "Special character", ok: /[^A-Za-z0-9]/.test(newPw) },
                ].map(({ label, ok }) => (
                  <div key={label} className={`flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-wider ${ok ? "text-[#3CD3AD]" : "text-[#8A8D96]"}`}>
                    {ok ? <CheckCircle2 className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    {label}
                  </div>
                ))}
              </div>
            )}
          </div>
          <PwField label="Confirm New Password *" value={confirm} onChange={setConfirm} show={showNew} onToggle={() => setShowNew(!showNew)} error={mismatch ? "Passwords do not match." : ""} />

          <div className="flex items-start gap-2 p-3 rounded-[12px] bg-[#FFB020]/10 border border-[#FFB020]/20">
            <AlertTriangle className="w-3.5 h-3.5 text-[#FFB020] shrink-0 mt-0.5" />
            <p className="text-[10px] text-[#FFB020]">All other sessions will be revoked after changing your password.</p>
          </div>

          <button type="submit" disabled={pwErrors.length > 0 || mismatch || !current || isLoading} className="px-5 py-2.5 bg-[#696CFF] hover:bg-[#5A5CE6] disabled:opacity-40 disabled:cursor-not-allowed text-[#FFFFFF] rounded-[12px] text-xs font-semibold shadow-lg shadow-[#696CFF]/15 transition-all cursor-pointer">
            {isLoading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>

      {/* Logout all */}
      <div className="space-y-3">
        <h3 className={sectionTitle}>Logout All Devices</h3>
        <div className="p-5 rounded-[12px] bg-[#18191C] border border-[#202126] flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-[#FFFFFF]/90">Logout from all devices</p>
            <p className="text-[10px] text-[#8A8D96] mt-0.5">Revokes all active sessions including this one. You will need to log in again.</p>
          </div>
          <button onClick={() => setLogoutAllOpen(true)} className="shrink-0 px-4 py-2 bg-[#FF5A4F]/10 hover:bg-[#FF5A4F]/20 border border-[#FF5A4F]/25 rounded-[12px] text-xs font-semibold text-[#FF5A4F] transition-all cursor-pointer">
            Logout All
          </button>
        </div>
      </div>

      {/* Active Sessions */}
      <div className="space-y-3">
        <h3 className={sectionTitle}>Active Sessions</h3>
        {loadingSessions ? (
          <div className="p-5 rounded-[12px] bg-[#18191C] border border-[#202126] text-center">
            <p className="text-xs text-[#8A8D96]">Loading sessions...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="p-5 rounded-[12px] bg-[#18191C] border border-[#202126] text-center">
            <p className="text-xs text-[#8A8D96]">No active sessions</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sessions.map((session) => (
              <div key={session.id} className="p-4 rounded-[12px] bg-[#18191C] border border-[#202126] flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="text-[#8A8D96] mt-0.5">
                    {getDeviceIcon(session.userAgent)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-semibold text-[#FFFFFF]/90">
                        {session.userAgent.split(' ')[0] || 'Unknown Device'}
                      </p>
                      {session.current && (
                        <span className="px-2 py-0.5 bg-[#3CD3AD]/10 border border-[#3CD3AD]/25 rounded-md text-[9px] font-semibold text-[#3CD3AD]">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-[#8A8D96] mt-0.5">
                      {session.ipAddress} • {format(new Date(session.createdAt), 'MMM d, yyyy h:mm a')}
                    </p>
                    <p className="text-[9px] text-[#8A8D96] mt-1">
                      Expires: {format(new Date(session.expiresAt), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
                {!session.current && (
                  <button 
                    onClick={() => handleRevokeSession(session.id)}
                    className="shrink-0 px-3 py-1.5 bg-[#FF5A4F]/10 hover:bg-[#FF5A4F]/20 border border-[#FF5A4F]/25 rounded-lg text-[10px] font-semibold text-[#FF5A4F] transition-all cursor-pointer"
                  >
                    Revoke
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Logout all confirm */}
      {logoutAllOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setLogoutAllOpen(false)} />
          <div className="relative w-full max-w-sm bg-[#18191C] border border-[#202126] rounded-[16px] shadow-2xl shadow-black/50 overflow-hidden">
            <div className="px-6 py-5 border-b border-[#202126]">
              <h2 className="text-sm font-bold text-[#FFFFFF]">Logout from all devices?</h2>
            </div>
            <div className="px-6 py-5">
              <p className="text-xs text-[#8A8D96] leading-relaxed">This will revoke all active sessions including this one. You will need to log in again.</p>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#202126]">
              <button onClick={() => setLogoutAllOpen(false)} className="px-4 py-2 bg-[#18191C] hover:bg-[#25262B] border border-[#202126] rounded-[12px] text-xs font-semibold text-[#8A8D96] hover:text-[#FFFFFF] transition-all cursor-pointer">Cancel</button>
              <button onClick={handleLogoutAll} className="px-4 py-2 bg-[#FF5A4F]/10 hover:bg-[#FF5A4F]/20 border border-[#FF5A4F]/25 rounded-[12px] text-xs font-semibold text-[#FF5A4F] transition-all cursor-pointer">Logout All</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function PwField({ label, value, onChange, show, onToggle, error }: {
  label: string; value: string; onChange: (v: string) => void
  show: boolean; onToggle: () => void; error?: string
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[9px] font-medium uppercase tracking-wider font-semibold text-[#8A8D96] uppercase tracking-wider block">{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-3.5 pr-10 py-2.5 bg-[#18191C] border border-[#202126] hover:border-[#696CFF] focus:border-[#696CFF] rounded-[12px] text-xs text-[#FFFFFF] placeholder-[#8A8D96] focus:outline-none transition-colors font-medium uppercase tracking-wider"
        />
        <button type="button" onClick={onToggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A8D96] hover:text-[#8A8D96] cursor-pointer">
          {show ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
        </button>
      </div>
      {error && <p className="text-[10px] text-[#FF5A4F] font-medium uppercase tracking-wider">{error}</p>}
    </div>
  )
}

const sectionTitle = "text-xs font-semibold text-[#FFFFFF]/80 tracking-tight border-b border-[#202126] pb-2"
