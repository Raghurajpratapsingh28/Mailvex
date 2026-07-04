import { createError } from "./errors.js";

export interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
  query?: Record<string, string | number | boolean | undefined | null>;
}

export interface HttpClientConfig {
  baseUrl: string;
  apiKey: string;
  workspaceId: string;
  timeout?: number;
  userAgent?: string;
}

export class HttpClient {
  private baseUrl: string;
  private apiKey: string;
  private workspaceId: string;
  private timeout: number;
  private userAgent: string;

  constructor(config: HttpClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, "");
    this.apiKey = config.apiKey;
    this.workspaceId = config.workspaceId;
    this.timeout = config.timeout ?? 30_000;
    this.userAgent = config.userAgent ?? "@Mailvex/node/1.0.0";
  }

  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { method = "GET", body, headers = {}, query } = options;

    let url = `${this.baseUrl}${path}`;
    if (query) {
      const params = new URLSearchParams();
      for (const [k, v] of Object.entries(query)) {
        if (v !== undefined && v !== null) {
          params.set(k, String(v));
        }
      }
      const qs = params.toString();
      if (qs) url += `?${qs}`;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);

    try {
      const res = await fetch(url, {
        method,
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
          "x-workspace-id": this.workspaceId,
          "User-Agent": this.userAgent,
          ...headers,
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });

      clearTimeout(timer);

      if (res.status === 204) {
        return undefined as T;
      }

      const json = (await res.json().catch(() => null)) as Record<string, unknown> | null;

      if (!res.ok) {
        const retryAfter = res.headers.get("retry-after");
        const err = (json?.error ?? {}) as Record<string, unknown>;
        throw createError(
          res.status,
          (err.code as string) ?? "UNKNOWN_ERROR",
          (err.message as string) ?? `HTTP ${res.status}`,
          err.details as unknown[],
          err.requestId as string,
          retryAfter ? Number(retryAfter) : undefined
        );
      }

      return json as T;
    } catch (err) {
      clearTimeout(timer);
      if ((err as Error).name === "AbortError") {
        throw createError(408, "REQUEST_TIMEOUT", `Request timed out after ${this.timeout}ms`);
      }
      throw err;
    }
  }

  get<T>(path: string, query?: RequestOptions["query"]): Promise<T> {
    return this.request<T>(path, { method: "GET", query });
  }

  post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, { method: "POST", body });
  }

  patch<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, { method: "PATCH", body });
  }

  delete<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: "DELETE" });
  }
}
