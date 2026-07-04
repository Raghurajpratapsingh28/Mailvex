import type { HttpClient } from "../http/http-client.js";

export interface TrackEventParams {
  event: string;
  userId?: string;
  anonymousId?: string;
  properties?: Record<string, unknown>;
  timestamp?: string;
}

export interface IdentifyParams {
  userId?: string;
  anonymousId?: string;
  traits?: Record<string, unknown>;
  timestamp?: string;
}

export interface PageParams {
  userId?: string;
  anonymousId?: string;
  name?: string;
  properties?: Record<string, unknown>;
  timestamp?: string;
}

export interface GroupParams {
  userId?: string;
  anonymousId?: string;
  groupId: string;
  traits?: Record<string, unknown>;
  timestamp?: string;
}

export interface AliasParams {
  userId: string;
  previousId: string;
  timestamp?: string;
}

export interface IngestResult {
  success: true;
  messageId: string;
}

export class EventsResource {
  constructor(private readonly http: HttpClient) {}

  async track(params: TrackEventParams): Promise<IngestResult> {
    return this.http.post<IngestResult>("/api/v1/track", params);
  }

  async identify(params: IdentifyParams): Promise<IngestResult> {
    return this.http.post<IngestResult>("/api/v1/identify", params);
  }

  async page(params: PageParams): Promise<IngestResult> {
    return this.http.post<IngestResult>("/api/v1/page", params);
  }

  async group(params: GroupParams): Promise<IngestResult> {
    return this.http.post<IngestResult>("/api/v1/group", params);
  }

  async alias(params: AliasParams): Promise<IngestResult> {
    return this.http.post<IngestResult>("/api/v1/alias", params);
  }
}