export type SegmentType = "static" | "dynamic"
export type SegmentStatus = "pending" | "computing" | "ready" | "failed"

export type FilterOperator =
  | "equals" | "not_equals" | "contains" | "starts_with" | "ends_with"
  | "in" | "not_in" | "exists" | "not_exists"
  | "greater_than" | "less_than"
  | "occurred_within_days"

export type FilterRule = {
  id: string
  type: "rule"
  field: string
  operator: FilterOperator
  value: string
}

export type FilterGroup = {
  id: string
  type: "group"
  operator: "AND" | "OR"
  children: (FilterRule | FilterGroup)[]
}

export type FilterTree = FilterGroup

export type Segment = {
  id: string
  name: string
  type: SegmentType
  status: SegmentStatus
  contactCount: number
  filterTree?: FilterTree
  lastComputed: string | null
  createdAt: string
  createdBy: string
  updatedAt: string
}

export type ContactPreview = {
  id: string
  email: string
  firstName: string
  lastName: string
  lifecycleStage: string
}

// Field definitions for filter builder
export const FILTER_FIELDS = [
  { value: "email", label: "Email", type: "string" },
  { value: "lifecycleStage", label: "Lifecycle Stage", type: "string" },
  { value: "leadScore", label: "Lead Score", type: "number" },
  { value: "phone", label: "Phone", type: "string" },
  { value: "properties.plan", label: "Plan (property)", type: "custom" },
  { value: "properties.company", label: "Company (property)", type: "custom" },
  { value: "properties.country", label: "Country (property)", type: "custom" },
  { value: "event:Page Viewed", label: "Event: Page View", type: "event" },
  { value: "event:Purchase", label: "Event: Purchase", type: "event" },
  { value: "event:Signup", label: "Event: Signup", type: "event" },
] as const

export const OPERATORS_BY_TYPE: Record<string, { value: FilterOperator; label: string }[]> = {
  string: [
    { value: "equals", label: "equals" },
    { value: "not_equals", label: "not equals" },
    { value: "contains", label: "contains" },
    { value: "starts_with", label: "starts with" },
    { value: "ends_with", label: "ends with" },
    { value: "in", label: "in list" },
    { value: "not_in", label: "not in list" },
    { value: "exists", label: "exists" },
    { value: "not_exists", label: "not exists" },
  ],
  number: [
    { value: "equals", label: "equals" },
    { value: "not_equals", label: "not equals" },
    { value: "greater_than", label: "greater than" },
    { value: "less_than", label: "less than" },
    { value: "exists", label: "exists" },
    { value: "not_exists", label: "not exists" },
  ],
  custom: [
    { value: "equals", label: "equals" },
    { value: "not_equals", label: "not equals" },
    { value: "contains", label: "contains" },
    { value: "starts_with", label: "starts with" },
    { value: "ends_with", label: "ends with" },
    { value: "in", label: "in list" },
    { value: "not_in", label: "not in list" },
    { value: "greater_than", label: "greater than" },
    { value: "less_than", label: "less than" },
    { value: "exists", label: "exists" },
    { value: "not_exists", label: "not exists" },
  ],
  event: [
    { value: "occurred_within_days", label: "occurred within days" },
    { value: "exists", label: "exists" },
    { value: "not_exists", label: "not exists" },
  ],
}

function makeId() {
  return Math.random().toString(36).slice(2, 10)
}

export function makeEmptyRule(): FilterRule {
  return { id: makeId(), type: "rule", field: "email", operator: "equals", value: "" }
}

export function makeEmptyGroup(operator: "AND" | "OR" = "AND"): FilterGroup {
  return { id: makeId(), type: "group", operator, children: [makeEmptyRule()] }
}

