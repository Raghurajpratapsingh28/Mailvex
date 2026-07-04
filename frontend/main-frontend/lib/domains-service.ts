import { apiClient } from './api-client';

export type DomainStatus = 'pending' | 'verifying' | 'verified' | 'failed' | 'deleting' | 'deleted';

export interface DnsRecord { type: 'TXT' | 'CNAME'; host: string; value: string }
export interface DomainDns {
  spf: DnsRecord;
  dkim: DnsRecord[];
  dmarc: DnsRecord;
}

export interface ApiDomain {
  id: string;
  workspaceId: string;
  domain: string;
  sesIdentity: string;
  status: DomainStatus;
  dkimTokens: string[];
  verificationStartedAt: string | null;
  verificationAttempts: number;
  verifiedAt: string | null;
  version: number;
  createdAt: string;
  updatedAt: string;
  dns: DomainDns;
}

export const domainsService = {
  async list(workspaceId: string, params?: { page?: number; pageSize?: number; status?: string }): Promise<{ items: ApiDomain[]; total: number; page: number; pageSize: number }> {
    const clean = Object.fromEntries(Object.entries(params || {}).filter(([, v]) => v !== undefined && v !== ''));
    const q = Object.keys(clean).length ? `?${new URLSearchParams(clean as Record<string, string>).toString()}` : '';
    return apiClient.get(`/domains${q}`, { headers: { 'x-workspace-id': workspaceId } });
  },

  async get(workspaceId: string, id: string): Promise<ApiDomain> {
    return apiClient.get(`/domains/${id}`, { headers: { 'x-workspace-id': workspaceId } });
  },

  async add(workspaceId: string, domain: string): Promise<ApiDomain> {
    return apiClient.post('/domains', { domain }, { headers: { 'x-workspace-id': workspaceId } });
  },

  async verify(workspaceId: string, id: string): Promise<{ status: string }> {
    return apiClient.post(`/domains/${id}/verify`, {}, { headers: { 'x-workspace-id': workspaceId } });
  },

  async delete(workspaceId: string, id: string): Promise<void> {
    return apiClient.delete(`/domains/${id}`, { headers: { 'x-workspace-id': workspaceId } });
  },
};
