import type { HttpClient } from "../http/http-client.js";
import type {
  Domain,
  DomainStatus,
  PaginatedResponse,
  PaginationParams,
} from "../types/index.js";

export interface ListDomainsParams extends PaginationParams {
  status?: DomainStatus;
  [key: string]: string | number | boolean | undefined | null;
}

export class DomainsResource {
  constructor(private readonly http: HttpClient) {}

  async create(domain: string): Promise<Domain> {
    const res = await this.http.post<Domain>("/api/v1/domains", { domain });
    return res;
  }

  async list(params: ListDomainsParams = {}): Promise<PaginatedResponse<Domain>> {
    return this.http.get<PaginatedResponse<Domain>>("/api/v1/domains", params);
  }

  async get(id: string): Promise<Domain> {
    return this.http.get<Domain>(`/api/v1/domains/${id}`);
  }

  async verify(id: string): Promise<{ status: "verifying" }> {
    return this.http.post<{ status: "verifying" }>(`/api/v1/domains/${id}/verify`);
  }

  async delete(id: string): Promise<void> {
    return this.http.delete<void>(`/api/v1/domains/${id}`);
  }
}
