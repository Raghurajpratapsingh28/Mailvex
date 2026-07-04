export type CampaignStatus = "draft" | "scheduled" | "sending" | "sent" | "paused" | "failed" | "cancelled" | "completed"
export type CampaignType = "regular"

export type Campaign = {
  id: string
  name: string
  type: CampaignType
  status: CampaignStatus
  subject: string
  previewText: string
  fromEmail: string
  fromName: string
  replyTo: string
  segmentId: string
  segmentName: string
  recipientCount: number
  sentCount: number
  failedCount: number
  scheduledAt: string | null
  sentAt: string | null
  htmlBody: string
  plainText: string
  createdAt: string
  updatedAt: string
  errorMessage?: string
  version?: number
}

export const VERIFIED_DOMAINS = [
  "hello@Mailvex.com",
  "noreply@Mailvex.com",
  "outreach@Mailvex.com",
]

export const MOCK_SEGMENTS = [
  { id: "seg-001", name: "High Value Customers", contactCount: 540 },
  { id: "seg-002", name: "Inactive Subscriptions", contactCount: 310 },
  { id: "seg-003", name: "EU Contacts Only", contactCount: 220 },
  { id: "seg-004", name: "Free Plan Users", contactCount: 0 },
  { id: "seg-005", name: "VIP Beta Testers", contactCount: 48 },
]

export const STATUS_META: Record<CampaignStatus, { label: string; color: string; bg: string; border: string }> = {
  draft:     { label: "Draft",     color: "text-[#FFB020]", bg: "bg-[#FFB020]/10", border: "border-[#FFB020]/25" },
  scheduled: { label: "Scheduled", color: "text-[#3CD3AD]", bg: "bg-[#3CD3AD]/10", border: "border-[#3CD3AD]/25" },
  sending:   { label: "Sending",   color: "text-[#696CFF]", bg: "bg-[#696CFF]/10", border: "border-[#696CFF]/25" },
  sent:      { label: "Sent",      color: "text-[#FFFFFF]", bg: "bg-[#FFFFFF]/10", border: "border-[#FFFFFF]/25" },
  paused:    { label: "Paused",    color: "text-[#8A8D96]", bg: "bg-[#8A8D96]/10", border: "border-[#8A8D96]/25" },
  failed:    { label: "Failed",    color: "text-[#FF5A4F]", bg: "bg-[#FF5A4F]/10", border: "border-[#FF5A4F]/25" },
  cancelled: { label: "Cancelled", color: "text-[#444444]", bg: "bg-[#444444]/10", border: "border-[#444444]/25" },
  completed: { label: "Completed", color: "text-[#3CD3AD]", bg: "bg-[#3CD3AD]/10", border: "border-[#3CD3AD]/25" },
}

