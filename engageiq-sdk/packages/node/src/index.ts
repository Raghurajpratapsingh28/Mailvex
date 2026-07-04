export { Mailvex } from "./client.js";
export type { MailvexConfig } from "./client.js";

// Error classes
export {
  MailvexError,
  AuthenticationError,
  PermissionError,
  NotFoundError,
  ConflictError,
  ValidationError,
  RateLimitError,
  InternalError,
} from "./http/errors.js";

// All types
export type {
  // Shared
  PaginatedResponse,
  PaginationParams,
  ErrorEnvelope,
  TokenPair,
  // User / Auth
  User,
  WorkspaceMembership,
  Role,
  // Workspace
  Workspace,
  WorkspaceStatus,
  WorkspaceSettings,
  WorkspaceMember,
  Plan,
  // Domain
  Domain,
  DomainStatus,
  DomainDnsRecord,
  // Email
  EmailTemplate,
  TemplateStatus,
  EmailSend,
  EmailStatus,
  EmailRecipient,
  // Contact
  Contact,
  LifecycleStage,
  // Segment
  Segment,
  SegmentType,
  SegmentStatus,
  FilterTree,
  FilterRule,
  FilterOperator,
  // Campaign
  Campaign,
  CampaignStatus,
  // Workflow
  Workflow,
  WorkflowStatus,
  WorkflowGraph,
  WorkflowNode,
  WorkflowEdge,
  WorkflowExecution,
  WorkflowExecutionStats,
  NodeType,
  // Billing
  Subscription,
  SubscriptionStatus,
  BillingInterval,
  UsageMetrics,
  Invoice,
} from "./types/index.js";

// Resource param types
export type {
  CreateContactParams,
  UpdateContactParams,
  ListContactsParams,
  BulkImportResult,
} from "./resources/contacts.js";

export type {
  SendEmailParams,
  SendEmailResult,
  ListEmailsParams,
  CreateTemplateParams,
  UpdateTemplateParams,
  ListTemplatesParams,
} from "./resources/transactional.js";

export type {
  CreateCampaignParams,
  UpdateCampaignParams,
  ListCampaignsParams,
  SendResult,
} from "./resources/campaigns.js";

export type {
  CreateSegmentParams,
  UpdateSegmentParams,
  ListSegmentsParams,
  SegmentPreviewResult,
} from "./resources/segments.js";

export type {
  CreateWorkflowParams,
  UpdateWorkflowParams,
  ListWorkflowsParams,
  ListExecutionsParams,
} from "./resources/workflows.js";

export type {
  TrackEventParams,
  IdentifyParams,
  PageParams,
  GroupParams,
  AliasParams,
  IngestResult,
} from "./resources/events.js";

export type { ListDomainsParams } from "./resources/domains.js";
export type { ListInvoicesParams } from "./resources/billing.js";