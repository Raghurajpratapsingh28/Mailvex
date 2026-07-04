import { apiClient } from './api-client'

export interface WorkspaceSummary {
  generatedAt: string
  campaigns: {
    total: number
    sent: number
    draft: number
    sending: number
    scheduled: number
    recent: Array<{
      id: string
      name: string
      status: string
      sentCount: number
      recipientCount: number
      failedCount: number
      createdAt: string
      completedAt: string | null
    }>
    delivery: {
      totalRecipients: number
      delivered: number
      opened: number
      clicked: number
      bounced: number
      unsubscribed: number
      openRate: number
      clickRate: number
      deliveryRate: number
      bounceRate: number
    }
  }
  contacts: {
    total: number
    active: number
    suppressed: number
    unsubscribed: number
    addedLast30Days: number
    addedLast7Days: number
    leads: number
    customers: number
    growthTimeline: Array<{ day: string; count: number }>
  }
  segments: {
    total: number
    dynamic: number
    static: number
    ready: number
    top: Array<{ id: string; name: string; contactCount: number; type: string }>
  }
  workflows: {
    total: number
    published: number
    draft: number
    paused: number
    executions: { total: number; running: number; completed: number; failed: number }
  }
  domains: { total: number; verified: number; pending: number; failed: number }
  members: { total: number; pendingInvites: number }
  usage: {
    contacts: { used: number; limit: number }
    emails: { used: number; limit: number }
    events: { used: number; limit: number }
    periodStart: string
    periodEnd: string
  }
  subscription: {
    plan: string
    status: string
    billingInterval: string | null
    currentPeriodEnd: string | null
    cancelAtPeriodEnd: boolean
  } | null
}

class AnalyticsService {
  async getSummary(workspaceId: string): Promise<WorkspaceSummary> {
    return apiClient.get<WorkspaceSummary>('/analytics/summary', {
      headers: { 'x-workspace-id': workspaceId },
    })
  }
}

export const analyticsService = new AnalyticsService()
