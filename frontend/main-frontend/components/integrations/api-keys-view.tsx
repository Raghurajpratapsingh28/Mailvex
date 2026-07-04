"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  KeyRound, Plus, Copy, Check, Trash2, Loader2,
  Eye, EyeOff, ShieldCheck, X, ChevronLeft, AlertTriangle,
  Clock, Terminal, RefreshCw,
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useShortcut } from "@/lib/keyboard-shortcuts"
import { apiKeysService, type ApiKey } from "@/lib/api-keys-service"
import { workspaceService, type Workspace } from "@/lib/workspace-service"
import { useRouter } from "next/navigation"

interface Props {
  workspaceId: string
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const s = Math.floor(diff / 1000)
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

// ─── Create Key Dialog ────────────────────────────────────────────────────────
function CreateKeyDialog({
  workspaceId,
  onClose,
  onCreated,
}: {
  workspaceId: string
  onClose: () => void
  onCreated: (key: ApiKey, plaintext: string) => void
}) {
  const [name, setName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!name.trim()) return
    setIsLoading(true)
    setError("")
    try {
      const res = await apiKeysService.create(workspaceId, { name: name.trim() })
      onCreated(res.apiKey, res.key)
    } catch (err: any) {
      setError(err?.message ?? "Failed to create API key")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ duration: 0.18 }}
        className="relative w-full max-w-md bg-[#18191C] border border-[#202126] rounded-2xl p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#696CFF]/10 border border-[#696CFF]/25 flex items-center justify-center">
              <KeyRound className="w-4 h-4 text-[#696CFF]" />
            </div>
            <h2 className="text-base font-bold text-[#FFFFFF]">New API Key</h2>
          </div>
          <button onClick={onClose} className="text-[#8A8D96] hover:text-[#FFFFFF] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#8A8D96] mb-1.5">Key Name</label>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Production Backend, Staging App"
              className="w-full bg-[#0D0E12] border border-[#202126] rounded-xl px-3.5 py-2.5 text-sm text-[#FFFFFF] placeholder:text-[#8A8D96] focus:outline-none focus:border-[#696CFF]/50 focus:bg-[#0D0E12] transition-colors"
              maxLength={200}
            />
          </div>

