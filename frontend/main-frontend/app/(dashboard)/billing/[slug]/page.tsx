"use client"

import { use } from "react"
import BillingView from "@/components/billing/billing-view"

interface BillingWorkspacePageProps {
  params: Promise<{
    slug: string
  }>
}

export default function BillingWorkspacePage({ params }: BillingWorkspacePageProps) {
  const { slug } = use(params)
  return <BillingView workspaceSlug={slug} />
}