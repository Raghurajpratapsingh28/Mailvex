"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"
import { motion } from "framer-motion"
import { useAuth } from "@/lib/auth-context"
import { useWorkspace } from "@/lib/workspace-context"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import ShowcaseSidebar from "./showcase-sidebar"

export default function SigninView() {
  const { login, isAuthenticated, isLoading, user } = useAuth()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get("redirect") || undefined
  const { workspaceId } = useWorkspace()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      const resolvedId = workspaceId ?? user.workspaces?.[0]?.id
      router.replace(resolvedId ? `/home/${resolvedId}` : "/home")
    }
  }, [isAuthenticated, isLoading, user, workspaceId, router])
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setIsSubmitting(true)
    try {
      await login(formData, redirectTo)
      toast.success("Signed in successfully!")
    } catch (error: any) {
      const message = error.message || "Sign in failed. Please try again."
      toast.error(message)

      if (error.code === "INVALID_CREDENTIALS") {
        setErrors({ email: "Invalid email or password" })
      } else if (error.code === "ACCOUNT_LOCKED") {
        setErrors({ email: "Account locked due to too many failed attempts" })
      } else if (error.code === "ACCOUNT_DISABLED") {
        setErrors({ email: "Account has been disabled" })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <main className="min-h-screen w-full flex flex-col md:flex-row bg-black font-sans selection:bg-[#fabc09]/20 text-white overflow-x-hidden p-3 sm:p-4">
      
      {/* Left Panel: Shared Showcase Sidebar */}
      <ShowcaseSidebar />

      {/* Right Panel: Form Panel */}
      <div className="flex-1 flex flex-col justify-center items-center py-10 px-4 sm:px-6 md:px-12 lg:px-16 relative z-20 min-h-[calc(100vh-2rem)] bg-black">
        
        {/* Sign In Form Container */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.6 }}
          className="w-full max-w-[400px] flex flex-col justify-center my-auto"
        >

          <div className="text-center md:text-left mb-8">
            <h1 className="text-3xl sm:text-4xl font-semibold text-white mb-2 tracking-tight">
              Login
            </h1>
            <p className="text-sm text-neutral-400">
              Enter your credentials to access your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-neutral-300">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="aimerpaix@gmail.com"
                className={`w-full px-4 py-3 bg-[#121212] border ${errors.email ? 'border-red-500/55 focus:ring-red-500/20' : 'border-neutral-800 focus:ring-[#fabc09]/20'} rounded-xl text-sm text-white placeholder-neutral-600 focus:outline-none focus:ring-4 focus:border-[#fabc09] transition-all font-normal`}
                required
              />
              {errors.email && <p className="text-xs text-red-500 pl-1">{errors.email}</p>}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="text-sm font-medium text-neutral-300">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="........"
                  className={`w-full px-4 py-3 bg-[#121212] border ${errors.password ? 'border-red-500/55 focus:ring-red-500/20' : 'border-neutral-800 focus:ring-[#fabc09]/20'} rounded-xl text-sm text-white placeholder-neutral-600 focus:outline-none focus:ring-4 focus:border-[#fabc09] transition-all font-normal pr-12`}
                  required
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 stroke-[1.5]" />
                  ) : (
                    <Eye className="w-4 h-4 stroke-[1.5]" />
                  )}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 pl-1">{errors.password}</p>}
            </div>

            {/* Remember me & Forgot Password */}
            <div className="flex items-center justify-between pl-0.5">
              <label className="flex items-center gap-2.5 cursor-pointer group select-none">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  name="rememberMe"
                />
                <div className="w-[18px] h-[18px] rounded border border-neutral-700 bg-[#121212] peer-checked:bg-[#fabc09] peer-checked:border-[#fabc09] flex items-center justify-center transition-all group-hover:border-neutral-500">
                  <svg className="w-3 h-3 text-black opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span className="text-sm font-normal text-neutral-400 select-none">Remember me</span>
              </label>

              <Link href="/forgot-password" className="text-sm font-normal text-neutral-400 hover:text-[#fabc09] transition-colors">
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-[#fabc09] hover:bg-[#e2a806] active:scale-[0.99] text-black font-semibold rounded-xl text-sm tracking-wide transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Logging in...</span>
                </>
              ) : (
                "Login"
              )}
            </button>

            {/* Link to Sign Up */}
            <div className="text-center text-sm text-neutral-400 mt-6">
              Not a member?
              <Link href="/signup" className="text-[#fabc09] font-semibold hover:underline ml-1">
                Create an account
              </Link>
            </div>
          </form>
        </motion.div>
      </div>

    </main>
  )
}
