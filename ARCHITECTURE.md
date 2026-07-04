# Mailvex — Architecture

How the system works when a user interacts with the platform.

---

## Stack Overview

| Layer | Technology | Role |
|-------|-----------|------|
| Frontend | Next.js 16, React 19, Tailwind CSS | Browser UI |
| API | Node.js, Fastify, Drizzle ORM | REST API, auth, business logic |
| Workers | Go | Async email delivery, event processing, segment computation, workflow execution |
| Database | PostgreSQL 16 | All persistent state |
| Cache / Queue state | Redis 7 | Token buckets, distributed locks, idempotency keys, usage cache |
| Message bus | NATS JetStream | Durable async jobs between API and workers |
| Email delivery | AWS SES v2 | Actual SMTP relay |
| Payments | Stripe | Subscription management |

---

## High-Level Flow

```
Browser
  │
  │  HTTPS
  ▼
Next.js (main-frontend)          ← static/SSR pages, client-side fetch
  │
  │  REST  /api/v1/*
  │  Authorization: Bearer <jwt>
  │  x-workspace-id: <uuid>
  ▼
Fastify API (Mailvex-api :4000)
  │
  ├── PostgreSQL ──── all reads/writes
  ├── Redis ─────────  token cache, usage cache, idempotency locks
  └── NATS JetStream ─ publish async jobs
                           │
                           ▼
                    Go Workers (Mailvex-workers)
                           │
                           ├── PostgreSQL  (execution state, recipient rows)
                           ├── Redis       (rate limits, distributed locks)
                           └── AWS SES v2  (actual email delivery)
```

---

## Authentication Flow

1. User signs in — API issues a **short-lived JWT access token** (15 min) and a **long-lived refresh token** (stored in localStorage via `token-manager.ts`).
2. The frontend `auth-context.tsx` stores the access token in memory and sets it on `apiClient`.
3. A `setTimeout` fires ~1 minute before expiry to silently call `POST /auth/refresh` and swap in a new access token. The user never sees a re-login prompt.
4. On every API request the client sends `Authorization: Bearer <accessToken>` plus `x-workspace-id` for workspace-scoped routes.
5. Fastify's `authGuard` verifies the JWT signature and `workspaceGuard` checks membership and role permissions before any handler runs.

---

## Workspace Switching

Each user can belong to multiple workspaces. When the user navigates to `/contact/[workspaceId]`, `/campaigns/[workspaceId]`, etc., the frontend calls `POST /workspaces/switch` first. The API returns a **workspace-scoped access token** whose claims include the workspace ID and the user's role in that workspace. All subsequent requests use this token and the matching `x-workspace-id` header.

---

## Sending a Transactional Email

```
User fills form → POST /emails/send
  │
  API validates:
  │  ├── sender domain verified (domains table, status = verified)
  │  ├── idempotency key check (Redis, 24h TTL)
  │  └── monthly quota check (billing plan limits)
  │
  ├── INSERT email_sends row (status = queued)
  └── NATS publish → EMAIL_SEND stream
                           │
                     email-send-worker (Go)
                           │
                     Redis rate limit (14 sends/sec per workspace)
                           │
                     AWS SES SendEmail
                           │
                     UPDATE email_sends (status = sent | failed | bounced)
```

The API returns `202 { sendId, status: "queued" }` immediately. The actual send happens asynchronously in the worker.

---

## Sending a Campaign

```
User clicks Send Now → POST /campaigns/:id/send
  │
  API validates:
  │  ├── campaign status = draft | scheduled | paused
  │  ├── segment assigned and contactCount > 0
  │  ├── sender domain verified
  │  └── subject and body present
  │
  ├── Atomic status → sending (optimistic lock via version field)
  └── NATS publish → CAMPAIGN stream (subject: campaign.send.start)
                           │
                  campaign-start-worker (Go)
                     │
                     Stream segment contacts via keyset pagination
                     Bulk-insert campaign_recipients rows
                     Publish one chunk job per 500 recipients
                           │
                  campaign-chunk-worker (Go) × N parallel
                     │
                     For each recipient:
                       AWS SES SendEmail
                       UPDATE campaign_recipients (status)
                     │
                     UPDATE campaigns (sentCount, failedCount)
                     When all chunks done → status = sent
```

---

## Workflow Execution

```
Analytics event arrives → POST /events/track
  │
  NATS publish → EVENTS_RAW stream
        │
  events-enrichment-worker (Go)
        │
        Identity stitching (anonymous → known contact)
        Persist to events_enriched
        │
        Evaluate workflow trigger rules
        Match? → NATS publish → WORKFLOW stream
                       │
               workflow-trigger-worker (Go)
                       │
                       INSERT workflow_executions (status = running)
                       Execute nodes in order:
                         trigger → (next node)
                         email   → AWS SES → mark done → (next node)
                         delay   → record next_run_at, release message
                         end     → status = completed
                       │
               workflow-scheduler (Go, polls every 30s)
                       │
                       SELECT executions WHERE next_run_at <= NOW()
                       Resume each execution at the delay node's successor
```

---

## Domain Verification

