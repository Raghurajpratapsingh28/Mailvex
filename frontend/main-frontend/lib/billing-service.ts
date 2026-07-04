import { apiClient } from './api-client';

export interface Subscription {
  plan: string;
  status: string;
  billingInterval: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  canceledAt: string | null;
  trialEndsAt: string | null;
}

export interface Usage {
  contacts: { used: number; limit: number };
  emails: { used: number; limit: number };
  events: { used: number; limit: number };
  periodStart: string;
  periodEnd: string;
}

export interface Invoice {
  id: string;
  amountDue: number;
  amountPaid: number;
  currency: string;
  status: string;
  hostedInvoiceUrl: string;
  pdfUrl: string;
  createdAt: string;
}

export const billingService = {
  async createCheckout(workspaceId: string, data: { plan: string; billingInterval: string }): Promise<{ checkoutUrl: string; sessionId: string }> {
    return apiClient.post('/billing/checkout', data, {
      headers: { 'x-workspace-id': workspaceId },
    });
  },

  async createPortal(workspaceId: string): Promise<{ url: string }> {
    return apiClient.post('/billing/portal', {}, {
      headers: { 'x-workspace-id': workspaceId },
    });
  },

  async getSubscription(workspaceId: string): Promise<Subscription> {
    return apiClient.get('/billing/subscription', {
      headers: { 'x-workspace-id': workspaceId },
    });
  },

  async getUsage(workspaceId: string): Promise<Usage> {
    return apiClient.get('/billing/usage', {
      headers: { 'x-workspace-id': workspaceId },
    });
  },

  async getInvoices(workspaceId: string, params?: { page?: number; pageSize?: number }): Promise<{ items: Invoice[]; page: number; pageSize: number; total: number }> {
    const query = new URLSearchParams(params as any).toString();
    return apiClient.get(`/billing/invoices${query ? `?${query}` : ''}`, {
      headers: { 'x-workspace-id': workspaceId },
    });
  },

  async cancelSubscription(workspaceId: string): Promise<Subscription> {
    return apiClient.post('/billing/cancel', {}, {
      headers: { 'x-workspace-id': workspaceId },
    });
  },

  async resumeSubscription(workspaceId: string): Promise<Subscription> {
    return apiClient.post('/billing/resume', {}, {
      headers: { 'x-workspace-id': workspaceId },
    });
  },

  async changePlan(workspaceId: string, data: { plan: string; billingInterval: string }): Promise<Subscription> {
    return apiClient.post('/billing/change-plan', data, {
      headers: { 'x-workspace-id': workspaceId },
    });
  },
};
