// src/http/errors.ts
var MailvexError = class extends Error {
  constructor(message, code, statusCode, requestId, details) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.requestId = requestId;
    this.details = details;
    this.name = "MailvexError";
  }
};
var AuthenticationError = class extends MailvexError {
  constructor(message, code, requestId) {
    super(message, code, 401, requestId);
    this.name = "AuthenticationError";
  }
};
var PermissionError = class extends MailvexError {
  constructor(message, code, requestId) {
    super(message, code, 403, requestId);
    this.name = "PermissionError";
  }
};
var NotFoundError = class extends MailvexError {
  constructor(message, code, requestId) {
    super(message, code, 404, requestId);
    this.name = "NotFoundError";
  }
};
var ConflictError = class extends MailvexError {
  constructor(message, code, requestId) {
    super(message, code, 409, requestId);
    this.name = "ConflictError";
  }
};
var ValidationError = class extends MailvexError {
  constructor(message, code, details, requestId) {
    super(message, code, 400, requestId, details);
    this.name = "ValidationError";
  }
};
var RateLimitError = class extends MailvexError {
  constructor(message, retryAfter, requestId) {
    super(message, "RATE_LIMITED", 429, requestId);
    this.retryAfter = retryAfter;
    this.name = "RateLimitError";
  }
};
var InternalError = class extends MailvexError {
  constructor(message, code, requestId) {
    super(message, code, 500, requestId);
    this.name = "InternalError";
  }
};
function createError(statusCode, code, message, details, requestId, retryAfter) {
  switch (statusCode) {
    case 400:
      return new ValidationError(message, code, details, requestId);
    case 401:
      return new AuthenticationError(message, code, requestId);
    case 403:
      return new PermissionError(message, code, requestId);
    case 404:
      return new NotFoundError(message, code, requestId);
    case 409:
      return new ConflictError(message, code, requestId);
    case 429:
      return new RateLimitError(message, retryAfter, requestId);
    default:
      return new MailvexError(message, code, statusCode, requestId, details);
  }
}

// src/http/http-client.ts
var HttpClient = class {
  constructor(config) {
    this.baseUrl = config.baseUrl.replace(/\/$/, "");
    this.apiKey = config.apiKey;
    this.workspaceId = config.workspaceId;
    this.timeout = config.timeout ?? 3e4;
    this.userAgent = config.userAgent ?? "@Mailvex/node/1.0.0";
  }
  async request(path, options = {}) {
    const { method = "GET", body, headers = {}, query } = options;
    let url = `${this.baseUrl}${path}`;
    if (query) {
      const params = new URLSearchParams();
      for (const [k, v] of Object.entries(query)) {
        if (v !== void 0 && v !== null) {
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
          ...headers
        },
        body: body !== void 0 ? JSON.stringify(body) : void 0
      });
      clearTimeout(timer);
      if (res.status === 204) {
        return void 0;
      }
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        const retryAfter = res.headers.get("retry-after");
        const err = json?.error ?? {};
        throw createError(
          res.status,
          err.code ?? "UNKNOWN_ERROR",
          err.message ?? `HTTP ${res.status}`,
          err.details,
          err.requestId,
          retryAfter ? Number(retryAfter) : void 0
        );
      }
      return json;
    } catch (err) {
      clearTimeout(timer);
      if (err.name === "AbortError") {
        throw createError(408, "REQUEST_TIMEOUT", `Request timed out after ${this.timeout}ms`);
      }
      throw err;
    }
  }
  get(path, query) {
    return this.request(path, { method: "GET", query });
  }
  post(path, body) {
    return this.request(path, { method: "POST", body });
  }
  patch(path, body) {
    return this.request(path, { method: "PATCH", body });
  }
  delete(path) {
    return this.request(path, { method: "DELETE" });
  }
};

// src/utils/pagination.ts
async function* paginate(client, path, params = {}) {
  let page = params.page ?? 1;
  const pageSize = params.pageSize ?? 50;
  while (true) {
    const res = await client.get(path, {
      ...params,
      page,
      pageSize
    });
    for (const item of res.items) {
      yield item;
    }
    if (page * pageSize >= res.total) break;
    page++;
  }
}

