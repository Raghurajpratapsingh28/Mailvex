import { apiClient } from './api-client';
import type { WorkflowStatus } from './workflows-data';

export interface WorkflowGraph {
  nodes: Array<{ id: string; type: string; config?: Record<string, unknown> }>;
  edges: Array<{ from: string; to: string }>;
}

export interface ApiWorkflow {
  id: string;
  workspaceId: string;
  name: string;
  status: WorkflowStatus;
  triggerType: string;
  triggerConfig: Record<string, unknown>;
  graph: WorkflowGraph;
  executionStats: { total: number; completed: number; failed: number; running: number };
  version: number;
  publishedAt: string | null;
  pausedAt: string | null;
  createdBy: string;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiExecution {
  id: string;
  workspaceId: string;
  workflowId: string;
  contactId: string | null;
  status: 'queued' | 'running' | 'waiting' | 'completed' | 'failed';
  currentNodeId: string | null;
  startedAt: string | null;
  completedAt: string | null;
  failedAt: string | null;
  failureReason: string | null;
  retryCount: number;
  createdAt: string;
  updatedAt: string;
}

export const workflowsService = {
  async list(workspaceId: string, params?: { page?: number; pageSize?: number }): Promise<{ items: ApiWorkflow[]; total: number; page: number; pageSize: number }> {
    const q = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : '';
    return apiClient.get(`/workflows${q}`, { headers: { 'x-workspace-id': workspaceId } });
  },

  async get(workspaceId: string, id: string): Promise<{ workflow: ApiWorkflow }> {
    return apiClient.get(`/workflows/${id}`, { headers: { 'x-workspace-id': workspaceId } });
  },

  async create(workspaceId: string, data: { name: string; graph: WorkflowGraph }): Promise<{ workflow: ApiWorkflow }> {
    return apiClient.post('/workflows', data, { headers: { 'x-workspace-id': workspaceId } });
  },

  async update(workspaceId: string, id: string, data: { name?: string; graph?: WorkflowGraph }): Promise<{ workflow: ApiWorkflow }> {
    return apiClient.patch(`/workflows/${id}`, data, { headers: { 'x-workspace-id': workspaceId } });
  },

  async publish(workspaceId: string, id: string): Promise<{ workflow: ApiWorkflow }> {
    return apiClient.post(`/workflows/${id}/publish`, {}, { headers: { 'x-workspace-id': workspaceId } });
  },

  async pause(workspaceId: string, id: string): Promise<{ workflow: ApiWorkflow }> {
    return apiClient.post(`/workflows/${id}/pause`, {}, { headers: { 'x-workspace-id': workspaceId } });
  },

  async resume(workspaceId: string, id: string): Promise<{ workflow: ApiWorkflow }> {
    return apiClient.post(`/workflows/${id}/resume`, {}, { headers: { 'x-workspace-id': workspaceId } });
  },

  async delete(workspaceId: string, id: string): Promise<void> {
    return apiClient.delete(`/workflows/${id}`, { headers: { 'x-workspace-id': workspaceId } });
  },

  async getExecutions(workspaceId: string, id: string, params?: { page?: number; pageSize?: number }): Promise<{ items: ApiExecution[]; total: number; page: number; pageSize: number }> {
    const q = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : '';
    return apiClient.get(`/workflows/${id}/executions${q}`, { headers: { 'x-workspace-id': workspaceId } });
  },
};
