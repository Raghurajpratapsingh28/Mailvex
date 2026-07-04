import { apiClient } from './api-client';

export type ApiKeyScope = 'events.write' | 'events.read';

export interface ApiKey {
  id: string;
  workspaceId: string;
  name: string;
  keyPrefix: string;
  scope: string;
  isActive: boolean;
  rateLimit: number;
  lastUsedAt: string | null;
  revokedAt: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateApiKeyResult {
  apiKey: ApiKey;
  key: string; // plaintext — shown once only
}

export interface ListApiKeysResult {
  items: ApiKey[];
  total: number;
  page: number;
  pageSize: number;
}

export const apiKeysService = {
  async list(
    workspaceId: string,
    params?: { page?: number; pageSize?: number },
  ): Promise<ListApiKeysResult> {
    const q = params
      ? '?' + new URLSearchParams(
          Object.fromEntries(
            Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)]),
          ),
        ).toString()
      : '';
    return apiClient.get(`/api-keys${q}`, {
      headers: { 'x-workspace-id': workspaceId },
    });
  },

  async get(workspaceId: string, id: string): Promise<{ apiKey: ApiKey }> {
    return apiClient.get(`/api-keys/${id}`, {
      headers: { 'x-workspace-id': workspaceId },
    });
  },

  async create(
    workspaceId: string,
    data: { name: string; scopes?: ApiKeyScope[]; rateLimit?: number },
  ): Promise<CreateApiKeyResult> {
    return apiClient.post(
      '/api-keys',
      { scopes: ['events.write'], rateLimit: 0, ...data },
      { headers: { 'x-workspace-id': workspaceId } },
    );
  },

  async revoke(workspaceId: string, id: string): Promise<void> {
    return apiClient.delete(`/api-keys/${id}`, {
      headers: { 'x-workspace-id': workspaceId },
    });
  },
};
