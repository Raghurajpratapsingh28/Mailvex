"use client"

import React, { Suspense, useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Eye, EyeOff, CheckCircle } from "lucide-react"
import { motion } from "framer-motion"
import { useRouter, useSearchParams } from "next/navigation"
import { authService } from "@/lib/auth-service"
import { toast } from "sonner"

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </main>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
}

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [token, setToken] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const tokenParam = searchParams.get("token")
    if (tokenParam) {
      setToken(tokenParam)
    } else {
      setError("Invalid or missing reset token")
    }
  }, [searchParams])

  const validatePassword = (pwd: string) => {
    if (pwd.length < 12) return "Password must be at least 12 characters"
    if (!/[A-Z]/.test(pwd)) return "Password must contain uppercase letter"
    if (!/[a-z]/.test(pwd)) return "Password must contain lowercase letter"
    if (!/[0-9]/.test(pwd)) return "Password must contain a number"
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) return "Password must contain special character"
    return ""
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const passwordError = validatePassword(password)
    if (passwordError) {
      setError(passwordError)
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setIsLoading(true)
    setError("")
    
    try {
      await authService.resetPassword({ token, password })
      setIsSuccess(true)
      toast.success("Password reset successfully!")
      setTimeout(() => router.push("/signin"), 3000)
    } catch (error: any) {
      setError(error.message || "Failed to reset password")
      toast.error(error.message || "Failed to reset password")
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <main className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100 p-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-12 text-center"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-4">
            Password Reset Successful!
          </h1>
          <p className="text-neutral-600 mb-8">
            Your password has been reset. Redirecting to sign in...
          </p>
          <Link 
            href="/signin"
            className="inline-block px-6 py-3 bg-gradient-to-r from-[#ff5e36] to-[#ff2a6d] text-white font-semibold rounded-xl hover:brightness-105 transition-all"
          >
            Go to Sign In
          </Link>
        </motion.div>
      </main>
    )
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

        <h1 className="text-3xl font-bold text-neutral-900 mb-2">
          Reset Password
        </h1>
        <p className="text-neutral-600 mb-8">
          Enter your new password below.
        </p>

        {error && !token && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-semibold text-neutral-700">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 12 chars, uppercase, lowercase, number, special"
                className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-semibold text-neutral-700">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && token && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !token}
            className="w-full py-3.5 bg-gradient-to-r from-[#ff5e36] to-[#ff2a6d] hover:brightness-105 text-white font-semibold rounded-xl transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link 
            href="/signin" 
            className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            Back to Sign In
          </Link>
        </div>
      </motion.div>
    </main>
  )
}
