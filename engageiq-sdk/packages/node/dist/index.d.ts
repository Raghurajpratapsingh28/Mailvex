interface RequestOptions {
    method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
    body?: unknown;
    headers?: Record<string, string>;
    query?: Record<string, string | number | boolean | undefined | null>;
}
interface HttpClientConfig {
    baseUrl: string;
    apiKey: string;
    workspaceId: string;
    timeout?: number;
    userAgent?: string;
}
declare class HttpClient {
    private baseUrl;
    private apiKey;
    private workspaceId;
    private timeout;
    private userAgent;
    constructor(config: HttpClientConfig);
    request<T>(path: string, options?: RequestOptions): Promise<T>;
    get<T>(path: string, query?: RequestOptions["query"]): Promise<T>;
    post<T>(path: string, body?: unknown): Promise<T>;
    patch<T>(path: string, body?: unknown): Promise<T>;
    delete<T>(path: string): Promise<T>;
}

interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
}
interface PaginationParams {
    page?: number;
    pageSize?: number;
}
interface ErrorEnvelope {
    error: {
        code: string;
        message: string;
        details?: unknown[];
        requestId?: string;
    };
}
interface TokenPair {
    accessToken: string;
    refreshToken: string;
    tokenType: "Bearer";
    expiresIn: number;
}
interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    isEmailVerified: boolean;
    workspaces: WorkspaceMembership[];
}
interface WorkspaceMembership {
    id: string;
    slug: string;
    name: string;
    role: Role;
}
type Role = "owner" | "admin" | "member" | "viewer";
type WorkspaceStatus = "active" | "inactive" | "deleted";
type Plan = "free" | "starter" | "growth" | "pro" | "enterprise";
interface Workspace {
    id: string;
    name: string;
    slug: string;
    plan: Plan;
    status: WorkspaceStatus;
    version: number;
    metadata?: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
}
interface WorkspaceSettings {
    id: string;
    workspaceId: string;
    timezone: string;
    locale: string;
    branding: {
        logoUrl?: string;
        primaryColor?: string;
    };
    emailDefaults: {
        fromName?: string;
        fromEmail?: string;
        replyTo?: string;
    };
    featureFlags: Record<string, boolean>;
    webhookSettings: {
        url?: string;
        secret?: string;
        events?: string[];
    };
    createdAt: string;
    updatedAt: string;
}
interface WorkspaceMember {
    membershipId: string;
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    isActive: boolean;
    roleSlug: Role;
    invitedByUserId?: string;
    joinedAt: string;
}
type DomainStatus = "verifying" | "verified" | "failed" | "deleted";
interface DomainDnsRecord {
    type: string;
    host: string;
    value: string;
}
interface Domain {
    id: string;
    workspaceId: string;
    domain: string;
    sesIdentity: string;
    status: DomainStatus;
    dkimTokens: string[];
    dns: {
        spf: DomainDnsRecord;
        dkim: DomainDnsRecord[];
        dmarc: DomainDnsRecord;
    };
    verifiedAt?: string;
    createdAt: string;
    updatedAt: string;
}
type TemplateStatus = "draft" | "published" | "archived";
interface EmailTemplate {
    id: string;
    workspaceId: string;
    name: string;
    subject: string;
    htmlBody: string;
    textBody?: string;
    variables: Record<string, string>;
    status: TemplateStatus;
    version: number;
    createdAt: string;
    updatedAt: string;
}
type EmailStatus = "queued" | "sending" | "sent" | "failed" | "bounced";
interface EmailRecipient {
    email: string;
    name?: string;
}
interface EmailSend {
    sendId: string;
    status: EmailStatus;
    providerMessageId?: string;
    failureReason?: string;
    subject: string;
    senderEmail: string;
    recipientEmail: string;
    tags?: string[];
    createdAt: string;
    updatedAt: string;
}
type LifecycleStage = "lead" | "prospect" | "customer" | "churned" | "unqualified";
interface Contact {
    id: string;
    workspaceId: string;
    email?: string;
    anonymousId?: string;
    externalId?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    lifecycleStage?: LifecycleStage;
    leadScore?: number;
    properties?: Record<string, unknown>;
    source?: {
        channel?: string;
    };
    emailSuppressed: boolean;
    globallySuppressed: boolean;
    unsubscribed: boolean;
    tags: string[];
    deletedAt?: string;
    createdAt: string;
    updatedAt: string;
}
type SegmentType = "static" | "dynamic";
type SegmentStatus = "pending" | "computing" | "ready" | "failed";
type FilterOperator = "equals" | "not_equals" | "contains" | "starts_with" | "ends_with" | "greater_than" | "less_than" | "exists" | "not_exists" | "in" | "not_in" | "occurred_within_days";
interface FilterRule {
    field: string;
    operator: FilterOperator;
    value?: string | number | string[];
}
interface FilterTree {
    operator: "AND" | "OR";
    rules: (FilterRule | FilterTree)[];
}
interface Segment {
    id: string;
    workspaceId: string;
    name: string;
    type: SegmentType;
    filterTree?: FilterTree;
    contactCount: number;
    status: SegmentStatus;
    lastComputed?: string;
    createdAt: string;
    updatedAt: string;
}
type CampaignStatus = "draft" | "scheduled" | "sending" | "sent" | "failed" | "paused" | "cancelled";
interface Campaign {
    id: string;
    workspaceId: string;
    name: string;
    type: "regular";
    subject: string;
    previewText?: string;
    from: EmailRecipient;
    replyTo?: string;
    html: string;
    text?: string;
    templateId?: string;
    segmentId: string;
    status: CampaignStatus;
    scheduledAt?: string;
    sentAt?: string;
    recipientCount?: number;
    version: number;
    createdAt: string;
    updatedAt: string;
}
type WorkflowStatus = "draft" | "published" | "paused" | "archived";
type NodeType = "trigger" | "email" | "delay" | "end";
interface WorkflowNode {
    id: string;
    type: NodeType;
    config: Record<string, unknown>;
}
interface WorkflowEdge {
    from: string;
    to: string;
}
interface WorkflowGraph {
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
}
interface WorkflowExecutionStats {
    total: number;
    completed: number;
    failed: number;
    running: number;
}
interface Workflow {
    id: string;
    workspaceId: string;
    name: string;
    status: WorkflowStatus;
    graph: WorkflowGraph;
    executionStats: WorkflowExecutionStats;
    createdAt: string;
    updatedAt: string;
}
interface WorkflowExecution {
    id: string;
    workflowId: string;
    contactId: string;
    status: "running" | "completed" | "failed";
    currentNodeId?: string;
    startedAt: string;
    completedAt?: string;
}
type SubscriptionStatus = "trialing" | "active" | "past_due" | "unpaid" | "canceled" | "incomplete" | "incomplete_expired";
type BillingInterval = "monthly" | "yearly";
interface Subscription {
    plan: Plan;
    status: SubscriptionStatus;
    billingInterval?: BillingInterval;
    currentPeriodStart?: string;
    currentPeriodEnd?: string;
    cancelAtPeriodEnd: boolean;
    canceledAt?: string;
    trialEndsAt?: string;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
}
interface UsageMetrics {
    contacts: {
        used: number;
        limit: number;
    };
    emails: {
        used: number;
        limit: number;
    };
    events: {
        used: number;
        limit: number;
    };
    periodStart: string;
    periodEnd: string;
}
interface Invoice {
    id: string;
    amountDue: number;
    amountPaid: number;
    currency: string;
    status: string;
    hostedInvoiceUrl?: string;
    pdfUrl?: string;
    createdAt: string;
}