// src/resources/contacts.ts
var ContactsResource = class {
  constructor(http) {
    this.http = http;
  }
  async create(params) {
    const res = await this.http.post(
      "/api/v1/contacts",
      params
    );
    return res.contact;
  }
  async list(params = {}) {
    return this.http.get("/api/v1/contacts", params);
  }
  async *listAll(params = {}) {
    yield* paginate(this.http, "/api/v1/contacts", params);
  }
  async get(id) {
    const res = await this.http.get(`/api/v1/contacts/${id}`);
    return res.contact;
  }
  async update(id, params) {
    const res = await this.http.patch(
      `/api/v1/contacts/${id}`,
      params
    );
    return res.contact;
  }
  async delete(id) {
    return this.http.delete(`/api/v1/contacts/${id}`);
  }
  async bulkImport(contacts) {
    return this.http.post("/api/v1/contacts/bulk-import", {
      contacts
    });
  }
  async suppress(id) {
    const res = await this.http.post(
      `/api/v1/contacts/${id}/suppress`
    );
    return res.contact;
  }
  async unsuppress(id) {
    const res = await this.http.post(
      `/api/v1/contacts/${id}/unsuppress`
    );
    return res.contact;
  }
};

// src/resources/transactional.ts
var TransactionalResource = class {
  constructor(http) {
    this.http = http;
  }
  async send(params) {
    return this.http.post("/api/v1/emails/send", params);
  }
  async list(params = {}) {
    return this.http.get("/api/v1/emails", params);
  }
  async get(sendId) {
    return this.http.get(`/api/v1/emails/${sendId}`);
  }
  // ─── Templates ─────────────────────────────────────────────────────────────
  async createTemplate(params) {
    const res = await this.http.post(
      "/api/v1/email-templates",
      params
    );
    return res.template;
  }
  async listTemplates(params = {}) {
    return this.http.get(
      "/api/v1/email-templates",
      params
    );
  }
  async *listAllTemplates(params = {}) {
    yield* paginate(
      this.http,
      "/api/v1/email-templates",
      params
    );
  }
  async getTemplate(id) {
    return this.http.get(`/api/v1/email-templates/${id}`);
  }
  async updateTemplate(id, params) {
    const res = await this.http.patch(
      `/api/v1/email-templates/${id}`,
      params
    );
    return res.template;
  }
  async deleteTemplate(id) {
    return this.http.delete(`/api/v1/email-templates/${id}`);
  }
};

// src/resources/campaigns.ts
var CampaignsResource = class {
  constructor(http) {
    this.http = http;
  }
  async create(params) {
    const res = await this.http.post(
      "/api/v1/campaigns",
      { ...params, type: params.type ?? "regular" }
    );
    return res.campaign;
  }
  async list(params = {}) {
    return this.http.get("/api/v1/campaigns", params);
  }
  async *listAll(params = {}) {
    yield* paginate(this.http, "/api/v1/campaigns", params);
  }
  async get(id) {
    const res = await this.http.get(`/api/v1/campaigns/${id}`);
    return res.campaign;
  }
  async update(id, params) {
    const res = await this.http.patch(
      `/api/v1/campaigns/${id}`,
      params
    );
    return res.campaign;
  }
  async schedule(id, scheduledAt) {
    const res = await this.http.post(
      `/api/v1/campaigns/${id}/schedule`,
      { scheduledAt }
    );
    return res.campaign;
  }
  async send(id) {
    return this.http.post(`/api/v1/campaigns/${id}/send`);
  }
  async pause(id) {
    const res = await this.http.post(
      `/api/v1/campaigns/${id}/pause`
    );
    return res.campaign;
  }
  async resume(id) {
    const res = await this.http.post(
      `/api/v1/campaigns/${id}/resume`
    );
    return res.campaign;
  }
  async delete(id) {
    return this.http.delete(`/api/v1/campaigns/${id}`);
  }
};

// src/resources/segments.ts
var SegmentsResource = class {
  constructor(http) {
    this.http = http;
  }
  async create(params) {
    const res = await this.http.post(
      "/api/v1/segments",
      params
    );
    return res.segment;
  }
  async list(params = {}) {
    return this.http.get("/api/v1/segments", params);
  }
  async *listAll(params = {}) {
    yield* paginate(this.http, "/api/v1/segments", params);
  }
  async get(id) {
    const res = await this.http.get(`/api/v1/segments/${id}`);
    return res.segment;
  }
  async update(id, params) {
    const res = await this.http.patch(
      `/api/v1/segments/${id}`,
      params
    );
    return res.segment;
  }
  async delete(id) {
    return this.http.delete(`/api/v1/segments/${id}`);
  }
  async refresh(id) {
    return this.http.post(`/api/v1/segments/${id}/refresh`);
  }
  async preview(id, limit = 20) {
    return this.http.get(
      `/api/v1/segments/${id}/preview`,
      { limit }
    );
  }
};

