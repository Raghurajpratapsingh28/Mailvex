"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"
import { motion } from "framer-motion"
import { useAuth } from "@/lib/auth-context"
import { useWorkspace } from "@/lib/workspace-context"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import ShowcaseSidebar from "./showcase-sidebar"

export default function SignupView() {
  const { signup, isAuthenticated, isLoading, user } = useAuth()
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
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    workspaceName: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required"
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required"
    if (!formData.email.trim()) newErrors.email = "Email is required"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Invalid email format"
    if (!formData.workspaceName.trim()) newErrors.workspaceName = "Workspace name is required"
    
    if (!formData.password) newErrors.password = "Password is required"
    else if (formData.password.length < 12) newErrors.password = "Password must be at least 12 characters"
    else if (!/[A-Z]/.test(formData.password)) newErrors.password = "Password must contain uppercase letter"
    else if (!/[a-z]/.test(formData.password)) newErrors.password = "Password must contain lowercase letter"
    else if (!/[0-9]/.test(formData.password)) newErrors.password = "Password must contain a number"
    else if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) newErrors.password = "Password must contain special character"
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      await signup(formData)
      toast.success("Account created successfully!")
    } catch (error: any) {
      const message = error.message || "Signup failed. Please try again."
      toast.error(message)
      if (error.code === "EMAIL_TAKEN") {
        setErrors({ email: "Email already registered" })
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
        
        {/* Signup Form Container */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.6 }}
          className="w-full max-w-[400px] flex flex-col justify-center my-auto"
        >

          <div className="text-center md:text-left mb-8">
            <h1 className="text-3xl sm:text-4xl font-semibold text-white mb-2 tracking-tight">
              Sign Up
            </h1>
            <p className="text-sm text-neutral-400">
              Enter your details to create your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* First Name Field */}
            <div className="space-y-2">
              <label htmlFor="firstName" className="text-sm font-medium text-neutral-300">
                First name
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Amélie"
                className={`w-full px-4 py-3 bg-[#121212] border ${errors.firstName ? 'border-red-500/55 focus:ring-red-500/20' : 'border-neutral-800 focus:ring-[#fabc09]/20'} rounded-xl text-sm text-white placeholder-neutral-600 focus:outline-none focus:ring-4 focus:border-[#fabc09] transition-all font-normal`}
                required
              />
              {errors.firstName && <p className="text-xs text-red-500 pl-1">{errors.firstName}</p>}
            </div>

            {/* Last Name Field */}
            <div className="space-y-2">
              <label htmlFor="lastName" className="text-sm font-medium text-neutral-300">
                Last name
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Laurent"
                className={`w-full px-4 py-3 bg-[#121212] border ${errors.lastName ? 'border-red-500/55 focus:ring-red-500/20' : 'border-neutral-800 focus:ring-[#fabc09]/20'} rounded-xl text-sm text-white placeholder-neutral-600 focus:outline-none focus:ring-4 focus:border-[#fabc09] transition-all font-normal`}
                required
              />
              {errors.lastName && <p className="text-xs text-red-500 pl-1">{errors.lastName}</p>}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-neutral-300">
                Email address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="amelie.laurent@example.com"
                className={`w-full px-4 py-3 bg-[#121212] border ${errors.email ? 'border-red-500/55 focus:ring-red-500/20' : 'border-neutral-800 focus:ring-[#fabc09]/20'} rounded-xl text-sm text-white placeholder-neutral-600 focus:outline-none focus:ring-4 focus:border-[#fabc09] transition-all font-normal`}
                required
              />
              {errors.email && <p className="text-xs text-red-500 pl-1">{errors.email}</p>}
            </div>

            {/* Workspace Name Field */}
            <div className="space-y-2">
              <label htmlFor="workspaceName" className="text-sm font-medium text-neutral-300">
                Workspace name
              </label>
              <input
                type="text"
                id="workspaceName"
                name="workspaceName"
                value={formData.workspaceName}
                onChange={handleChange}
                placeholder="Acme Corp"
                className={`w-full px-4 py-3 bg-[#121212] border ${errors.workspaceName ? 'border-red-500/55 focus:ring-red-500/20' : 'border-neutral-800 focus:ring-[#fabc09]/20'} rounded-xl text-sm text-white placeholder-neutral-600 focus:outline-none focus:ring-4 focus:border-[#fabc09] transition-all font-normal`}
                required
              />
              {errors.workspaceName && <p className="text-xs text-red-500 pl-1">{errors.workspaceName}</p>}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-neutral-300">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min 12 characters, strong"
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

            {/* Terms and conditions notice */}
            <p className="text-xs text-neutral-500 leading-relaxed font-light pl-0.5">
              By signing up, you agree to our{" "}
              <Link href="/terms" className="text-[#fabc09] hover:underline font-medium">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-[#fabc09] hover:underline font-medium">
                Privacy Policy
              </Link>
              .
            </p>

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
                  <span>Creating Account...</span>
                </>
              ) : (
                "Create Account"
              )}
            </button>

            {/* Link to Login */}
            <div className="text-center text-sm text-neutral-400 mt-6">
              Already a member?
              <Link href="/signin" className="text-[#fabc09] font-semibold hover:underline ml-1">
                Login
              </Link>
            </div>
          </form>
        </motion.div>
      </div>

    </main>
  )
}