interface CreateContactParams {
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
    source?: {
        channel?: string;
    };
}
interface UpdateContactParams {
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
interface ListContactsParams extends PaginationParams {
    search?: string;
    tags?: string;
    lifecycleStage?: LifecycleStage;
    emailSuppressed?: boolean;
    unsubscribed?: boolean;
    fromDate?: string;
    toDate?: string;
    [key: string]: string | number | boolean | undefined | null;
}
interface BulkImportResult {
    imported: number;
    skipped: number;
}
declare class ContactsResource {
    private readonly http;
    constructor(http: HttpClient);
    create(params: CreateContactParams): Promise<Contact>;
    list(params?: ListContactsParams): Promise<PaginatedResponse<Contact>>;
    listAll(params?: ListContactsParams): AsyncGenerator<Contact>;
    get(id: string): Promise<Contact>;
    update(id: string, params: UpdateContactParams): Promise<Contact>;
    delete(id: string): Promise<void>;
    bulkImport(contacts: CreateContactParams[]): Promise<BulkImportResult>;
    suppress(id: string): Promise<Contact>;
    unsuppress(id: string): Promise<Contact>;
}

interface SendEmailParams {
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
interface SendEmailResult {
    sendId: string;
    status: "queued";
}
interface ListEmailsParams extends PaginationParams {
    status?: string;
    recipient?: string;
    fromDate?: string;
    toDate?: string;
    [key: string]: string | number | boolean | undefined | null;
}
interface CreateTemplateParams {
    name: string;
    subject: string;
    htmlBody: string;
    textBody?: string;
    variables?: Record<string, string>;
    publish?: boolean;
}
interface UpdateTemplateParams {
    subject?: string;
    htmlBody?: string;
    textBody?: string;
    variables?: Record<string, string>;
    publish?: boolean;
}
interface ListTemplatesParams extends PaginationParams {
    status?: TemplateStatus;
    search?: string;
    latestOnly?: boolean;
    [key: string]: string | number | boolean | undefined | null;
}
declare class TransactionalResource {
    private readonly http;
    constructor(http: HttpClient);
    send(params: SendEmailParams): Promise<SendEmailResult>;
    list(params?: ListEmailsParams): Promise<PaginatedResponse<EmailSend>>;
    get(sendId: string): Promise<EmailSend>;
    createTemplate(params: CreateTemplateParams): Promise<EmailTemplate>;
    listTemplates(params?: ListTemplatesParams): Promise<PaginatedResponse<EmailTemplate>>;
    listAllTemplates(params?: ListTemplatesParams): AsyncGenerator<EmailTemplate>;
    getTemplate(id: string): Promise<EmailTemplate>;
    updateTemplate(id: string, params: UpdateTemplateParams): Promise<EmailTemplate>;
    deleteTemplate(id: string): Promise<void>;
}

interface CreateCampaignParams {
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
interface UpdateCampaignParams {
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
interface ListCampaignsParams extends PaginationParams {
    status?: CampaignStatus;
    type?: string;
    search?: string;
    fromDate?: string;
    toDate?: string;
    [key: string]: string | number | boolean | undefined | null;
}
interface SendResult {
    campaignId: string;
    status: "sending";
    recipientCount: number;
}
declare class CampaignsResource {
    private readonly http;
    constructor(http: HttpClient);
    create(params: CreateCampaignParams): Promise<Campaign>;
    list(params?: ListCampaignsParams): Promise<PaginatedResponse<Campaign>>;
    listAll(params?: ListCampaignsParams): AsyncGenerator<Campaign>;
    get(id: string): Promise<Campaign>;
    update(id: string, params: UpdateCampaignParams): Promise<Campaign>;
    schedule(id: string, scheduledAt: string): Promise<Campaign>;
    send(id: string): Promise<SendResult>;
    pause(id: string): Promise<Campaign>;
    resume(id: string): Promise<Campaign>;
    delete(id: string): Promise<void>;
}

interface CreateSegmentParams {
    name: string;
    type: SegmentType;
    filterTree?: FilterTree;
}
interface UpdateSegmentParams {
    name?: string;
    filterTree?: FilterTree;
}
interface ListSegmentsParams extends PaginationParams {
    [key: string]: string | number | boolean | undefined | null;
}
interface SegmentPreviewResult {
    contacts: Contact[];
    total: number;
}
declare class SegmentsResource {
    private readonly http;
    constructor(http: HttpClient);
    create(params: CreateSegmentParams): Promise<Segment>;
    list(params?: ListSegmentsParams): Promise<PaginatedResponse<Segment>>;
    listAll(params?: ListSegmentsParams): AsyncGenerator<Segment>;
    get(id: string): Promise<Segment>;
    update(id: string, params: UpdateSegmentParams): Promise<Segment>;
    delete(id: string): Promise<void>;
    refresh(id: string): Promise<{
        queued: boolean;
    }>;
    preview(id: string, limit?: number): Promise<SegmentPreviewResult>;
}

interface CreateWorkflowParams {
    name: string;
    graph: WorkflowGraph;
}
interface UpdateWorkflowParams {
    name?: string;
    graph?: WorkflowGraph;
}
interface ListWorkflowsParams extends PaginationParams {
    [key: string]: string | number | boolean | undefined | null;
}
interface ListExecutionsParams extends PaginationParams {
    [key: string]: string | number | boolean | undefined | null;
}
declare class WorkflowsResource {
    private readonly http;
    constructor(http: HttpClient);
    create(params: CreateWorkflowParams): Promise<Workflow>;
    list(params?: ListWorkflowsParams): Promise<PaginatedResponse<Workflow>>;
    listAll(params?: ListWorkflowsParams): AsyncGenerator<Workflow>;
    get(id: string): Promise<Workflow>;
    update(id: string, params: UpdateWorkflowParams): Promise<Workflow>;
    publish(id: string): Promise<Workflow>;
    pause(id: string): Promise<Workflow>;
    resume(id: string): Promise<Workflow>;
    delete(id: string): Promise<void>;
    listExecutions(id: string, params?: ListExecutionsParams): Promise<PaginatedResponse<WorkflowExecution>>;
}

interface TrackEventParams {
    event: string;
    userId?: string;
    anonymousId?: string;
    properties?: Record<string, unknown>;
    timestamp?: string;
}
interface IdentifyParams {
    userId?: string;
    anonymousId?: string;
    traits?: Record<string, unknown>;
    timestamp?: string;
}
interface PageParams {
    userId?: string;
    anonymousId?: string;
    name?: string;
    properties?: Record<string, unknown>;
    timestamp?: string;
}
interface GroupParams {
    userId?: string;
    anonymousId?: string;
    groupId: string;
    traits?: Record<string, unknown>;
    timestamp?: string;
}
interface AliasParams {
    userId: string;
    previousId: string;
    timestamp?: string;
}
interface IngestResult {
    success: true;
    messageId: string;
}
declare class EventsResource {
    private readonly http;
    constructor(http: HttpClient);
    track(params: TrackEventParams): Promise<IngestResult>;
    identify(params: IdentifyParams): Promise<IngestResult>;
    page(params: PageParams): Promise<IngestResult>;
    group(params: GroupParams): Promise<IngestResult>;
    alias(params: AliasParams): Promise<IngestResult>;
}

interface ListDomainsParams extends PaginationParams {
    status?: DomainStatus;
    [key: string]: string | number | boolean | undefined | null;
}
declare class DomainsResource {
    private readonly http;
    constructor(http: HttpClient);
    create(domain: string): Promise<Domain>;
    list(params?: ListDomainsParams): Promise<PaginatedResponse<Domain>>;
    get(id: string): Promise<Domain>;
    verify(id: string): Promise<{
        status: "verifying";
    }>;
    delete(id: string): Promise<void>;
}

interface ListInvoicesParams extends PaginationParams {
    [key: string]: string | number | boolean | undefined | null;
}
declare class BillingResource {
    private readonly http;
    constructor(http: HttpClient);
    getSubscription(): Promise<Subscription>;
    getUsage(): Promise<UsageMetrics>;
    listInvoices(params?: ListInvoicesParams): Promise<PaginatedResponse<Invoice>>;
    createCheckout(plan: Exclude<Plan, "free">, billingInterval: BillingInterval): Promise<{
        checkoutUrl: string;
        sessionId: string;
    }>;
    getPortalUrl(): Promise<{
        url: string;
    }>;
    cancelSubscription(): Promise<Subscription>;
    resumeSubscription(): Promise<Subscription>;
    changePlan(plan: Exclude<Plan, "free">, billingInterval: BillingInterval): Promise<Subscription>;
}

interface MailvexConfig {
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
declare class Mailvex {
    readonly contacts: ContactsResource;
    readonly transactional: TransactionalResource;
    readonly campaigns: CampaignsResource;
    readonly segments: SegmentsResource;
    readonly workflows: WorkflowsResource;
    readonly events: EventsResource;
    readonly domains: DomainsResource;
    readonly billing: BillingResource;
    private readonly http;
    constructor(config: MailvexConfig);
}

declare class MailvexError extends Error {
    readonly code: string;
    readonly statusCode: number;
    readonly requestId?: string | undefined;
    readonly details?: unknown[] | undefined;
    constructor(message: string, code: string, statusCode: number, requestId?: string | undefined, details?: unknown[] | undefined);
}
declare class AuthenticationError extends MailvexError {
    constructor(message: string, code: string, requestId?: string);
}
declare class PermissionError extends MailvexError {
    constructor(message: string, code: string, requestId?: string);
}
declare class NotFoundError extends MailvexError {
    constructor(message: string, code: string, requestId?: string);
}
declare class ConflictError extends MailvexError {
    constructor(message: string, code: string, requestId?: string);
}
declare class ValidationError extends MailvexError {
    constructor(message: string, code: string, details?: unknown[], requestId?: string);
}
declare class RateLimitError extends MailvexError {
    readonly retryAfter?: number | undefined;
    constructor(message: string, retryAfter?: number | undefined, requestId?: string);
}
declare class InternalError extends MailvexError {
    constructor(message: string, code: string, requestId?: string);
}

export { type AliasParams, AuthenticationError, type BillingInterval, type BulkImportResult, type Campaign, type CampaignStatus, ConflictError, type Contact, type CreateCampaignParams, type CreateContactParams, type CreateSegmentParams, type CreateTemplateParams, type CreateWorkflowParams, type Domain, type DomainDnsRecord, type DomainStatus, type EmailRecipient, type EmailSend, type EmailStatus, type EmailTemplate, Mailvex, type MailvexConfig, MailvexError, type ErrorEnvelope, type FilterOperator, type FilterRule, type FilterTree, type GroupParams, type IdentifyParams, type IngestResult, InternalError, type Invoice, type LifecycleStage, type ListCampaignsParams, type ListContactsParams, type ListDomainsParams, type ListEmailsParams, type ListExecutionsParams, type ListInvoicesParams, type ListSegmentsParams, type ListTemplatesParams, type ListWorkflowsParams, type NodeType, NotFoundError, type PageParams, type PaginatedResponse, type PaginationParams, PermissionError, type Plan, RateLimitError, type Role, type Segment, type SegmentPreviewResult, type SegmentStatus, type SegmentType, type SendEmailParams, type SendEmailResult, type SendResult, type Subscription, type SubscriptionStatus, type TemplateStatus, type TokenPair, type TrackEventParams, type UpdateCampaignParams, type UpdateContactParams, type UpdateSegmentParams, type UpdateTemplateParams, type UpdateWorkflowParams, type UsageMetrics, type User, ValidationError, type Workflow, type WorkflowEdge, type WorkflowExecution, type WorkflowExecutionStats, type WorkflowGraph, type WorkflowNode, type WorkflowStatus, type Workspace, type WorkspaceMember, type WorkspaceMembership, type WorkspaceSettings, type WorkspaceStatus };
