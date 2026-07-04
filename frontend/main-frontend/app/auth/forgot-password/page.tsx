"use client"

import React, { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"
import { motion } from "framer-motion"
import { authService } from "@/lib/auth-service"
import { toast } from "sonner"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setIsLoading(true)
    try {
      await authService.forgotPassword({ email })
      setIsSubmitted(true)
      toast.success("Password reset email sent!")
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset email")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100 p-4">
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 sm:p-12"
      >
        <div className="flex items-center gap-2 mb-8">
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

        {!isSubmitted ? (
          <>
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">
              Forgot Password?
            </h1>
            <p className="text-neutral-600 mb-8">
              Enter your email address and we'll send you a link to reset your password.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-semibold text-neutral-700">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-gradient-to-r from-[#ff5e36] to-[#ff2a6d] hover:brightness-105 text-white font-semibold rounded-xl transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">Check Your Email</h2>
            <p className="text-neutral-600 mb-8">
              We've sent a password reset link to <strong>{email}</strong>
            </p>
            <p className="text-sm text-neutral-500">
              Didn't receive the email? Check your spam folder or{" "}
              <button 
                onClick={() => setIsSubmitted(false)}
                className="text-orange-500 hover:underline font-semibold"
              >
                try again
              </button>
            </p>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link 
            href="/signin" 
            className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Sign In
          </Link>
        </div>
      </motion.div>
    </main>
  )
}
