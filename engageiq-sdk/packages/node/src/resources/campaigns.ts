import type { HttpClient } from "../http/http-client.js";
import type {
  Campaign,
  CampaignStatus,
  EmailRecipient,
  PaginatedResponse,
  PaginationParams,
} from "../types/index.js";
import { paginate } from "../utils/pagination.js";

export interface CreateCampaignParams {
  name: string;
  type?: "regular";
  subject: string;
  previewText?: string;
  from: EmailRecipient;
  replyTo?: string;
  html: string;
  text?: string;
  templateId?: string;
  segmentId: string;
}

export interface UpdateCampaignParams {
  name?: string;
  subject?: string;
  previewText?: string;
  from?: EmailRecipient;
  replyTo?: string;
  html?: string;
  text?: string;
  templateId?: string;
  segmentId?: string;
  version: number;
}

export interface ListCampaignsParams extends PaginationParams {
  status?: CampaignStatus;
  type?: string;
  search?: string;
  fromDate?: string;
  toDate?: string;
  [key: string]: string | number | boolean | undefined | null;
}

export interface SendResult {
  campaignId: string;
  status: "sending";
  recipientCount: number;
}

export class CampaignsResource {
  constructor(private readonly http: HttpClient) {}

  async create(params: CreateCampaignParams): Promise<Campaign> {
    const res = await this.http.post<{ campaign: Campaign }>(
      "/api/v1/campaigns",
      { ...params, type: params.type ?? "regular" }
    );
    return res.campaign;
  }

  async list(params: ListCampaignsParams = {}): Promise<PaginatedResponse<Campaign>> {
    return this.http.get<PaginatedResponse<Campaign>>("/api/v1/campaigns", params);
  }

  async *listAll(params: ListCampaignsParams = {}): AsyncGenerator<Campaign> {
    yield* paginate<Campaign>(this.http, "/api/v1/campaigns", params);
  }

  async get(id: string): Promise<Campaign> {
    const res = await this.http.get<{ campaign: Campaign }>(`/api/v1/campaigns/${id}`);
    return res.campaign;
  }

  async update(id: string, params: UpdateCampaignParams): Promise<Campaign> {
    const res = await this.http.patch<{ campaign: Campaign }>(
      `/api/v1/campaigns/${id}`,
      params
    );
    return res.campaign;
  }

  async schedule(id: string, scheduledAt: string): Promise<Campaign> {
    const res = await this.http.post<{ campaign: Campaign }>(
      `/api/v1/campaigns/${id}/schedule`,
      { scheduledAt }
    );
    return res.campaign;
  }

  async send(id: string): Promise<SendResult> {
    return this.http.post<SendResult>(`/api/v1/campaigns/${id}/send`);
  }

  async pause(id: string): Promise<Campaign> {
    const res = await this.http.post<{ campaign: Campaign }>(
      `/api/v1/campaigns/${id}/pause`
    );
    return res.campaign;
  }

  async resume(id: string): Promise<Campaign> {
    const res = await this.http.post<{ campaign: Campaign }>(
      `/api/v1/campaigns/${id}/resume`
    );
    return res.campaign;
  }

  async delete(id: string): Promise<void> {
    return this.http.delete<void>(`/api/v1/campaigns/${id}`);
  }
}