export const initialCampaigns: Campaign[] = [
  {
    id: "cmp-001",
    name: "Q2 Growth Newsletter",
    type: "regular",
    status: "sent",
    subject: "Your Q2 Growth Report is here 🚀",
    previewText: "See how your metrics improved this quarter",
    fromEmail: "hello@Mailvex.com",
    fromName: "Mailvex Team",
    replyTo: "",
    segmentId: "seg-001",
    segmentName: "High Value Customers",
    recipientCount: 4800,
    sentCount: 4750,
    failedCount: 50,
    scheduledAt: "2026-05-20T10:00:00Z",
    sentAt: "2026-05-20T10:00:00Z",
    htmlBody: "<h1>Q2 Growth Report</h1><p>Here are your key metrics for Q2...</p>",
    plainText: "Q2 Growth Report\n\nHere are your key metrics for Q2...",
    createdAt: "2026-05-15T08:00:00Z",
    updatedAt: "2026-05-20T10:00:00Z",
  },
  {
    id: "cmp-002",
    name: "Welcome Series Part 3",
    type: "regular",
    status: "sending",
    subject: "You're almost there — complete your setup",
    previewText: "Just a few more steps to unlock full access",
    fromEmail: "hello@Mailvex.com",
    fromName: "Mailvex Team",
    replyTo: "support@Mailvex.com",
    segmentId: "seg-005",
    segmentName: "VIP Beta Testers",
    recipientCount: 1200,
    sentCount: 800,
    failedCount: 0,
    scheduledAt: null,
    sentAt: null,
    htmlBody: "<h1>Complete Your Setup</h1><p>You're almost there...</p>",
    plainText: "Complete Your Setup\n\nYou're almost there...",
    createdAt: "2026-05-22T09:00:00Z",
    updatedAt: "2026-05-26T14:00:00Z",
  },
  {
    id: "cmp-003",
    name: "Re-engagement Promo",
    type: "regular",
    status: "scheduled",
    subject: "We miss you — here's 20% off",
    previewText: "Exclusive offer just for you",
    fromEmail: "noreply@Mailvex.com",
    fromName: "Mailvex",
    replyTo: "",
    segmentId: "seg-002",
    segmentName: "Inactive Subscriptions",
    recipientCount: 310,
    sentCount: 0,
    failedCount: 0,
    scheduledAt: "2026-05-28T09:00:00Z",
    sentAt: null,
    htmlBody: "<h1>We Miss You!</h1><p>Here's 20% off your next month...</p>",
    plainText: "We Miss You!\n\nHere's 20% off your next month...",
    createdAt: "2026-05-23T11:00:00Z",
    updatedAt: "2026-05-23T11:00:00Z",
  },
  {
    id: "cmp-004",
    name: "Black Friday Prep Draft",
    type: "regular",
    status: "draft",
    subject: "Black Friday is coming — are you ready?",
    previewText: "Exclusive early access for our best customers",
    fromEmail: "hello@Mailvex.com",
    fromName: "Mailvex Team",
    replyTo: "",
    segmentId: "seg-001",
    segmentName: "High Value Customers",
    recipientCount: 0,
    sentCount: 0,
    failedCount: 0,
    scheduledAt: null,
    sentAt: null,
    htmlBody: "<h1>Black Friday Preview</h1><p>Get ready for our biggest sale...</p>",
    plainText: "Black Friday Preview\n\nGet ready for our biggest sale...",
    createdAt: "2026-05-26T11:00:00Z",
    updatedAt: "2026-05-26T11:00:00Z",
  },
  {
    id: "cmp-005",
    name: "Abandon Cart Push Sequence",
    type: "regular",
    status: "paused",
    subject: "You left something behind...",
    previewText: "Your cart is waiting for you",
    fromEmail: "noreply@Mailvex.com",
    fromName: "Mailvex",
    replyTo: "",
    segmentId: "seg-003",
    segmentName: "EU Contacts Only",
    recipientCount: 3500,
    sentCount: 1200,
    failedCount: 45,
    scheduledAt: null,
    sentAt: null,
    htmlBody: "<h1>Your Cart is Waiting</h1><p>Complete your purchase today...</p>",
    plainText: "Your Cart is Waiting\n\nComplete your purchase today...",
    createdAt: "2026-05-18T14:00:00Z",
    updatedAt: "2026-05-20T09:00:00Z",
  },
  {
    id: "cmp-006",
    name: "EU GDPR Compliance Notice",
    type: "regular",
    status: "failed",
    subject: "Important: Your data privacy update",
    previewText: "Please review our updated privacy policy",
    fromEmail: "hello@Mailvex.com",
    fromName: "Mailvex Legal",
    replyTo: "legal@Mailvex.com",
    segmentId: "seg-003",
    segmentName: "EU Contacts Only",
    recipientCount: 0,
    sentCount: 0,
    failedCount: 0,
    scheduledAt: null,
    sentAt: null,
    htmlBody: "<h1>Privacy Policy Update</h1><p>We've updated our privacy policy...</p>",
    plainText: "Privacy Policy Update\n\nWe've updated our privacy policy...",
    createdAt: "2026-05-10T10:00:00Z",
    updatedAt: "2026-05-10T12:00:00Z",
    errorMessage: "SENDER_DOMAIN_NOT_VERIFIED: Domain verification failed for outreach.Mailvex.com",
  },
]