          <div className="p-3 rounded-xl bg-[#696CFF]/5 border border-[#696CFF]/15">
            <div className="flex items-start gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-[#696CFF] mt-0.5 shrink-0" />
              <p className="text-[11px] text-[#8A8D96] leading-relaxed">
                The full key is shown <strong className="text-[#FFFFFF]">once</strong> after creation. Copy it immediately — it cannot be retrieved again.
              </p>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
              <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
              <p className="text-xs text-red-400">{error}</p>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-[#202126] rounded-xl text-xs font-semibold text-[#8A8D96] hover:border-[#696CFF] hover:text-[#FFFFFF] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || isLoading}
              className="flex-1 py-2.5 bg-[#696CFF] hover:bg-[#5A5CE6] disabled:bg-[#696CFF]/40 disabled:cursor-not-allowed rounded-xl text-xs font-semibold text-[#FFFFFF] transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              Generate Key
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

// ─── Key Reveal Dialog ────────────────────────────────────────────────────────
function KeyRevealDialog({
  apiKey,
  plaintext,
  onClose,
}: {
  apiKey: ApiKey
  plaintext: string
  onClose: () => void
}) {
  const [copied, setCopied] = useState(false)
  const [visible, setVisible] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(plaintext)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ duration: 0.18 }}
        className="relative w-full max-w-lg bg-[#18191C] border border-[#202126] rounded-2xl p-6 shadow-2xl"
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#FFFFFF]">API Key Created</h2>
            <p className="text-[11px] text-[#8A8D96]">{apiKey.name}</p>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-amber-500/8 border border-amber-500/20 mb-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
            <p className="text-[11px] text-amber-300/90 leading-relaxed">
              Copy your key now. This is the only time it will be displayed.
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-[#0D0E12] border border-[#202126] overflow-hidden mb-4">
          <div className="flex items-center justify-between px-3.5 py-2 border-b border-[#202126]">
            <span className="text-[10px] font-mono text-[#8A8D96]">API KEY</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setVisible((v) => !v)}
                className="text-[#8A8D96] hover:text-[#8A8D96] transition-colors"
              >
                {visible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={copy}
                className="flex items-center gap-1.5 text-[10px] font-mono text-[#696CFF] hover:text-[#5A5CE6] transition-colors"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
          <div className="px-3.5 py-3 overflow-x-auto">
            <code className="text-sm font-mono text-emerald-300 whitespace-nowrap">
              {visible ? plaintext : `${plaintext.slice(0, 12)}${"•".repeat(Math.max(0, plaintext.length - 12))}`}
            </code>
          </div>
        </div>

        <div className="rounded-xl bg-[#0D0E12] border border-[#202126] p-3.5 mb-4">
          <p className="text-[10px] font-mono text-[#8A8D96] mb-2">QUICK START</p>
          <pre className="text-[11px] font-mono text-[#8A8D96] whitespace-pre-wrap leading-relaxed">{`import { Mailvex } from "@Mailvex/node"

const client = new Mailvex({
  apiKey: "${plaintext.slice(0, 16)}...",
  workspaceId: "${apiKey.workspaceId}",
})`}</pre>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-[#25262B] hover:bg-[#383E58] rounded-xl text-xs font-semibold text-[#FFFFFF] transition-colors"
        >
          Done — I've saved my key
        </button>
      </motion.div>
    </div>
  )
}

// ─── Revoke Confirm Dialog ────────────────────────────────────────────────────
function RevokeDialog({
  apiKey,
  onConfirm,
  onClose,
  isLoading,
}: {
  apiKey: ApiKey
  onConfirm: () => void
  onClose: () => void
  isLoading: boolean
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ duration: 0.18 }}
        className="relative w-full max-w-sm bg-[#18191C] border border-[#202126] rounded-2xl p-6 shadow-2xl"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/25 flex items-center justify-center">
            <Trash2 className="w-4 h-4 text-red-400" />
          </div>
          <h2 className="text-base font-bold text-[#FFFFFF]">Revoke Key</h2>
        </div>
        <p className="text-sm text-[#8A8D96] mb-1">
          Are you sure you want to revoke{" "}
          <span className="text-[#FFFFFF] font-semibold">{apiKey.name}</span>?
        </p>
        <p className="text-xs text-[#8A8D96] mb-5">
          Any apps using <code className="font-mono text-[#8A8D96]">{apiKey.keyPrefix}…</code> will immediately lose access.
        </p>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-[#202126] rounded-xl text-xs font-semibold text-[#8A8D96] hover:border-[#696CFF] hover:text-[#FFFFFF] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 py-2.5 bg-red-600/90 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-xs font-semibold text-[#FFFFFF] transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            Revoke
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// ─── Main View ────────────────────────────────────────────────────────────────
export default function ApiKeysView({ workspaceId }: Props) {
  const router = useRouter()
  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const [showCreate, setShowCreate] = useState(false)
  const [newKey, setNewKey] = useState<{ apiKey: ApiKey; plaintext: string } | null>(null)
  useShortcut("n", () => setShowCreate(true))
  const [revoking, setRevoking] = useState<ApiKey | null>(null)
  const [isRevoking, setIsRevoking] = useState(false)

  const [copiedId, setCopiedId] = useState<string | null>(null)

  const load = useCallback(async (quiet = false) => {
    if (!quiet) setIsLoading(true)
    else setIsRefreshing(true)
    try {
      const [wsRes, keysRes] = await Promise.all([
        workspaceService.getCurrentWorkspace(workspaceId),
        apiKeysService.list(workspaceId, { pageSize: 100 }),
      ])
      setWorkspace(wsRes.workspace)
      setKeys(keysRes.items)
      setTotal(keysRes.total)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [workspaceId])

  useEffect(() => { load() }, [load])

  const handleCreated = (apiKey: ApiKey, plaintext: string) => {
    setShowCreate(false)
    setNewKey({ apiKey, plaintext })
    setKeys((prev) => [apiKey, ...prev])
    setTotal((t) => t + 1)
  }

  const handleRevoke = async () => {
    if (!revoking) return
    setIsRevoking(true)
    try {
      await apiKeysService.revoke(workspaceId, revoking.id)
      setKeys((prev) => prev.filter((k) => k.id !== revoking.id))
      setTotal((t) => t - 1)
      setRevoking(null)
    } catch (err) {
      console.error(err)
    } finally {
      setIsRevoking(false)
    }
  }

  const copyPrefix = async (prefix: string, id: string) => {
    await navigator.clipboard.writeText(prefix)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  if (isLoading) {
    return <ApiKeysViewSkeleton />
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-6 max-w-[1200px] mx-auto select-none"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <button
              onClick={() => router.push("/integrations")}
              className="flex items-center gap-1.5 text-[11px] text-[#8A8D96] hover:text-[#8A8D96] transition-colors mb-2 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Integrations
            </button>
            <span className="text-[10px] text-[#8A8D96] font-mono uppercase tracking-wider">
              API Keys
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#FFFFFF] mt-1">
              {workspace?.name ?? workspaceId}
            </h1>
            <p className="text-xs text-[#8A8D96] mt-1">
              {total} key{total !== 1 ? "s" : ""} · use these to authenticate SDK calls from your backend
            </p>
          </div>
          <div className="flex items-center gap-2 mt-8">
            <button
              onClick={() => load(true)}
              disabled={isRefreshing}
              className="p-2 border border-[#202126] rounded-xl text-[#8A8D96] hover:text-[#FFFFFF] hover:border-[#696CFF] transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#696CFF] hover:bg-[#5A5CE6] rounded-xl text-xs font-semibold text-[#FFFFFF] transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              New API Key
            </button>
          </div>
        </div>

        {/* Info banner */}
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-[#696CFF]/5 border border-[#696CFF]/15">
          <Terminal className="w-4 h-4 text-[#696CFF] shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-[#FFFFFF] mb-0.5">SDK Integration</p>
            <p className="text-[11px] text-[#8A8D96] leading-relaxed">
              Use these keys with{" "}
              <code className="font-mono text-[#696CFF] text-[10px]">@Mailvex/node</code> or any HTTP client.
              Pass as <code className="font-mono text-[#696CFF] text-[10px]">Authorization: Bearer &lt;key&gt;</code> with
              <code className="font-mono text-[#696CFF] text-[10px]"> x-workspace-id: {workspaceId.slice(0, 8)}…</code>
            </p>
          </div>
        </div>

        {/* Keys list */}
        {keys.length === 0 ? (
          <div className="p-14 rounded-3xl bg-[#18191C] border border-[#202126] flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#696CFF]/10 border border-[#696CFF]/25 flex items-center justify-center mb-4">
              <KeyRound className="w-6 h-6 text-[#696CFF]" />
            </div>
            <h3 className="text-sm font-semibold text-[#FFFFFF]">No API Keys</h3>
            <p className="text-xs text-[#8A8D96] mt-1.5 max-w-[280px] leading-relaxed">
              Generate a key to start authenticating your backend apps with Mailvex.
            </p>
            <button
              onClick={() => setShowCreate(true)}
              className="mt-5 flex items-center gap-2 px-4 py-2 bg-[#696CFF] hover:bg-[#5A5CE6] rounded-xl text-xs font-semibold text-[#FFFFFF] transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Generate First Key
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {keys.map((k, i) => (
              <motion.div
                key={k.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="p-5 bg-[#18191C] border border-[#202126] rounded-2xl hover:border-[#696CFF] transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-[#696CFF]/10 border border-[#696CFF]/20 flex items-center justify-center shrink-0 mt-0.5">
                      <KeyRound className="w-4 h-4 text-[#696CFF]" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-[#FFFFFF]">{k.name}</span>
                        {k.isActive ? (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                            active
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-md bg-red-500/10 border border-red-500/20 text-red-400">
                            revoked
                          </span>
                        )}
                      </div>

                      {/* Key prefix + scopes */}
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <button
                          onClick={() => copyPrefix(k.keyPrefix, k.id)}
                          className="flex items-center gap-1.5 font-mono text-[11px] text-[#8A8D96] hover:text-[#8A8D96] transition-colors"
                        >
                          <code>{k.keyPrefix}{"•".repeat(8)}</code>
                          {copiedId === k.id
                            ? <Check className="w-3 h-3 text-emerald-400" />
                            : <Copy className="w-3 h-3" />
                          }
                        </button>
                        {k.scope.split(",").map((s) => (
                          <span key={s} className="text-[9px] font-mono px-1.5 py-0.5 rounded-md bg-[#25262B] text-[#8A8D96]">
                            {s.trim()}
                          </span>
                        ))}
                      </div>

                      {/* Meta */}
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-[10px] text-[#8A8D96]">
                          Created {formatDate(k.createdAt)}
                        </span>
                        {k.lastUsedAt ? (
                          <span className="flex items-center gap-1 text-[10px] text-[#8A8D96]">
                            <Clock className="w-3 h-3" />
                            Last used {timeAgo(k.lastUsedAt)}
                          </span>
                        ) : (
                          <span className="text-[10px] text-[#8A8D96]">Never used</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {k.isActive && (
                    <button
                      onClick={() => setRevoking(k)}
                      className="shrink-0 p-2 rounded-lg text-[#8A8D96] hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
                      title="Revoke key"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Security note */}
        <div className="p-4 rounded-2xl bg-[#18191C] border border-[#202126]">
          <p className="text-[10px] font-mono text-[#8A8D96] mb-1.5 uppercase tracking-wider">Security</p>
          <ul className="space-y-1">
            {[
              "Keys are hashed with SHA-256 — the plaintext is never stored.",
              "Revoked keys are rejected immediately with no grace period.",
              "Rotate keys regularly. Create a new key before revoking the old one.",
              "Never expose API keys in browser code or public repositories.",
            ].map((tip) => (
              <li key={tip} className="flex items-start gap-2 text-[11px] text-[#8A8D96]">
                <ShieldCheck className="w-3 h-3 text-[#374151] shrink-0 mt-0.5" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </motion.div>

      {/* Dialogs */}
      <AnimatePresence>
        {showCreate && (
          <CreateKeyDialog
            workspaceId={workspaceId}
            onClose={() => setShowCreate(false)}
            onCreated={handleCreated}
          />
        )}
        {newKey && (
          <KeyRevealDialog
            apiKey={newKey.apiKey}
            plaintext={newKey.plaintext}
            onClose={() => setNewKey(null)}
          />
        )}
        {revoking && (
          <RevokeDialog
            apiKey={revoking}
            onConfirm={handleRevoke}
            onClose={() => setRevoking(null)}
            isLoading={isRevoking}
          />
        )}
      </AnimatePresence>
    </>
  )
}

function ApiKeysViewSkeleton() {
  return (
    <div className="space-y-6 max-w-[1200px] mx-auto select-none animate-in fade-in duration-300">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-2.5 w-20" />
          <Skeleton className="h-2 w-16" />
          <Skeleton className="h-8 w-48 mt-1" />
          <Skeleton className="h-2.5 w-56" />
        </div>
        <div className="flex items-center gap-2 mt-8">
          <Skeleton className="h-8 w-8 rounded-xl" />
          <Skeleton className="h-8 w-28 rounded-xl" />
        </div>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
        <Skeleton className="h-4 w-4 rounded shrink-0 mt-0.5" />
        <div className="space-y-1.5 flex-1">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-2.5 w-full" />
          <Skeleton className="h-2.5 w-3/4" />
        </div>
      </div>

      {/* Key cards */}
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-5 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3.5 min-w-0 flex-1">
                <Skeleton className="h-9 w-9 rounded-xl shrink-0" />
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-3.5 w-32" />
                    <Skeleton className="h-4 w-12 rounded-md" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-3 w-40" />
                    <Skeleton className="h-4 w-16 rounded-md" />
                    <Skeleton className="h-4 w-14 rounded-md" />
                  </div>
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-2.5 w-28" />
                    <Skeleton className="h-2.5 w-24" />
                  </div>
                </div>
              </div>
              <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
            </div>
          </div>
        ))}
      </div>

      {/* Security note */}
      <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-3">
        <Skeleton className="h-2.5 w-20" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-start gap-2">
            <Skeleton className="h-3 w-3 rounded shrink-0 mt-0.5" />
            <Skeleton className="h-2.5 flex-1" style={{ maxWidth: `${75 + i * 5}%` }} />
          </div>
        ))}
      </div>
    </div>
  )
}
