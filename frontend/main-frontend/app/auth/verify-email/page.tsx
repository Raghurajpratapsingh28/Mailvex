"use client"

import React, { Suspense, useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import { useRouter, useSearchParams } from "next/navigation"
import { authService } from "@/lib/auth-service"

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </main>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get("token")
      
      if (!token) {
        setStatus("error")
        setMessage("Invalid or missing verification token")
        return
      }

      try {
        await authService.verifyEmail({ token })
        setStatus("success")
        setMessage("Your email has been verified successfully!")
        setTimeout(() => router.push("/signin"), 3000)
      } catch (error: any) {
        setStatus("error")
        setMessage(error.message || "Failed to verify email. The link may have expired.")
      }
    }

    verifyEmail()
  }, [searchParams, router])

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100 p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-12 text-center"
      >
        <div className="flex items-center justify-center gap-2 mb-8">
          <Image 
            src="/logo.svg" 
            alt="Mailvex Logo" 
            width={32} 
            height={32}
            className="w-8 h-8"
          />
          <span className="text-2xl font-bold text-neutral-900">
            Engage<span className="text-orange-500">IQ</span>
          </span>
        </div>

        {status === "loading" && (
          <>
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            </div>
            <h1 className="text-3xl font-bold text-neutral-900 mb-4">
              Verifying Email...
            </h1>
            <p className="text-neutral-600">
              Please wait while we verify your email address.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-neutral-900 mb-4">
              Email Verified!
            </h1>
            <p className="text-neutral-600 mb-8">
              {message}
            </p>
            <p className="text-sm text-neutral-500">
              Redirecting to sign in...
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-neutral-900 mb-4">
              Verification Failed
            </h1>
            <p className="text-neutral-600 mb-8">
              {message}
            </p>
            <Link 
              href="/signin"
              className="inline-block px-6 py-3 bg-gradient-to-r from-[#ff5e36] to-[#ff2a6d] text-white font-semibold rounded-xl hover:brightness-105 transition-all"
            >
              Go to Sign In
            </Link>
          </>
        )}
      </motion.div>
    </main>
  )
}
