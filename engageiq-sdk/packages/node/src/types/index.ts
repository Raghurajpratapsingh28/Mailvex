// ─── Shared ───────────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface ErrorEnvelope {
  error: {
    code: string;
    message: string;
    details?: unknown[];
    requestId?: string;
  };
}

// ─── Auth / User ──────────────────────────────────────────────────────────────

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  tokenType: "Bearer";
  expiresIn: number;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isEmailVerified: boolean;
  workspaces: WorkspaceMembership[];
}

export interface WorkspaceMembership {
  id: string;
  slug: string;
  name: string;
  role: Role;
}

export type Role = "owner" | "admin" | "member" | "viewer";

// ─── Workspace ────────────────────────────────────────────────────────────────

export type WorkspaceStatus = "active" | "inactive" | "deleted";
export type Plan = "free" | "starter" | "growth" | "pro" | "enterprise";

export interface Workspace {
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

export interface WorkspaceSettings {
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

export interface WorkspaceMember {
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

// ─── Domain ───────────────────────────────────────────────────────────────────

export type DomainStatus = "verifying" | "verified" | "failed" | "deleted";

export interface DomainDnsRecord {
  type: string;
  host: string;
  value: string;
}

export interface Domain {
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

// ─── Email Templates ──────────────────────────────────────────────────────────

export type TemplateStatus = "draft" | "published" | "archived";

export interface EmailTemplate {
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

// ─── Transactional Email ──────────────────────────────────────────────────────

export type EmailStatus = "queued" | "sending" | "sent" | "failed" | "bounced";

export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface EmailSend {
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

// ─── Contacts ─────────────────────────────────────────────────────────────────

export type LifecycleStage =
  | "lead"
  | "prospect"
  | "customer"
  | "churned"
  | "unqualified";

export interface Contact {
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

// ─── Segments ─────────────────────────────────────────────────────────────────

export type SegmentType = "static" | "dynamic";
export type SegmentStatus = "pending" | "computing" | "ready" | "failed";

export type FilterOperator =
  | "equals"
  | "not_equals"
  | "contains"
  | "starts_with"
  | "ends_with"
  | "greater_than"
  | "less_than"
  | "exists"
  | "not_exists"
  | "in"
  | "not_in"
  | "occurred_within_days";

export interface FilterRule {
  field: string;
  operator: FilterOperator;
  value?: string | number | string[];
}

export interface FilterTree {
  operator: "AND" | "OR";
  rules: (FilterRule | FilterTree)[];
}

export interface Segment {
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

// ─── Campaigns ────────────────────────────────────────────────────────────────

export type CampaignStatus =
  | "draft"
  | "scheduled"
  | "sending"
  | "sent"
  | "failed"
  | "paused"
  | "cancelled";

export interface Campaign {
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

// ─── Workflows ────────────────────────────────────────────────────────────────

export type WorkflowStatus = "draft" | "published" | "paused" | "archived";
export type NodeType = "trigger" | "email" | "delay" | "end";

export interface WorkflowNode {
  id: string;
  type: NodeType;
  config: Record<string, unknown>;
}

export interface WorkflowEdge {
  from: string;
  to: string;
}

export interface WorkflowGraph {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export interface WorkflowExecutionStats {
  total: number;
  completed: number;
  failed: number;
  running: number;
}

export interface Workflow {
  id: string;
  workspaceId: string;
  name: string;
  status: WorkflowStatus;
  graph: WorkflowGraph;
  executionStats: WorkflowExecutionStats;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  contactId: string;
  status: "running" | "completed" | "failed";
  currentNodeId?: string;
  startedAt: string;
  completedAt?: string;
}

// ─── Billing ──────────────────────────────────────────────────────────────────

export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "unpaid"
  | "canceled"
  | "incomplete"
  | "incomplete_expired";

export type BillingInterval = "monthly" | "yearly";

export interface Subscription {
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

export interface UsageMetrics {
  contacts: { used: number; limit: number };
  emails: { used: number; limit: number };
  events: { used: number; limit: number };
  periodStart: string;
  periodEnd: string;
}

export interface Invoice {
  id: string;
  amountDue: number;
  amountPaid: number;
  currency: string;
  status: string;
  hostedInvoiceUrl?: string;
  pdfUrl?: string;
  createdAt: string;
}
