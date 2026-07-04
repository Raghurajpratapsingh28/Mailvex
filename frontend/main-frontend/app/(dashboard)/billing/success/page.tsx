"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

export default function BillingSuccessPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [countdown, setCountdown] = useState(5)
  const redirected = useRef(false)

  const getSlug = () => user?.workspaces?.[0]?.slug

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((c) => {
        const next = c - 1
        if (next <= 0 && !redirected.current) {
          redirected.current = true
          clearInterval(timer)
        }
        return next
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Navigate outside of setState
  useEffect(() => {
    if (countdown <= 0 && redirected.current) {
      const slug = getSlug()
      router.push(slug ? `/billing/${slug}` : "/billing")
    }
  }, [countdown])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center">
      <div className="p-5 rounded-full bg-[#3CD3AD]/10 border border-[#3CD3AD]/25">
        <CheckCircle2 className="w-12 h-12 text-[#3CD3AD]" />
      </div>
      <div>
        <h1 className="text-2xl font-bold text-white">Payment Successful!</h1>
        <p className="text-sm text-[#8A8D96] mt-2">Your plan has been activated. Redirecting in {Math.max(countdown, 0)}s…</p>
      </div>
      <button
        onClick={() => {
          const slug = getSlug()
          router.push(slug ? `/billing/${slug}` : "/billing")
        }}
        className="px-5 py-2.5 bg-[#696CFF] hover:bg-[#5A5CE6] text-white rounded-[12px] text-sm font-semibold transition-all cursor-pointer"
      >
        Go to Billing
      </button>
    </div>
  )
}
