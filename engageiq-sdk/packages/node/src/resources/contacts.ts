import type { HttpClient } from "../http/http-client.js";
import type {
  Contact,
  LifecycleStage,
  PaginatedResponse,
  PaginationParams,
} from "../types/index.js";
import { paginate } from "../utils/pagination.js";

export interface CreateContactParams {
  email?: string;
  anonymousId?: string;
  externalId?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  lifecycleStage?: LifecycleStage;
  leadScore?: number;
  tags?: string[];
  properties?: Record<string, unknown>;
  source?: { channel?: string };
}

export interface UpdateContactParams {
  firstName?: string;
  lastName?: string;
  phone?: string;
  lifecycleStage?: LifecycleStage;
  leadScore?: number;
  tags?: string[];
  properties?: Record<string, unknown>;
  emailSuppressed?: boolean;
  unsubscribed?: boolean;
}

export interface ListContactsParams extends PaginationParams {
  search?: string;
  tags?: string;
  lifecycleStage?: LifecycleStage;
  emailSuppressed?: boolean;
  unsubscribed?: boolean;
  fromDate?: string;
  toDate?: string;
  [key: string]: string | number | boolean | undefined | null;
}

export interface BulkImportResult {
  imported: number;
  skipped: number;
}

export class ContactsResource {
  constructor(private readonly http: HttpClient) {}

  async create(params: CreateContactParams): Promise<Contact> {
    const res = await this.http.post<{ contact: Contact }>(
      "/api/v1/contacts",
      params
    );
    return res.contact;
  }

  async list(params: ListContactsParams = {}): Promise<PaginatedResponse<Contact>> {
    return this.http.get<PaginatedResponse<Contact>>("/api/v1/contacts", params);
  }

  async *listAll(params: ListContactsParams = {}): AsyncGenerator<Contact> {
    yield* paginate<Contact>(this.http, "/api/v1/contacts", params);
  }

  async get(id: string): Promise<Contact> {
    const res = await this.http.get<{ contact: Contact }>(`/api/v1/contacts/${id}`);
    return res.contact;
  }

  async update(id: string, params: UpdateContactParams): Promise<Contact> {
    const res = await this.http.patch<{ contact: Contact }>(
      `/api/v1/contacts/${id}`,
      params
    );
    return res.contact;
  }

  async delete(id: string): Promise<void> {
    return this.http.delete<void>(`/api/v1/contacts/${id}`);
  }

  async bulkImport(contacts: CreateContactParams[]): Promise<BulkImportResult> {
    return this.http.post<BulkImportResult>("/api/v1/contacts/bulk-import", {
      contacts,
    });
  }

  async suppress(id: string): Promise<Contact> {
    const res = await this.http.post<{ contact: Contact }>(
      `/api/v1/contacts/${id}/suppress`
    );
    return res.contact;
  }

  async unsuppress(id: string): Promise<Contact> {
    const res = await this.http.post<{ contact: Contact }>(
      `/api/v1/contacts/${id}/unsuppress`
    );
    return res.contact;
  }
}