import { apiClient } from './api-client';
import type { Segment, FilterTree, FilterGroup, FilterRule } from './segments-data';
import { FILTER_FIELDS } from './segments-data';

// API filter tree uses a flat structure without id/type fields
interface ApiFilterRule {
  field: string;
  operator: string;
  value?: string | number;
}

interface ApiFilterGroup {
  operator: 'AND' | 'OR';
  rules: (ApiFilterRule | ApiFilterGroup)[];
}

// Convert frontend FilterTree (with id/type) to API format
function toApiFilterTree(tree: FilterTree): ApiFilterGroup {
  return {
    operator: tree.operator,
    rules: tree.children.map((child) => {
      if (child.type === 'group') {
        return toApiFilterTree(child as FilterGroup);
      }
      const rule = child as FilterRule;

      // exists/not_exists have no value
      if (rule.operator === 'exists' || rule.operator === 'not_exists') {
        return { field: rule.field, operator: rule.operator };
      }

      const fieldDef = FILTER_FIELDS.find(f => f.value === rule.field);

      // in/not_in: send as comma-separated string (API accepts string, processor splits)
      if (rule.operator === 'in' || rule.operator === 'not_in') {
        return { field: rule.field, operator: rule.operator, value: rule.value };
      }

      // occurred_within_days: always number
      if (rule.operator === 'occurred_within_days') {
        const numValue = Number(rule.value);
        return { field: rule.field, operator: rule.operator, value: isNaN(numValue) ? rule.value : numValue };
      }

      // Convert value to number for numeric fields
      let value: string | number = rule.value;
      if (fieldDef?.type === 'number' && rule.value) {
        const numValue = Number(rule.value);
        if (!isNaN(numValue)) {
          value = numValue;
        }
      }

      return { field: rule.field, operator: rule.operator, value };
    }),
  };
}

// Convert API filter tree back to frontend FilterTree (add id/type)
function fromApiFilterTree(tree: ApiFilterGroup, depth = 0): FilterTree {
  return {
    id: `g-${depth}-${Math.random().toString(36).slice(2, 6)}`,
    type: 'group',
    operator: tree.operator ?? 'AND',
    children: (tree.rules ?? []).map((rule, i) => {
      if ('rules' in rule) {
        return fromApiFilterTree(rule as ApiFilterGroup, depth + 1);
      }
      const r = rule as ApiFilterRule;
      return {
        id: `r-${depth}-${i}-${Math.random().toString(36).slice(2, 6)}`,
        type: 'rule' as const,
        field: r.field,
        operator: r.operator as FilterRule['operator'],
        value: String(r.value ?? ''),
      };
    }),
  };
}

export interface ApiSegment {
  id: string;
  workspaceId: string;
  name: string;
  type: 'static' | 'dynamic';
  filterTree?: ApiFilterGroup;
  contactCount: number;
  status: 'pending' | 'computing' | 'ready' | 'failed';
  lastComputed: string | null;
  createdBy: string;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

function toFrontendSegment(s: ApiSegment): Segment {
  return {
    id: s.id,
    name: s.name,
    type: s.type,
    status: s.status,
    contactCount: s.contactCount,
    filterTree: s.filterTree?.rules ? fromApiFilterTree(s.filterTree) : undefined,
    lastComputed: s.lastComputed,
    createdAt: s.createdAt,
    createdBy: s.createdBy,
    updatedAt: s.updatedAt,
  };
}

export const segmentsService = {
  async listSegments(
    workspaceId: string,
    params?: { page?: number; pageSize?: number }
  ): Promise<{ items: Segment[]; page: number; pageSize: number; total: number }> {
    const query = new URLSearchParams(params as any).toString();
    const res = await apiClient.get<{ items: ApiSegment[]; page: number; pageSize: number; total: number }>(
      `/segments${query ? `?${query}` : ''}`,
      { headers: { 'x-workspace-id': workspaceId } }
    );
    return { ...res, items: res.items.map(toFrontendSegment) };
  },

  async getSegment(workspaceId: string, segmentId: string): Promise<Segment> {
    const res = await apiClient.get<{ segment: ApiSegment }>(
      `/segments/${segmentId}`,
      { headers: { 'x-workspace-id': workspaceId } }
    );
    return toFrontendSegment(res.segment);
  },

  async createSegment(
    workspaceId: string,
    data: { name: string; type: 'static' | 'dynamic'; filterTree?: FilterTree }
  ): Promise<Segment> {
    const body: any = { name: data.name, type: data.type };
    if (data.type === 'dynamic' && data.filterTree) {
      body.filterTree = toApiFilterTree(data.filterTree);
    }
    const res = await apiClient.post<{ segment: ApiSegment }>(
      `/segments`,
      body,
      { headers: { 'x-workspace-id': workspaceId } }
    );
    return toFrontendSegment(res.segment);
  },

  async updateSegment(
    workspaceId: string,
    segmentId: string,
    data: { name?: string; filterTree?: FilterTree }
  ): Promise<Segment> {
    const body: any = {};
    if (data.name !== undefined) body.name = data.name;
    if (data.filterTree) body.filterTree = toApiFilterTree(data.filterTree);
    const res = await apiClient.patch<{ segment: ApiSegment }>(
      `/segments/${segmentId}`,
      body,
      { headers: { 'x-workspace-id': workspaceId } }
    );
    return toFrontendSegment(res.segment);
  },

  async deleteSegment(workspaceId: string, segmentId: string): Promise<void> {
    await apiClient.delete(`/segments/${segmentId}`, {
      headers: { 'x-workspace-id': workspaceId },
    });
  },

  async addContactToSegment(workspaceId: string, segmentId: string, contactId: string): Promise<void> {
    await apiClient.post(
      `/segments/${segmentId}/contacts`,
      { contactId },
      { headers: { 'x-workspace-id': workspaceId } }
    );
  },

  async removeContactFromSegment(workspaceId: string, segmentId: string, contactId: string): Promise<void> {
    await apiClient.delete(
      `/segments/${segmentId}/contacts/${contactId}`,
      { headers: { 'x-workspace-id': workspaceId } }
    );
  },

  async refreshSegment(workspaceId: string, segmentId: string): Promise<{ queued: boolean }> {
    return apiClient.post(
      `/segments/${segmentId}/refresh`,
      {},
      { headers: { 'x-workspace-id': workspaceId } }
    );
  },

  async previewSegment(
    workspaceId: string,
    segmentId: string,
    limit = 100
  ): Promise<{ contacts: Array<{ id: string; email: string; firstName: string; lastName: string; lifecycleStage: string }>; total: number }> {
    return apiClient.get(
      `/segments/${segmentId}/preview?limit=${limit}`,
      { headers: { 'x-workspace-id': workspaceId } }
    );
  },
};
