import { apiClient } from './api-client';
import type { SendStatus, TemplateStatus, TemplateVariable } from './transactional-data';

export interface EmailSend {
  sendId: string;
  status: SendStatus;
  providerMessageId: string | null;
  failureReason: string | null;
  subject: string;
  senderEmail: string;
  recipientEmail: string;
  tags: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlBody: string;
  textBody: string;
  variables: Record<string, string>;
  status: TemplateStatus;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface SendEmailPayload {
  to: Array<{ email: string; name?: string }>;
  from: { email: string; name?: string };
  replyTo?: string;
  subject?: string;
  html?: string;
  text?: string;
  templateId?: string | null;
  templateData?: Record<string, string>;
  tags?: Record<string, string>;
  idempotencyKey?: string;
}

export const transactionalService = {
  async getSends(workspaceId: string, params?: {
    page?: number;
    pageSize?: number;
    status?: string;
    recipient?: string;
    fromDate?: string;
    toDate?: string;
  }): Promise<{ items: EmailSend[]; total: number; page: number; pageSize: number }> {
    const clean = Object.fromEntries(
      Object.entries(params || {}).filter(([, v]) => v !== undefined && v !== null && v !== '')
    );
    const query = new URLSearchParams(clean as Record<string, string>).toString();
    return apiClient.get(`/emails${query ? `?${query}` : ''}`, {
      headers: { 'x-workspace-id': workspaceId },
    });
  },

  async getSend(workspaceId: string, sendId: string): Promise<EmailSend> {
    return apiClient.get(`/emails/${sendId}`, {
      headers: { 'x-workspace-id': workspaceId },
    });
  },

  async sendEmail(workspaceId: string, data: SendEmailPayload): Promise<{ sendId: string; status: string }> {
    return apiClient.post('/emails/send', data, {
      headers: { 'x-workspace-id': workspaceId },
    });
  },

  async getTemplates(workspaceId: string, params?: {
    page?: number;
    pageSize?: number;
    status?: string;
    search?: string;
    latestOnly?: boolean;
  }): Promise<{ items: EmailTemplate[]; total: number; page: number; pageSize: number }> {
    const clean = Object.fromEntries(
      Object.entries(params || {}).filter(([, v]) => v !== undefined && v !== null && v !== '')
    );
    const query = new URLSearchParams(clean as Record<string, string>).toString();
    return apiClient.get(`/email-templates${query ? `?${query}` : ''}`, {
      headers: { 'x-workspace-id': workspaceId },
    });
  },

  async getTemplate(workspaceId: string, id: string): Promise<{ template: EmailTemplate }> {
    return apiClient.get(`/email-templates/${id}`, {
      headers: { 'x-workspace-id': workspaceId },
    });
  },

  async createTemplate(workspaceId: string, data: {
    name: string;
    subject: string;
    htmlBody?: string;
    textBody?: string;
    variables?: Record<string, string>;
    publish?: boolean;
  }): Promise<{ template: EmailTemplate }> {
    return apiClient.post('/email-templates', data, {
      headers: { 'x-workspace-id': workspaceId },
    });
  },

  async updateTemplate(workspaceId: string, id: string, data: {
    subject?: string;
    htmlBody?: string;
    textBody?: string;
    variables?: Record<string, string>;
    publish?: boolean;
  }): Promise<{ template: EmailTemplate }> {
    return apiClient.patch(`/email-templates/${id}`, data, {
      headers: { 'x-workspace-id': workspaceId },
    });
  },

  async deleteTemplate(workspaceId: string, id: string): Promise<void> {
    return apiClient.delete(`/email-templates/${id}`, {
      headers: { 'x-workspace-id': workspaceId },
    });
  },
};
