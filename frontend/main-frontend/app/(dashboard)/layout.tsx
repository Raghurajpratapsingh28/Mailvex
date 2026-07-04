"use client"

import { useEffect, Suspense } from "react"
import { useRouter, usePathname } from "next/navigation"
import Sidebar from "@/components/dashboard/sidebar"
import Header from "@/components/dashboard/header"
import NavigationProgress from "@/components/dashboard/navigation-progress"
import { useAuth } from "@/lib/auth-context"
import { useWorkspace } from "@/lib/workspace-context"
import { KeyboardShortcutsProvider } from "@/lib/keyboard-shortcuts"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, isLoading } = useAuth()
  const { workspaceId } = useWorkspace()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/signin')
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    if (!isLoading && isAuthenticated && !workspaceId && !pathname.startsWith('/home') && pathname !== '/account' && pathname !== '/settings') {
      router.push('/home')
    }
  }, [workspaceId, isLoading, isAuthenticated, pathname, router])

  if (isLoading) {
    return <div className="flex items-center justify-center w-screen h-screen bg-[#0D0E12] text-[#FFFFFF]">Loading...</div>
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <KeyboardShortcutsProvider>
      <div className="flex w-screen h-screen overflow-hidden bg-[#0D0E12] text-[#FFFFFF] p-3 gap-6">
        <Suspense fallback={null}><NavigationProgress /></Suspense>
        <Sidebar />
        <div className="flex flex-col flex-1 h-full min-w-0">
          <Header />
          <main className="flex-1 overflow-y-auto bg-transparent pt-0 pr-3">
            {children}
          </main>
        </div>
      </div>
    </KeyboardShortcutsProvider>
  )
}
