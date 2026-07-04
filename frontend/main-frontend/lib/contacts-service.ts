import { apiClient } from './api-client';

export interface Contact {
  id: string;
  workspaceId: string;
  email: string;
  anonymousId?: string;
  externalId?: string;
  firstName: string;
  lastName: string;
  phone?: string;
  lifecycleStage: string;
  leadScore: number;
  properties: Record<string, any>;
  source?: Record<string, any>;
  emailSuppressed: boolean;
  globallySuppressed: boolean;
  unsubscribed: boolean;
  tags: string[];
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export const contactsService = {
  async createContact(workspaceId: string, data: Partial<Contact>): Promise<{ contact: Contact }> {
    return apiClient.post('/contacts', data, {
      headers: { 'x-workspace-id': workspaceId },
    });
  },

  async getContacts(workspaceId: string, params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    tags?: string;
    lifecycleStage?: string;
    emailSuppressed?: boolean;
    unsubscribed?: boolean;
    fromDate?: string;
    toDate?: string;
  }): Promise<{ items: Contact[]; page: number; pageSize: number; total: number }> {
    const cleanParams = Object.fromEntries(
      Object.entries(params || {}).filter(([_, v]) => v !== undefined && v !== null && v !== '')
    );
    const query = new URLSearchParams(cleanParams as any).toString();
    return apiClient.get(`/contacts${query ? `?${query}` : ''}`, {
      headers: { 'x-workspace-id': workspaceId },
    });
  },

  async getContact(workspaceId: string, contactId: string): Promise<{ contact: Contact }> {
    return apiClient.get(`/contacts/${contactId}`, {
      headers: { 'x-workspace-id': workspaceId },
    });
  },

  async updateContact(workspaceId: string, contactId: string, data: Partial<Contact>): Promise<{ contact: Contact }> {
    return apiClient.patch(`/contacts/${contactId}`, data, {
      headers: { 'x-workspace-id': workspaceId },
    });
  },

  async deleteContact(workspaceId: string, contactId: string): Promise<void> {
    return apiClient.delete(`/contacts/${contactId}`, {
      headers: { 'x-workspace-id': workspaceId },
    });
  },

  async bulkImport(workspaceId: string, contacts: Partial<Contact>[]): Promise<{ imported: number; skipped: number }> {
    return apiClient.post('/contacts/bulk-import', { contacts }, {
      headers: { 'x-workspace-id': workspaceId },
    });
  },

  async suppressContact(workspaceId: string, contactId: string): Promise<{ contact: Contact }> {
    return apiClient.post(`/contacts/${contactId}/suppress`, {}, {
      headers: { 'x-workspace-id': workspaceId },
    });
  },

  async unsuppressContact(workspaceId: string, contactId: string): Promise<{ contact: Contact }> {
    return apiClient.post(`/contacts/${contactId}/unsuppress`, {}, {
      headers: { 'x-workspace-id': workspaceId },
    });
  },
};
