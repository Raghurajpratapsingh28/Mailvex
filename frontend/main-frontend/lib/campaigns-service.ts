import { apiClient } from './api-client';
import type { Campaign, CampaignStatus } from './campaigns-data';

// API campaign shape (snake_case from DB → camelCase from API)
interface ApiCampaign {
  id: string;
  workspaceId: string;
  name: string;
  type: string;
  status: CampaignStatus;
  subject: string | null;
  previewText: string | null;
  senderEmail: string | null;
  senderName: string | null;
  replyTo: string | null;
  htmlBody: string | null;
  textBody: string | null;
  templateId: string | null;
  segmentId: string | null;
  recipientCount: number;
  sentCount: number;
  failedCount: number;
  version: number;
  scheduledAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  pausedAt: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  // joined
  segmentName?: string;
}

function toFrontend(c: ApiCampaign): Campaign {
  return {
    id: c.id,
    name: c.name,
    type: 'regular',
    status: c.status,
    subject: c.subject ?? '',
    previewText: c.previewText ?? '',
    fromEmail: c.senderEmail ?? '',
    fromName: c.senderName ?? '',
    replyTo: c.replyTo ?? '',
    segmentId: c.segmentId ?? '',
    segmentName: c.segmentName ?? '',
    recipientCount: c.recipientCount,
    sentCount: c.sentCount,
    failedCount: c.failedCount,
    scheduledAt: c.scheduledAt,
    sentAt: c.completedAt,
    htmlBody: c.htmlBody ?? '',
    plainText: c.textBody ?? '',
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
    version: c.version,
  };
}

export const campaignsService = {
  async list(workspaceId: string, params?: {
    page?: number;
    pageSize?: number;
    status?: string;
    search?: string;
    fromDate?: string;
    toDate?: string;
  }): Promise<{ items: Campaign[]; total: number; page: number; pageSize: number }> {
    const clean = Object.fromEntries(
      Object.entries(params || {}).filter(([, v]) => v !== undefined && v !== '' && v !== 'all')
    );
    const query = new URLSearchParams(clean as any).toString();
    const res = await apiClient.get<{ items: ApiCampaign[]; total: number; page: number; pageSize: number }>(
      `/campaigns${query ? `?${query}` : ''}`,
      { headers: { 'x-workspace-id': workspaceId } }
    );
    return { ...res, items: res.items.map(toFrontend) };
  },

  async get(workspaceId: string, id: string): Promise<Campaign> {
    const res = await apiClient.get<{ campaign: ApiCampaign }>(
      `/campaigns/${id}`,
      { headers: { 'x-workspace-id': workspaceId } }
    );
    return toFrontend(res.campaign);
  },

  async create(workspaceId: string, data: {
    name: string;
    type?: string;
    subject?: string;
    previewText?: string;
    from?: { email: string; name?: string };
    replyTo?: string;
    html?: string;
    text?: string;
    segmentId?: string;
  }): Promise<Campaign> {
    const res = await apiClient.post<{ campaign: ApiCampaign }>(
      `/campaigns`,
      data,
      { headers: { 'x-workspace-id': workspaceId } }
    );
    return toFrontend(res.campaign);
  },

  async update(workspaceId: string, id: string, data: {
    name?: string;
    subject?: string;
    previewText?: string;
    from?: { email: string; name?: string };
    replyTo?: string;
    html?: string;
    text?: string;
    segmentId?: string;
    version: number;
  }): Promise<Campaign> {
    const res = await apiClient.patch<{ campaign: ApiCampaign }>(
      `/campaigns/${id}`,
      data,
      { headers: { 'x-workspace-id': workspaceId } }
    );
    return toFrontend(res.campaign);
  },

  async schedule(workspaceId: string, id: string, scheduledAt: string): Promise<Campaign> {
    const res = await apiClient.post<{ campaign: ApiCampaign }>(
      `/campaigns/${id}/schedule`,
      { scheduledAt },
      { headers: { 'x-workspace-id': workspaceId } }
    );
    return toFrontend(res.campaign);
  },

  async send(workspaceId: string, id: string): Promise<{ campaignId: string; status: string; recipientCount: number }> {
    return apiClient.post(
      `/campaigns/${id}/send`,
      {},
      { headers: { 'x-workspace-id': workspaceId } }
    );
  },

  async pause(workspaceId: string, id: string): Promise<Campaign> {
    const res = await apiClient.post<{ campaign: ApiCampaign }>(
      `/campaigns/${id}/pause`,
      {},
      { headers: { 'x-workspace-id': workspaceId } }
    );
    return toFrontend(res.campaign);
  },

  async resume(workspaceId: string, id: string): Promise<Campaign> {
    const res = await apiClient.post<{ campaign: ApiCampaign }>(
      `/campaigns/${id}/resume`,
      {},
      { headers: { 'x-workspace-id': workspaceId } }
    );
    return toFrontend(res.campaign);
  },

  async delete(workspaceId: string, id: string): Promise<void> {
    await apiClient.delete(`/campaigns/${id}`, {
      headers: { 'x-workspace-id': workspaceId },
    });
  },
};
