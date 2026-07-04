export type MemberRole = "owner" | "admin" | "member" | "viewer"

export const ROLE_WEIGHT: Record<MemberRole, number> = {
  owner: 100, admin: 75, member: 50, viewer: 25,
}

export const ROLE_META: Record<MemberRole, { label: string; cls: string }> = {
  owner:  { label: "Owner",  cls: "bg-[#8B5CF6]/10 border-[#8B5CF6]/25 text-[#A78BFA]" },
  admin:  { label: "Admin",  cls: "bg-blue-500/10 border-blue-500/25 text-blue-400" },
  member: { label: "Member", cls: "bg-emerald-500/10 border-emerald-500/25 text-emerald-400" },
  viewer: { label: "Viewer", cls: "bg-zinc-500/10 border-zinc-500/25 text-zinc-400" },
}

export type WorkspaceMember = {
  id: string
  email: string
  firstName: string
  lastName: string
  role: MemberRole
  joinedAt: string
  isActive: boolean
}

export type WorkspaceSettings = {
  name: string
  slug: string
  timezone: string
  locale: string
  logoUrl: string
  primaryColor: string
  defaultFromName: string
  defaultFromEmail: string
  defaultReplyTo: string
  webhookUrl: string
  webhookSecret: string
  webhookEvents: string[]
  metadata: Record<string, string>
  isActive: boolean
}

export const WEBHOOK_EVENTS = [
  "campaign.sent", "campaign.failed",
  "contact.created", "contact.updated", "contact.deleted",
  "segment.computed", "workflow.completed", "workflow.failed",
  "email.bounced", "email.opened",
]

export const TIMEZONES = [
  "UTC", "America/New_York", "America/Los_Angeles", "America/Chicago",
  "Europe/London", "Europe/Paris", "Europe/Berlin",
  "Asia/Kolkata", "Asia/Tokyo", "Asia/Singapore", "Australia/Sydney",
]

export const LOCALES = ["en-US", "en-GB", "fr-FR", "de-DE", "es-ES", "ja-JP", "zh-CN"]

export const VERIFIED_DOMAINS = ["hello@Mailvex.com", "noreply@Mailvex.com", "outreach@Mailvex.com"]

// Current user — in real app from auth context
export const CURRENT_USER_ID = "mem-001"
export const CURRENT_USER_ROLE: MemberRole = "owner"

export const mockSettings: WorkspaceSettings = {
  name: "Mailvex Workspace",
  slug: "Mailvex",
  timezone: "Asia/Kolkata",
  locale: "en-US",
  logoUrl: "",
  primaryColor: "#8B5CF6",
  defaultFromName: "Mailvex Team",
  defaultFromEmail: "hello@Mailvex.com",
  defaultReplyTo: "",
  webhookUrl: "https://hooks.example.com/Mailvex",
  webhookSecret: "whsec_supersecretkey1234",
  webhookEvents: ["campaign.sent", "contact.created"],
  metadata: { industry: "SaaS", region: "APAC" },
  isActive: true,
}

export const mockMembers: WorkspaceMember[] = [
  { id: "mem-001", email: "admin@Mailvex.com", firstName: "Raghu", lastName: "Pratap", role: "owner", joinedAt: "2026-01-01T00:00:00Z", isActive: true },
  { id: "mem-002", email: "alice@Mailvex.com", firstName: "Alice", lastName: "Johnson", role: "admin", joinedAt: "2026-02-15T00:00:00Z", isActive: true },
  { id: "mem-003", email: "bob@Mailvex.com", firstName: "Bob", lastName: "Smith", role: "member", joinedAt: "2026-03-10T00:00:00Z", isActive: true },
  { id: "mem-004", email: "carol@Mailvex.com", firstName: "Carol", lastName: "Williams", role: "viewer", joinedAt: "2026-04-20T00:00:00Z", isActive: false },
]

export function canManage(actorRole: MemberRole, targetRole: MemberRole): boolean {
  return ROLE_WEIGHT[actorRole] > ROLE_WEIGHT[targetRole]
}

export function assignableRoles(actorRole: MemberRole): MemberRole[] {
  return (Object.keys(ROLE_WEIGHT) as MemberRole[]).filter(
    (r) => ROLE_WEIGHT[r] < ROLE_WEIGHT[actorRole]
  )
}