export function getFieldType(field: string): string {
  const found = FILTER_FIELDS.find((f) => f.value === field)
  return found?.type ?? "string"
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export function formatRelative(iso: string | null): string {
  if (!iso) return "—"
  return relativeTime(iso)
}

export const initialSegments: Segment[] = [
  {
    id: "seg-001",
    name: "High Value Customers",
    type: "dynamic",
    status: "ready",
    contactCount: 540,
    lastComputed: new Date(Date.now() - 5 * 60000).toISOString(),
    createdAt: "2026-04-10T08:00:00Z",
    createdBy: "admin@Mailvex.com",
    updatedAt: "2026-05-20T10:00:00Z",
    filterTree: {
      id: "g1",
      type: "group",
      operator: "AND",
      children: [
        { id: "r1", type: "rule", field: "lifecycleStage", operator: "equals", value: "customer" },
        { id: "r2", type: "rule", field: "leadScore", operator: "greater_than", value: "80" },
      ],
    },
  },
  {
    id: "seg-002",
    name: "Inactive Subscriptions",
    type: "dynamic",
    status: "ready",
    contactCount: 310,
    lastComputed: new Date(Date.now() - 2 * 3600000).toISOString(),
    createdAt: "2026-04-15T09:00:00Z",
    createdBy: "admin@Mailvex.com",
    updatedAt: "2026-05-18T12:00:00Z",
    filterTree: {
      id: "g2",
      type: "group",
      operator: "AND",
      children: [
        { id: "r3", type: "rule", field: "lifecycleStage", operator: "equals", value: "subscriber" },
        { id: "r4", type: "rule", field: "event:Page Viewed", operator: "not_exists", value: "" },
      ],
    },
  },
  {
    id: "seg-003",
    name: "EU Contacts Only",
    type: "dynamic",
    status: "computing",
    contactCount: 220,
    lastComputed: new Date(Date.now() - 30 * 60000).toISOString(),
    createdAt: "2026-05-01T11:00:00Z",
    createdBy: "admin@Mailvex.com",
    updatedAt: "2026-05-26T14:00:00Z",
    filterTree: {
      id: "g3",
      type: "group",
      operator: "AND",
      children: [
        { id: "r5", type: "rule", field: "properties.country", operator: "in", value: "DE,FR,NL,ES,IT" },
      ],
    },
  },
  {
    id: "seg-004",
    name: "Free Plan Users",
    type: "dynamic",
    status: "pending",
    contactCount: 0,
    lastComputed: null,
    createdAt: "2026-05-25T08:00:00Z",
    createdBy: "admin@Mailvex.com",
    updatedAt: "2026-05-25T08:00:00Z",
    filterTree: {
      id: "g4",
      type: "group",
      operator: "AND",
      children: [
        { id: "r6", type: "rule", field: "properties.plan", operator: "equals", value: "free" },
      ],
    },
  },
  {
    id: "seg-005",
    name: "VIP Beta Testers",
    type: "static",
    status: "ready",
    contactCount: 48,
    lastComputed: new Date(Date.now() - 24 * 3600000).toISOString(),
    createdAt: "2026-03-20T10:00:00Z",
    createdBy: "admin@Mailvex.com",
    updatedAt: "2026-05-10T09:00:00Z",
  },
  {
    id: "seg-006",
    name: "Churned Leads",
    type: "dynamic",
    status: "failed",
    contactCount: 0,
    lastComputed: new Date(Date.now() - 3 * 3600000).toISOString(),
    createdAt: "2026-05-05T14:00:00Z",
    createdBy: "admin@Mailvex.com",
    updatedAt: "2026-05-26T11:00:00Z",
    filterTree: {
      id: "g5",
      type: "group",
      operator: "AND",
      children: [
        { id: "r7", type: "rule", field: "lifecycleStage", operator: "equals", value: "churned" },
      ],
    },
  },
]

export const mockContactPreviews: ContactPreview[] = [
  { id: "c1", email: "alice@acme.com", firstName: "Alice", lastName: "Johnson", lifecycleStage: "customer" },
  { id: "c2", email: "bob@techcorp.io", firstName: "Bob", lastName: "Smith", lifecycleStage: "lead" },
  { id: "c3", email: "carol@startup.co", firstName: "Carol", lastName: "Williams", lifecycleStage: "subscriber" },
  { id: "c4", email: "dave@enterprise.com", firstName: "Dave", lastName: "Brown", lifecycleStage: "customer" },
  { id: "c5", email: "eve@agency.net", firstName: "Eve", lastName: "Davis", lifecycleStage: "lead" },
]