```
User adds domain → POST /domains
  │
  API:
  │  ├── AWS SES CreateEmailIdentity (provisions Easy DKIM)
  │  ├── INSERT domains row (status = verifying)
  │  └── NATS publish → DOMAIN stream (domain.verify.poll.v1)
                    │
             domain-verify-worker (Go)
                    │
                    AWS SES GetIdentityVerificationAttributes
                    Verified? → UPDATE domains (status = verified, verified_at)
                    Not yet?  → Re-publish with exponential backoff
                                (5m → 15m → 30m → 1h → 2h → 6h → 12h → 24h)
                                Max 72 hours total window
```

---

## Segment Computation

```
User creates dynamic segment → POST /segments
  │
  INSERT segments row (status = pending)
  │
User clicks Refresh → POST /segments/:id/refresh
  │
  NATS publish → SEGMENTS stream
        │
  segment-refresh-worker (Go)
        │
        Acquire Redis distributed lock (prevent concurrent recompute)
        UPDATE segments (status = computing)
        │
        Evaluate filter tree against contacts table
        (10 operators: eq, neq, contains, starts_with, gt, lt, gte, lte, in, exists)
        │
        Diff: compute new_ids XOR existing_ids
          INSERT new memberships into segment_memberships
          DELETE stale memberships from segment_memberships
        │
        UPDATE segments (status = ready, contact_count, last_computed)
        Release lock
```

---

## Billing & Quota

```
User upgrades → POST /billing/checkout { plan, billingInterval }
  │
  API creates Stripe Checkout session → returns checkoutUrl
  User redirected to Stripe hosted page
  Payment completed
  │
  Stripe webhook → POST /api/v1/webhooks/stripe
        │
        Signature verification (HMAC-SHA256)
        Dedup: Redis NX fast-path + DB UNIQUE on stripe_event_id
        │
        checkout.session.completed → upsert subscription row
        customer.subscription.updated → update plan, limits
        invoice.* → sync invoice records
        │
        Workspace plan updated → quota limits change immediately

Usage check (every email send / contact create / event track):
  GET /billing/usage → Redis cache (30s TTL)
  used >= limit? → 403 QUOTA_EXCEEDED
```

---

## Database Schema (Key Tables)

```
users
workspaces ──< workspace_members >── users
           ──< domains
           ──< contacts ──< contact_tags
           ──< segments ──< segment_memberships >── contacts
           ──< campaigns ──< campaign_recipients >── contacts
           ──< email_sends
           ──< email_templates
           ──< workflows ──< workflow_executions
           ──< events_raw
           ──< billing_subscriptions
           ──< invoices
```

---

## NATS Streams & Subjects

| Stream | Subject | Producer | Consumer |
|--------|---------|---------|---------|
| `DOMAIN` | `domain.verify.poll.v1` | API | domain-verify-worker |
| `EMAIL_SEND` | `email.send.transactional` | API | email-send-worker |
| `CAMPAIGN` | `campaign.send.start` | API | campaign-start-worker |
| `CAMPAIGN` | `campaign.send.chunk` | campaign-start-worker | campaign-chunk-worker |
| `EVENTS_RAW` | `events.raw.>` | API (`/track`, `/identify`, etc.) | events-enrichment-worker |
| `SEGMENTS` | `segment.refresh` | API | segment-refresh-worker |
| `WORKFLOW` | `workflow.register` | API (publish) | workflow-register-worker |
| `WORKFLOW` | `workflow.trigger` | events-enrichment-worker | workflow-trigger-worker |

All streams use **WorkQueue** retention policy — each message is delivered to exactly one consumer and ACKed on success. Failed messages retry with server-side backoff before going to DLQ after the configured max retries.

---

## Local Development

```bash
# 1. Start infrastructure
docker compose up postgres redis nats -d

# 2. Run migrations
cd Mailvex-api
npm run db:migrate
npm run db:seed

# 3. Start API
npm run dev          # :4000

# 4. Start Workers
cd ../Mailvex-workers
go run ./cmd/workers  # :9090 (metrics)

# 5. Start Frontend
cd ../main-frontend
npm run dev          # :3000
```

**Environment files:**
- `Mailvex-api/.env` — copy from `.env.example`, fill `DATABASE_URL`, `REDIS_URL`, `NATS_URL`, JWT secrets, AWS credentials
- `Mailvex-workers/.env` — copy from `.env.example`, fill the same infra URLs plus AWS SES credentials
- `main-frontend/.env.local` — set `NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api/v1`

Or run everything at once:

```bash
docker compose up --build
```

---

## Deployment

The `docker-compose.yml` at the repo root defines the full production-like stack. Each service waits for its dependencies via health checks before starting.

For production:
- Deploy API and Workers as separate containers/services
- Use managed PostgreSQL and Redis (e.g. RDS, ElastiCache)
- Use NATS JetStream cluster or NATS Cloud
- Assign an IAM role to the workers container with `ses:SendEmail` — do not put AWS keys in env
- Set `SWAGGER_ENABLED=false` in API (default for production)
- Place a CDN/reverse proxy in front of the Next.js frontend
