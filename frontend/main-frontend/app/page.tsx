"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useWorkspace } from "@/lib/workspace-context"

export default function RootPage() {
  const { isAuthenticated, isLoading, user } = useAuth()
  const { workspaceId } = useWorkspace()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return
    if (!isAuthenticated) {
      router.replace("/signin")
      return
    }
    const resolvedId = workspaceId ?? user?.workspaces?.[0]?.id
    router.replace(resolvedId ? `/home/${resolvedId}` : "/home")
  }, [isAuthenticated, isLoading, user, workspaceId, router])

  return null
}
