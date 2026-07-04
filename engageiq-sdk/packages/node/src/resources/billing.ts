import type { HttpClient } from "../http/http-client.js";
import type {
  BillingInterval,
  Invoice,
  Plan,
  PaginatedResponse,
  PaginationParams,
  Subscription,
  UsageMetrics,
} from "../types/index.js";

export interface ListInvoicesParams extends PaginationParams {
  [key: string]: string | number | boolean | undefined | null;
}

export class BillingResource {
  constructor(private readonly http: HttpClient) {}

  async getSubscription(): Promise<Subscription> {
    return this.http.get<Subscription>("/api/v1/billing/subscription");
  }

  async getUsage(): Promise<UsageMetrics> {
    return this.http.get<UsageMetrics>("/api/v1/billing/usage");
  }

  async listInvoices(
    params: ListInvoicesParams = {}
  ): Promise<PaginatedResponse<Invoice>> {
    return this.http.get<PaginatedResponse<Invoice>>(
      "/api/v1/billing/invoices",
      params
    );
  }

  async createCheckout(
    plan: Exclude<Plan, "free">,
    billingInterval: BillingInterval
  ): Promise<{ checkoutUrl: string; sessionId: string }> {
    return this.http.post("/api/v1/billing/checkout", {
      plan,
      billingInterval,
    });
  }

  async getPortalUrl(): Promise<{ url: string }> {
    return this.http.post("/api/v1/billing/portal");
  }

  async cancelSubscription(): Promise<Subscription> {
    return this.http.post("/api/v1/billing/cancel");
  }

  async resumeSubscription(): Promise<Subscription> {
    return this.http.post("/api/v1/billing/resume");
  }

  async changePlan(
    plan: Exclude<Plan, "free">,
    billingInterval: BillingInterval
  ): Promise<Subscription> {
    return this.http.post("/api/v1/billing/change-plan", {
      plan,
      billingInterval,
    });
  }
}
