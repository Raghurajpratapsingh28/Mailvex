"use client"

import { useState } from "react"
import { X, Globe, Loader2 } from "lucide-react"
import { domainsService, type ApiDomain } from "@/lib/domains-service"
import DnsRecordsTable from "./dns-records-table"

interface Props {
  isOpen: boolean
  onClose: () => void
  workspaceId: string
  onAdded: (domain: ApiDomain) => void
}

export default function AddDomainModal({ isOpen, onClose, workspaceId, onAdded }: Props) {
  const [value, setValue] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [created, setCreated] = useState<ApiDomain | null>(null)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const domain = value.trim().toLowerCase().replace(/^www\./, "")
    if (!domain) { setError("Domain is required."); return }
    setIsLoading(true)
    try {
      const d = await domainsService.add(workspaceId, domain)
      setCreated(d)
    } catch (err: any) {
      setError(err.message || "Failed to add domain.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDone = () => {
    if (created) onAdded(created)
    setValue(""); setError(""); setCreated(null); onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={!created ? onClose : undefined} />
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col bg-[#0D0E12] border border-[#202126] rounded-[16px] shadow-2xl shadow-black/50 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#202126] shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-[12px] bg-[#3CD3AD]/10 border border-[#3CD3AD]/25">
              <Globe className="w-4 h-4 text-[#3CD3AD]" />
            </div>
            <div>
              <span className="text-[10px] text-[#8A8D96] font-medium uppercase tracking-wider">Sending Domain</span>
              <h2 className="text-sm font-bold text-[#FFFFFF] mt-0.5">{created ? `${created.domain} — Publish DNS Records` : "Add Domain"}</h2>
            </div>
          </div>
          {!created && <button onClick={onClose} className="p-2 rounded-[12px] hover:bg-[#25262B] text-[#8A8D96] hover:text-[#FFFFFF] transition-all cursor-pointer"><X className="w-4 h-4" /></button>}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {!created ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#FFFFFF] tracking-tight">Domain <span className="text-[#FF5A4F]">*</span></label>
                <input type="text" value={value} onChange={(e) => { setValue(e.target.value); setError("") }} placeholder="acme.com" autoFocus className="w-full px-3.5 py-2.5 bg-[#18191C] border border-[#202126] hover:border-[#8A8D96] focus:border-[#3CD3AD] rounded-[12px] text-sm text-[#FFFFFF] font-mono placeholder-[#8A8D96] focus:outline-none transition-colors" />
                {error && <p className="text-[10px] text-[#FF5A4F] font-mono">{error}</p>}
              </div>
              <div className="p-3.5 rounded-[12px] bg-[#18191C] border border-[#202126] space-y-1 text-[10px] text-[#8A8D96] font-mono">
                <p className="text-[#FFFFFF] font-semibold mb-1.5">Rules:</p>
                <p>• Lowercase, at least one dot (e.g. acme.com)</p>
                <p>• No localhost, IPs, or reserved TLDs (.test, .local)</p>
                <p>• Leading www. is stripped automatically</p>
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-[#18191C] hover:bg-[#25262B] border border-[#202126] rounded-[12px] text-xs font-semibold text-[#8A8D96] hover:text-[#FFFFFF] transition-all cursor-pointer">Cancel</button>
                <button type="submit" disabled={isLoading} className="flex items-center gap-1.5 px-4 py-2 bg-[#696CFF] hover:bg-[#5A5CE6] disabled:opacity-50 text-[#FFFFFF] font-bold rounded-[12px] text-xs transition-all cursor-pointer">
                  {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Add Domain
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-5">
              <div className="p-4 rounded-[12px] bg-[#696CFF]/5 border border-[#696CFF]/20 text-xs text-[#696CFF] leading-relaxed">
                Domain <span className="font-mono font-bold">{created.domain}</span> has been added. Publish the DNS records below in your DNS provider, then verification will begin automatically. It may take up to 72 hours.
              </div>
              <DnsRecordsTable dns={created.dns} />
            </div>
          )}
        </div>

        {created && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#202126] shrink-0">
            <button onClick={handleDone} className="px-4 py-2 bg-[#696CFF] hover:bg-[#5A5CE6] text-[#FFFFFF] font-bold rounded-[12px] text-xs transition-all cursor-pointer">
              View Domain Details →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
