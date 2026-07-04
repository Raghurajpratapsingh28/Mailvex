"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname, useSearchParams } from "next/navigation"

export default function NavigationProgress() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const completeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prevUrl = useRef(`${pathname}${searchParams}`)

  // Detect navigation start from any link/button click that will change the route
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a[href], button")
      if (!target) return
      const href = (target as HTMLAnchorElement).href
      // Only trigger for same-origin internal navigation
      if (!href || !href.startsWith(window.location.origin)) return
      const url = new URL(href)
      if (url.pathname === pathname) return // same page
      startProgress()
    }

    document.addEventListener("click", handleClick, true)
    return () => document.removeEventListener("click", handleClick, true)
  }, [pathname])

  // Detect navigation complete (pathname/searchParams changed)
  useEffect(() => {
    const currentUrl = `${pathname}${searchParams}`
    if (currentUrl !== prevUrl.current) {
      prevUrl.current = currentUrl
      completeProgress()
    }
  }, [pathname, searchParams])

  function startProgress() {
    if (timerRef.current) clearInterval(timerRef.current)
    if (completeTimerRef.current) clearTimeout(completeTimerRef.current)
    setProgress(0)
    setVisible(true)

    let p = 0
    timerRef.current = setInterval(() => {
      // Accelerate fast to 60%, then slow to 85%, never reach 100% until done
      p = p < 60 ? p + 8 : p < 85 ? p + 1.2 : p
      setProgress(Math.min(p, 85))
    }, 80)
  }

  function completeProgress() {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
    setProgress(100)
    completeTimerRef.current = setTimeout(() => {
      setVisible(false)
      setProgress(0)
    }, 300)
  }

  if (!visible) return null

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9999] h-[2px] pointer-events-none"
      style={{ transition: "opacity 0.2s" }}
    >
      <div
        className="h-full bg-[#696CFF] shadow-[0_0_8px_#696CFF]"
        style={{
          width: `${progress}%`,
          transition: progress === 100 ? "width 0.15s ease-out" : "width 0.08s linear",
        }}
      />
    </div>
  )
}
