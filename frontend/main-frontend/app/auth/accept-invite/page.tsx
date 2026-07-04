"use client"

import React, { Suspense, useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Eye, EyeOff, CheckCircle } from "lucide-react"
import { motion } from "framer-motion"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { authService } from "@/lib/auth-service"
import { toast } from "sonner"

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </main>
    }>
      <AcceptInviteContent />
    </Suspense>
  )
}

function AcceptInviteContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated, isLoading: authLoading, user, storeTokensAndUser } = useAuth()
  const [token, setToken] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const tokenParam = searchParams.get("token")
    if (tokenParam) {
      setToken(tokenParam)
    } else {
      setError("Invalid or missing invite token")
    }
  }, [searchParams])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const validatePassword = (pwd: string) => {
    if (pwd.length < 12) return "Password must be at least 12 characters"
    if (!/[A-Z]/.test(pwd)) return "Password must contain an uppercase letter"
    if (!/[a-z]/.test(pwd)) return "Password must contain a lowercase letter"
    if (!/[0-9]/.test(pwd)) return "Password must contain a number"
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) return "Password must contain a special character"
    return ""
  }

  // Existing authenticated user — accept directly
  const handleExistingUserAccept = async () => {
    setIsLoading(true)
    setError("")
    try {
      await authService.acceptInvite({ token })
      setIsSuccess(true)
      toast.success("Invite accepted successfully!")
      setTimeout(() => router.push("/home"), 2000)
    } catch (err: any) {
      setError(err.message || "Failed to accept invite")
      toast.error(err.message || "Failed to accept invite")
    } finally {
      setIsLoading(false)
    }
  }

  // New user — create account and store session
  const handleNewUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const passwordError = validatePassword(formData.password)
    if (passwordError) {
      setError(passwordError)
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await authService.acceptInvite({
        token,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
      })

      // Store tokens so the user is logged in immediately
      if (response.tokens?.accessToken) {
        await storeTokensAndUser(response.tokens)
      }

      setIsSuccess(true)
      toast.success("Account created and invite accepted!")
      setTimeout(() => router.push("/home"), 2000)
    } catch (err: any) {
      if (err.code === "INVITE_REQUIRES_LOGIN") {
        // Email already has an account — redirect to login with return URL
        toast.info("This email already has an account. Please sign in to accept.")
        router.push(`/signin?redirect=/auth/accept-invite?token=${encodeURIComponent(token)}`)
      } else {
        setError(err.message || "Failed to accept invite")
        toast.error(err.message || "Failed to accept invite")
      }
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
          <h1 className="text-3xl font-bold text-neutral-900 mb-4">Welcome to the Team!</h1>
          <p className="text-neutral-600 mb-8">
            You've successfully joined the workspace. Redirecting...
          </p>
        </motion.div>
      </main>
    )
  }

  // Wait for auth state before deciding which view to show
  if (authLoading) {
    return (
      <main className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </main>
    )
  }

  // Authenticated user — one-click accept
  if (isAuthenticated && user) {
    return (
      <main className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100 p-4">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-12 text-center"
        >
          <div className="flex items-center justify-center gap-2 mb-8">
            <Image src="/logo.svg" alt="Mailvex Logo" width={32} height={32} className="w-8 h-8" />
            <span className="text-2xl font-bold text-neutral-900">
              Engage<span className="text-orange-500">IQ</span>
            </span>
          </div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-4">Accept Workspace Invite</h1>
          <p className="text-neutral-600 mb-8">
            You're signed in as <strong>{user.email}</strong>. Click below to join the workspace.
          </p>
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}
          <button
            onClick={handleExistingUserAccept}
            disabled={isLoading || !token}
            className="w-full py-3.5 bg-gradient-to-r from-[#ff5e36] to-[#ff2a6d] hover:brightness-105 text-white font-semibold rounded-xl transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50"
          >
            {isLoading ? "Accepting..." : "Accept Invite"}
          </button>
          <p className="mt-6 text-sm text-neutral-500">
            Not you?{" "}
            <Link
              href={`/signin?redirect=/auth/accept-invite?token=${encodeURIComponent(token)}`}
              className="text-orange-500 hover:underline font-semibold"
            >
              Sign in with a different account
            </Link>
          </p>
        </motion.div>
      </main>
    )
  }

  // Unauthenticated — new user registration form
  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100 p-4">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 sm:p-12"
      >
        <div className="flex items-center gap-2 mb-8">
          <Image src="/logo.svg" alt="Mailvex Logo" width={32} height={32} className="w-8 h-8" />
          <span className="text-2xl font-bold text-neutral-900">
            Engage<span className="text-orange-500">IQ</span>
          </span>
        </div>

        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Join Workspace</h1>
        <p className="text-neutral-600 mb-8">
          You've been invited to join a workspace. Create your account to get started.
        </p>

        {!token && error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleNewUserSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="firstName" className="text-sm font-semibold text-neutral-700">
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="John"
              className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="lastName" className="text-sm font-semibold text-neutral-700">
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Doe"
              className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-semibold text-neutral-700">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
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

          {token && error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !token}
            className="w-full py-3.5 bg-gradient-to-r from-[#ff5e36] to-[#ff2a6d] hover:brightness-105 text-white font-semibold rounded-xl transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Accepting..." : "Accept Invite & Create Account"}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-neutral-600">
          Already have an account?{" "}
          <Link
            href={`/signin?redirect=/auth/accept-invite?token=${encodeURIComponent(token)}`}
            className="text-orange-500 hover:underline font-semibold"
          >
            Sign In
          </Link>
        </div>
      </motion.div>
    </main>
  )
}
