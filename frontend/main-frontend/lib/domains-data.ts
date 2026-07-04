export type DomainStatus = "pending" | "verifying" | "verified" | "failed"

export type DnsRecord = {
  type: "TXT" | "CNAME"
  host: string
  value: string
  label: string // SPF | DKIM-1 | DKIM-2 | DKIM-3 | DMARC
}

export type Domain = {
  id: string
  domain: string
  status: DomainStatus
  dnsRecords: DnsRecord[]
  verificationStartedAt: string
  verificationAttempts: number
  verifiedAt: string | null
  createdAt: string
}

export function generateDnsRecords(domain: string): DnsRecord[] {
  return [
    {
      label: "SPF",
      type: "TXT",
      host: "@",
      value: "v=spf1 include:amazonses.com ~all",
    },
    {
      label: "DKIM-1",
      type: "CNAME",
      host: `t1._domainkey.${domain}`,
      value: `t1.dkim.amazonses.com`,
    },
    {
      label: "DKIM-2",
      type: "CNAME",
      host: `t2._domainkey.${domain}`,
      value: `t2.dkim.amazonses.com`,
    },
    {
      label: "DKIM-3",
      type: "CNAME",
      host: `t3._domainkey.${domain}`,
      value: `t3.dkim.amazonses.com`,
    },
    {
      label: "DMARC",
      type: "TXT",
      host: `_dmarc.${domain}`,
      value: `v=DMARC1; p=none; rua=mailto:dmarc-reports@${domain}; ruf=mailto:dmarc-reports@${domain}; fo=1`,
    },
  ]
}

export function validateDomain(input: string): string {
  const d = input.trim().toLowerCase().replace(/^www\./, "")
  if (!d) return "Domain is required."
  if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/.test(d))
    return "Invalid domain format."
  if (/^(localhost|127\.|192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/.test(d))
    return "Localhost and private IPs are not allowed."
  return ""
}

export function normalizeDomain(input: string): string {
  return input.trim().toLowerCase().replace(/^www\./, "")
}

export const initialDomains: Domain[] = [
  {
    id: "dom-001",
    domain: "Mailvex.com",
    status: "verified",
    dnsRecords: generateDnsRecords("Mailvex.com"),
    verificationStartedAt: "2026-04-01T10:00:00Z",
    verificationAttempts: 1,
    verifiedAt: "2026-04-01T14:00:00Z",
    createdAt: "2026-04-01T09:00:00Z",
  },
  {
    id: "dom-002",
    domain: "outreach.Mailvex.com",
    status: "failed",
    dnsRecords: generateDnsRecords("outreach.Mailvex.com"),
    verificationStartedAt: "2026-05-20T10:00:00Z",
    verificationAttempts: 3,
    verifiedAt: null,
    createdAt: "2026-05-20T09:00:00Z",
  },
  {
    id: "dom-003",
    domain: "mail.acme.com",
    status: "verifying",
    dnsRecords: generateDnsRecords("mail.acme.com"),
    verificationStartedAt: "2026-05-25T10:00:00Z",
    verificationAttempts: 1,
    verifiedAt: null,
    createdAt: "2026-05-25T09:00:00Z",
  },
  {
    id: "dom-004",
    domain: "newsletter.startup.io",
    status: "pending",
    dnsRecords: generateDnsRecords("newsletter.startup.io"),
    verificationStartedAt: "2026-05-26T08:00:00Z",
    verificationAttempts: 0,
    verifiedAt: null,
    createdAt: "2026-05-26T08:00:00Z",
  },
]
