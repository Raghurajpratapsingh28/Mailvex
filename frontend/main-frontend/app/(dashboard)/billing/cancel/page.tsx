"use client"

import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { XCircle } from "lucide-react"

export default function BillingCancelPage() {
  const router = useRouter()
  const { user } = useAuth()

  const goBack = () => {
    const slug = user?.workspaces?.[0]?.slug
    router.push(slug ? `/billing/${slug}` : "/billing")
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center">
      <div className="p-5 rounded-full bg-[#FF5A4F]/10 border border-[#FF5A4F]/25">
        <XCircle className="w-12 h-12 text-[#FF5A4F]" />
      </div>
      <div>
        <h1 className="text-2xl font-bold text-white">Payment Cancelled</h1>
        <p className="text-sm text-[#8A8D96] mt-2">No charge was made. You can upgrade anytime.</p>
      </div>
      <button
        onClick={goBack}
        className="px-5 py-2.5 bg-[#18191C] hover:bg-[#25262B] border border-[#202126] hover:border-[#696CFF] text-[#8A8D96] hover:text-white rounded-[12px] text-sm font-semibold transition-all cursor-pointer"
      >
        Back to Billing
      </button>
    </div>
  )
}
