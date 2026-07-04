"use client"

import { createContext, useContext, useEffect, useRef, useState, useCallback, ReactNode } from "react"
import { useRouter } from "next/navigation"
import { useWorkspace } from "./workspace-context"

type ShortcutHandler = () => void

interface KeyboardShortcutsContext {
  register: (key: string, handler: ShortcutHandler) => () => void
  unregister: (key: string) => void
}

const Ctx = createContext<KeyboardShortcutsContext | null>(null)

// Keys that should not trigger shortcuts when focused
const IGNORED_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT"])
const CHORD_TIMEOUT = 1000

export function KeyboardShortcutsProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const { workspaceId } = useWorkspace()
  const handlers = useRef<Map<string, ShortcutHandler>>(new Map())
  const chordRef = useRef<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToastMsg(null), 1800)
  }, [])

  const register = useCallback((key: string, handler: ShortcutHandler) => {
    handlers.current.set(key, handler)
    return () => handlers.current.delete(key)
  }, [])

  const unregister = useCallback((key: string) => {
    handlers.current.delete(key)
  }, [])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      // Skip if typing in an input, unless it's Escape
      if (IGNORED_TAGS.has(tag) && e.key !== "Escape") return
      // Skip if modifier combos other than the ones we handle
      if (e.altKey) return

      const key = e.key.toLowerCase()

      // ── Chord: G then H / G then C / G then S / G then F ──
      if (chordRef.current === "g") {
        if (timerRef.current) clearTimeout(timerRef.current)
        chordRef.current = null

        const dest: Record<string, { path: string; label: string }> = {
          h: { path: workspaceId ? `/home/${workspaceId}` : "/home", label: "Dashboard" },
          c: { path: workspaceId ? `/campaigns/${workspaceId}` : "/campaigns", label: "Campaigns" },
          s: { path: workspaceId ? `/segments/${workspaceId}` : "/segments", label: "Segments" },
          f: { path: workspaceId ? `/flow-builder/${workspaceId}` : "/flow-builder", label: "Flow Builder" },
          d: { path: workspaceId ? `/domains/${workspaceId}` : "/domains", label: "Domains" },
          i: { path: workspaceId ? `/integrations/${workspaceId}` : "/integrations", label: "Integrations" },
        }
        if (dest[key]) {
          e.preventDefault()
          showToast(`→ ${dest[key].label}`)
          router.push(dest[key].path)
        }
        return
      }

      // ── Start chord on G (no modifier) ──
      if (key === "g" && !e.metaKey && !e.ctrlKey && !e.shiftKey) {
        e.preventDefault()
        chordRef.current = "g"
        showToast("G →")
        if (timerRef.current) clearTimeout(timerRef.current)
        timerRef.current = setTimeout(() => {
          chordRef.current = null
          setToastMsg(null)
        }, CHORD_TIMEOUT)
        return
      }

      // ── N — context-aware "create new" ──
      if (key === "n" && !e.metaKey && !e.ctrlKey && !e.shiftKey) {
        const handler = handlers.current.get("n")
        if (handler) {
          e.preventDefault()
          handler()
        }
        return
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [router, workspaceId, showToast])

  return (
    <Ctx.Provider value={{ register, unregister }}>
      {children}
      {/* Shortcut toast */}
      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#18191C]/95 border border-white/[0.08] shadow-2xl backdrop-blur-xl">
            <kbd className="text-[11px] font-mono font-semibold text-white">{toastMsg}</kbd>
          </div>
        </div>
      )}
    </Ctx.Provider>
  )
}

export function useShortcut(key: string, handler: ShortcutHandler, enabled = true) {
  const ctx = useContext(Ctx)
  const handlerRef = useRef(handler)
  handlerRef.current = handler

  useEffect(() => {
    if (!ctx || !enabled) return
    const stable = () => handlerRef.current()
    return ctx.register(key, stable)
  }, [ctx, key, enabled])
}
