export interface Contact {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string
  lifecycleStage: "lead" | "prospect" | "customer" | "churned" | "unqualified"
  leadScore: number
  tags: string[]
  suppressed: boolean
  unsubscribed: boolean
  createdAt: string
  customProperties: Record<string, any>
  sourceChannel: string
}

export const initialContacts: Contact[] = [
  {
    id: "usr-01",
    email: "amelie.laurent@acme.com",
    firstName: "Amélie",
    lastName: "Laurent",
    phone: "+33 6 1234 5678",
    lifecycleStage: "customer",
    leadScore: 92,
    tags: ["High-Value", "Enterprise", "Europe"],
    suppressed: false,
    unsubscribed: false,
    createdAt: "2026-05-12T08:30:00Z",
    customProperties: { company: "Acme Corp", industry: "SaaS", employeeCount: 250 },
    sourceChannel: "Direct Signup"
  },
  {
    id: "usr-02",
    email: "marcus.thorne@fitlife.co",
    firstName: "Marcus",
    lastName: "Thorne",
    phone: "+1 (555) 019-2834",
    lifecycleStage: "customer",
    leadScore: 78,
    tags: ["SMB", "Active", "US"],
    suppressed: false,
    unsubscribed: false,
    createdAt: "2026-05-15T14:22:00Z",
    customProperties: { studioCount: 12, billingTier: "Pro" },
    sourceChannel: "Google Search"
  },
  {
    id: "usr-03",
    email: "sarah.chen@vellum.io",
    firstName: "Sarah",
    lastName: "Chen",
    phone: "+65 9123 4567",
    lifecycleStage: "prospect",
    leadScore: 65,
    tags: ["Enterprise", "API-User"],
    suppressed: false,
    unsubscribed: false,
    createdAt: "2026-05-18T09:05:00Z",
    customProperties: { integrationsNeeded: ["AWS SES", "Twilio"], useCase: "AI Automation" },
    sourceChannel: "Product Hunt"
  },
  {
    id: "usr-04",
    email: "david.beckham@united.org",
    firstName: "David",
    lastName: "Beckham",
    phone: "+44 20 7946 0958",
    lifecycleStage: "lead",
    leadScore: 45,
    tags: ["Celebrity", "UK"],
    suppressed: true,
    unsubscribed: false,
    createdAt: "2026-05-20T11:40:00Z",
    customProperties: { vip: true, agentName: "Manchester Office" },
    sourceChannel: "Referral"
  },
  {
    id: "usr-05",
    email: "elena.rodriguez@solar.es",
    firstName: "Elena",
    lastName: "Rodríguez",
    phone: "+34 600 123 456",
    lifecycleStage: "churned",
    leadScore: 12,
    tags: ["Inactive", "Europe"],
    suppressed: false,
    unsubscribed: true,
    createdAt: "2026-05-02T16:15:00Z",
    customProperties: { churnReason: "Price sensitivity", competitor: "HubSpot" },
    sourceChannel: "Organic Search"
  },
  {
    id: "usr-06",
    email: "kenji.sato@cyber.jp",
    firstName: "Kenji",
    lastName: "Sato",
    phone: "+81 90 1234 5678",
    lifecycleStage: "unqualified",
    leadScore: 5,
    tags: ["Spam", "Asia"],
    suppressed: true,
    unsubscribed: true,
    createdAt: "2026-05-22T04:10:00Z",
    customProperties: { botProbability: 0.98 },
    sourceChannel: "API Trial"
  },
  {
    id: "usr-07",
    email: "olivia.maurer@techflow.de",
    firstName: "Olivia",
    lastName: "Maurer",
    phone: "+49 30 9876 5432",
    lifecycleStage: "prospect",
    leadScore: 84,
    tags: ["High-Value", "Developer", "Europe"],
    suppressed: false,
    unsubscribed: false,
    createdAt: "2026-05-23T13:45:00Z",
    customProperties: { languagePreference: "Go", framework: "Next.js" },
    sourceChannel: "GitHub Promo"
  },
  {
    id: "usr-08",
    email: "alexander.wright@cloud.net",
    firstName: "Alexander",
    lastName: "Wright",
    phone: "+1 (555) 482-9102",
    lifecycleStage: "lead",
    leadScore: 58,
    tags: ["US", "Trial-User"],
    suppressed: false,
    unsubscribed: false,
    createdAt: "2026-05-24T18:30:00Z",
    customProperties: { cloudProvider: "GCP", activeTrial: true },
    sourceChannel: "LinkedIn Ads"
  }
]
