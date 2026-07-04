import type { HttpClient } from "../http/http-client.js";
import type {
  Contact,
  FilterTree,
  PaginatedResponse,
  PaginationParams,
  Segment,
  SegmentType,
} from "../types/index.js";
import { paginate } from "../utils/pagination.js";

export interface CreateSegmentParams {
  name: string;
  type: SegmentType;
  filterTree?: FilterTree;
}

export interface UpdateSegmentParams {
  name?: string;
  filterTree?: FilterTree;
}

export interface ListSegmentsParams extends PaginationParams {
  [key: string]: string | number | boolean | undefined | null;
}

export interface SegmentPreviewResult {
  contacts: Contact[];
  total: number;
}

export class SegmentsResource {
  constructor(private readonly http: HttpClient) {}

  async create(params: CreateSegmentParams): Promise<Segment> {
    const res = await this.http.post<{ segment: Segment }>(
      "/api/v1/segments",
      params
    );
    return res.segment;
  }

  async list(params: ListSegmentsParams = {}): Promise<PaginatedResponse<Segment>> {
    return this.http.get<PaginatedResponse<Segment>>("/api/v1/segments", params);
  }

  async *listAll(params: ListSegmentsParams = {}): AsyncGenerator<Segment> {
    yield* paginate<Segment>(this.http, "/api/v1/segments", params);
  }

  async get(id: string): Promise<Segment> {
    const res = await this.http.get<{ segment: Segment }>(`/api/v1/segments/${id}`);
    return res.segment;
  }

  async update(id: string, params: UpdateSegmentParams): Promise<Segment> {
    const res = await this.http.patch<{ segment: Segment }>(
      `/api/v1/segments/${id}`,
      params
    );
    return res.segment;
  }

  async delete(id: string): Promise<void> {
    return this.http.delete<void>(`/api/v1/segments/${id}`);
  }

  async refresh(id: string): Promise<{ queued: boolean }> {
    return this.http.post<{ queued: boolean }>(`/api/v1/segments/${id}/refresh`);
  }

  async preview(id: string, limit = 20): Promise<SegmentPreviewResult> {
    return this.http.get<SegmentPreviewResult>(
      `/api/v1/segments/${id}/preview`,
      { limit }
    );
  }
}