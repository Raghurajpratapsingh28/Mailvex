export type UserProfile = {
  id: string
  firstName: string
  lastName: string
  email: string
  emailVerified: boolean
  createdAt: string
}

export type WorkspaceMembership = {
  workspaceId: string
  workspaceName: string
  role: string
  joinedAt: string
}

export type Session = {
  id: string
  isCurrent: boolean
  ipAddress: string
  userAgent: string
  createdAt: string
  expiresAt: string
}

export function parseDevice(ua: string): { icon: string; label: string } {
  if (/iPhone|Android|Mobile/i.test(ua)) return { icon: "📱", label: "Mobile" }
  if (/Macintosh|Windows|Linux/i.test(ua)) return { icon: "🖥️", label: "Desktop" }
  return { icon: "💻", label: "Other" }
}

export function validatePassword(pw: string): string[] {
  const errors: string[] = []
  if (pw.length < 12) errors.push("At least 12 characters")
  if (!/[A-Z]/.test(pw)) errors.push("One uppercase letter")
  if (!/[a-z]/.test(pw)) errors.push("One lowercase letter")
  if (!/\d/.test(pw)) errors.push("One digit")
  if (!/[^A-Za-z0-9]/.test(pw)) errors.push("One special character")
  return errors
}

export const mockProfile: UserProfile = {
  id: "usr-001",
  firstName: "Raghu",
  lastName: "Pratap",
  email: "admin@Mailvex.com",
  emailVerified: true,
  createdAt: "2026-01-01T00:00:00Z",
}

export const mockMemberships: WorkspaceMembership[] = [
  { workspaceId: "ws-001", workspaceName: "Mailvex Workspace", role: "Owner", joinedAt: "2026-01-01T00:00:00Z" },
  { workspaceId: "ws-002", workspaceName: "Side Project", role: "Member", joinedAt: "2026-03-03T00:00:00Z" },
]

export const mockSessions: Session[] = [
  {
    id: "ses-001",
    isCurrent: true,
    ipAddress: "103.21.58.12",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/124.0",
    createdAt: "2026-05-25T10:00:00Z",
    expiresAt: "2026-06-24T10:00:00Z",
  },
  {
    id: "ses-002",
    isCurrent: false,
    ipAddress: "49.36.112.88",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
    createdAt: "2026-05-20T15:30:00Z",
    expiresAt: "2026-06-19T15:30:00Z",
  },
  {
    id: "ses-003",
    isCurrent: false,
    ipAddress: "1.2.3.4",
    userAgent: "PostmanRuntime/7.32.3",
    createdAt: "2026-05-22T09:15:00Z",
    expiresAt: "2026-06-21T09:15:00Z",
  },
]