// src/resources/workflows.ts
var WorkflowsResource = class {
  constructor(http) {
    this.http = http;
  }
  async create(params) {
    const res = await this.http.post(
      "/api/v1/workflows",
      params
    );
    return res.workflow;
  }
  async list(params = {}) {
    return this.http.get("/api/v1/workflows", params);
  }
  async *listAll(params = {}) {
    yield* paginate(this.http, "/api/v1/workflows", params);
  }
  async get(id) {
    const res = await this.http.get(`/api/v1/workflows/${id}`);
    return res.workflow;
  }
  async update(id, params) {
    const res = await this.http.patch(
      `/api/v1/workflows/${id}`,
      params
    );
    return res.workflow;
  }
  async publish(id) {
    const res = await this.http.post(
      `/api/v1/workflows/${id}/publish`
    );
    return res.workflow;
  }
  async pause(id) {
    const res = await this.http.post(
      `/api/v1/workflows/${id}/pause`
    );
    return res.workflow;
  }
  async resume(id) {
    const res = await this.http.post(
      `/api/v1/workflows/${id}/resume`
    );
    return res.workflow;
  }
  async delete(id) {
    return this.http.delete(`/api/v1/workflows/${id}`);
  }
  async listExecutions(id, params = {}) {
    return this.http.get(
      `/api/v1/workflows/${id}/executions`,
      params
    );
  }
};

// src/resources/events.ts
var EventsResource = class {
  constructor(http) {
    this.http = http;
  }
  async track(params) {
    return this.http.post("/api/v1/track", params);
  }
  async identify(params) {
    return this.http.post("/api/v1/identify", params);
  }
  async page(params) {
    return this.http.post("/api/v1/page", params);
  }
  async group(params) {
    return this.http.post("/api/v1/group", params);
  }
  async alias(params) {
    return this.http.post("/api/v1/alias", params);
  }
};

// src/resources/domains.ts
var DomainsResource = class {
  constructor(http) {
    this.http = http;
  }
  async create(domain) {
    const res = await this.http.post("/api/v1/domains", { domain });
    return res;
  }
  async list(params = {}) {
    return this.http.get("/api/v1/domains", params);
  }
  async get(id) {
    return this.http.get(`/api/v1/domains/${id}`);
  }
  async verify(id) {
    return this.http.post(`/api/v1/domains/${id}/verify`);
  }
  async delete(id) {
    return this.http.delete(`/api/v1/domains/${id}`);
  }
};

// src/resources/billing.ts
var BillingResource = class {
  constructor(http) {
    this.http = http;
  }
  async getSubscription() {
    return this.http.get("/api/v1/billing/subscription");
  }
  async getUsage() {
    return this.http.get("/api/v1/billing/usage");
  }
  async listInvoices(params = {}) {
    return this.http.get(
      "/api/v1/billing/invoices",
      params
    );
  }
  async createCheckout(plan, billingInterval) {
    return this.http.post("/api/v1/billing/checkout", {
      plan,
      billingInterval
    });
  }
  async getPortalUrl() {
    return this.http.post("/api/v1/billing/portal");
  }
  async cancelSubscription() {
    return this.http.post("/api/v1/billing/cancel");
  }
  async resumeSubscription() {
    return this.http.post("/api/v1/billing/resume");
  }
  async changePlan(plan, billingInterval) {
    return this.http.post("/api/v1/billing/change-plan", {
      plan,
      billingInterval
    });
  }
};

// src/client.ts
var Mailvex = class {
  constructor(config) {
    if (!config.apiKey) throw new Error("Mailvex: apiKey is required");
    if (!config.workspaceId) throw new Error("Mailvex: workspaceId is required");
    this.http = new HttpClient({
      baseUrl: config.baseUrl ?? "https://api.Mailvex.dev",
      apiKey: config.apiKey,
      workspaceId: config.workspaceId,
      timeout: config.timeout
    });
    this.contacts = new ContactsResource(this.http);
    this.transactional = new TransactionalResource(this.http);
    this.campaigns = new CampaignsResource(this.http);
    this.segments = new SegmentsResource(this.http);
    this.workflows = new WorkflowsResource(this.http);
    this.events = new EventsResource(this.http);
    this.domains = new DomainsResource(this.http);
    this.billing = new BillingResource(this.http);
  }
};

export { AuthenticationError, ConflictError, Mailvex, MailvexError, InternalError, NotFoundError, PermissionError, RateLimitError, ValidationError };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map