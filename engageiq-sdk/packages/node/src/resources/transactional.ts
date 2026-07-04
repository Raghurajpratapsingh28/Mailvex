import type { HttpClient } from "../http/http-client.js";
import type {
  EmailSend,
  EmailTemplate,
  EmailRecipient,
  PaginatedResponse,
  PaginationParams,
  TemplateStatus,
} from "../types/index.js";
import { paginate } from "../utils/pagination.js";

export interface SendEmailParams {
  to: EmailRecipient[];
  from: EmailRecipient;
  replyTo?: string;
  subject?: string;
  html?: string;
  text?: string;
  templateId?: string;
  templateData?: Record<string, unknown>;
  tags?: string[];
  idempotencyKey?: string;
}

export interface SendEmailResult {
  sendId: string;
  status: "queued";
}

export interface ListEmailsParams extends PaginationParams {
  status?: string;
  recipient?: string;
  fromDate?: string;
  toDate?: string;
  [key: string]: string | number | boolean | undefined | null;
}

export interface CreateTemplateParams {
  name: string;
  subject: string;
  htmlBody: string;
  textBody?: string;
  variables?: Record<string, string>;
  publish?: boolean;
}

export interface UpdateTemplateParams {
  subject?: string;
  htmlBody?: string;
  textBody?: string;
  variables?: Record<string, string>;
  publish?: boolean;
}

export interface ListTemplatesParams extends PaginationParams {
  status?: TemplateStatus;
  search?: string;
  latestOnly?: boolean;
  [key: string]: string | number | boolean | undefined | null;
}

export class TransactionalResource {
  constructor(private readonly http: HttpClient) {}

  async send(params: SendEmailParams): Promise<SendEmailResult> {
    return this.http.post<SendEmailResult>("/api/v1/emails/send", params);
  }

  async list(params: ListEmailsParams = {}): Promise<PaginatedResponse<EmailSend>> {
    return this.http.get<PaginatedResponse<EmailSend>>("/api/v1/emails", params);
  }

  async get(sendId: string): Promise<EmailSend> {
    return this.http.get<EmailSend>(`/api/v1/emails/${sendId}`);
  }

  // ─── Templates ─────────────────────────────────────────────────────────────

  async createTemplate(params: CreateTemplateParams): Promise<EmailTemplate> {
    const res = await this.http.post<{ template: EmailTemplate }>(
      "/api/v1/email-templates",
      params
    );
    return res.template;
  }

  async listTemplates(
    params: ListTemplatesParams = {}
  ): Promise<PaginatedResponse<EmailTemplate>> {
    return this.http.get<PaginatedResponse<EmailTemplate>>(
      "/api/v1/email-templates",
      params
    );
  }

  async *listAllTemplates(
    params: ListTemplatesParams = {}
  ): AsyncGenerator<EmailTemplate> {
    yield* paginate<EmailTemplate>(
      this.http,
      "/api/v1/email-templates",
      params
    );
  }

  async getTemplate(id: string): Promise<EmailTemplate> {
    return this.http.get<EmailTemplate>(`/api/v1/email-templates/${id}`);
  }

  async updateTemplate(
    id: string,
    params: UpdateTemplateParams
  ): Promise<EmailTemplate> {
    const res = await this.http.patch<{ template: EmailTemplate }>(
      `/api/v1/email-templates/${id}`,
      params
    );
    return res.template;
  }

  async deleteTemplate(id: string): Promise<void> {
    return this.http.delete<void>(`/api/v1/email-templates/${id}`);
  }
}