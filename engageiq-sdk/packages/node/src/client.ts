import { HttpClient } from "./http/http-client.js";
import { ContactsResource } from "./resources/contacts.js";
import { TransactionalResource } from "./resources/transactional.js";
import { CampaignsResource } from "./resources/campaigns.js";
import { SegmentsResource } from "./resources/segments.js";
import { WorkflowsResource } from "./resources/workflows.js";
import { EventsResource } from "./resources/events.js";
import { DomainsResource } from "./resources/domains.js";
import { BillingResource } from "./resources/billing.js";

export interface MailvexConfig {
  /**
   * Your API key. Generate one in the Mailvex dashboard under
   * Settings → API Keys.
   */
  apiKey: string;

  /**
   * The workspace ID to scope all requests to.
   */
  workspaceId: string;

  /**
   * Override the base URL. Defaults to https://api.Mailvex.dev
   */
  baseUrl?: string;

  /**
   * Request timeout in milliseconds. Defaults to 30000.
   */
  timeout?: number;
}

export class Mailvex {
  readonly contacts: ContactsResource;
  readonly transactional: TransactionalResource;
  readonly campaigns: CampaignsResource;
  readonly segments: SegmentsResource;
  readonly workflows: WorkflowsResource;
  readonly events: EventsResource;
  readonly domains: DomainsResource;
  readonly billing: BillingResource;

  private readonly http: HttpClient;

  constructor(config: MailvexConfig) {
    if (!config.apiKey) throw new Error("Mailvex: apiKey is required");
    if (!config.workspaceId) throw new Error("Mailvex: workspaceId is required");

    this.http = new HttpClient({
      baseUrl: config.baseUrl ?? "https://api.Mailvex.dev",
      apiKey: config.apiKey,
      workspaceId: config.workspaceId,
      timeout: config.timeout,
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
}