import { apiClient } from './api-client';

export interface WorkspaceSettings {
  id: string;
  workspaceId: string;
  timezone: string;
  locale: string;
  branding: {
    logoUrl?: string;
    primaryColor?: string;
  };
  emailDefaults: {
    fromName?: string;
    fromEmail?: string;
    replyTo?: string;
  };
  featureFlags: Record<string, boolean>;
  webhookSettings: {
    url?: string;
    secret?: string;
    events?: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceMember {
  membershipId: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  roleSlug: string;
  invitedByUserId: string | null;
  joinedAt: string;
}

export interface Workspace {
  id: string;
  slug: string;
  name: string;
  plan: string;
  status: string;
  ownerUserId: string;
  metadata: Record<string, any>;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export const workspaceService = {
  async getWorkspaces(): Promise<{ items: Array<{ workspace: Workspace; role: string }> }> {
    return apiClient.get(`/workspaces`);
  },

  async createWorkspace(data: { name: string; slug?: string; plan?: string; metadata?: Record<string, any> }): Promise<{ workspace: Workspace; role: string }> {
    return apiClient.post(`/workspaces`, data);
  },

  async getSettings(workspaceId: string): Promise<{ settings: WorkspaceSettings }> {
    return apiClient.get(`/workspaces/${workspaceId}/settings`, {
      headers: { 'x-workspace-id': workspaceId },
    });
  },

  async getCurrentWorkspace(workspaceId: string): Promise<{ workspace: Workspace }> {
    return apiClient.get(`/workspaces/current`, {
      headers: { 'x-workspace-id': workspaceId },
    });
  },

  async updateSettings(
    workspaceId: string,
    data: Partial<Omit<WorkspaceSettings, 'id' | 'workspaceId' | 'createdAt' | 'updatedAt'>>
  ): Promise<{ settings: WorkspaceSettings }> {
    return apiClient.patch(`/workspaces/${workspaceId}/settings`, data, {
      headers: { 'x-workspace-id': workspaceId },
    });
  },

  async getMembers(workspaceId: string, params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    role?: string;
  }): Promise<{ items: WorkspaceMember[]; total: number; page: number; pageSize: number }> {
    const query = new URLSearchParams(params as any).toString();
    return apiClient.get(`/workspaces/${workspaceId}/members${query ? `?${query}` : ''}`, {
      headers: { 'x-workspace-id': workspaceId },
    });
  },

  async updateMemberRole(
    workspaceId: string,
    memberId: string,
    role: string
  ): Promise<{ membershipId: string; role: string }> {
    return apiClient.patch(`/workspaces/${workspaceId}/members/${memberId}`, { role }, {
      headers: { 'x-workspace-id': workspaceId },
    });
  },

  async removeMember(workspaceId: string, memberId: string): Promise<void> {
    return apiClient.delete(`/workspaces/${workspaceId}/members/${memberId}`, {
      headers: { 'x-workspace-id': workspaceId },
    });
  },

  async updateWorkspace(
    workspaceId: string,
    data: { name?: string; slug?: string; metadata?: Record<string, any>; version: number }
  ): Promise<{ workspace: Workspace }> {
    return apiClient.patch(`/workspaces/${workspaceId}`, data, {
      headers: { 'x-workspace-id': workspaceId },
    });
  },

  async deactivateWorkspace(workspaceId: string): Promise<{ workspace: Workspace }> {
    return apiClient.post(`/workspaces/${workspaceId}/deactivate`, {}, {
      headers: { 'x-workspace-id': workspaceId },
    });
  },

  async reactivateWorkspace(workspaceId: string): Promise<{ workspace: Workspace }> {
    return apiClient.post(`/workspaces/${workspaceId}/reactivate`, {}, {
      headers: { 'x-workspace-id': workspaceId },
    });
  },

  async switchWorkspace(workspaceId: string): Promise<{ workspaceId: string; accessToken: string; expiresIn: number }> {
    return apiClient.post(`/workspaces/switch`, { workspaceId });
  },

  async transferOwnership(workspaceId: string, newOwnerUserId: string): Promise<{ newOwnerUserId: string }> {
    return apiClient.post(`/workspaces/${workspaceId}/transfer-ownership`, { newOwnerUserId }, {
      headers: { 'x-workspace-id': workspaceId },
    });
  },
};
