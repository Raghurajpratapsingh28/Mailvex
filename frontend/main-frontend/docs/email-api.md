# Mailvex Email API — Complete Reference

Everything the backend API exposes for sending email to users.

---

## Prerequisites: Domain Verification

**No email can be sent without a verified sending domain.**

Every email path (transactional, campaign, workflow) validates that the `from` address's domain exists in the `domains` table with `status = 'verified'`. If the domain is pending, verifying, failed, or missing, the API returns `403 SENDER_DOMAIN_NOT_VERIFIED`.

Domain lifecycle:
```
pending → verifying → verified
                   ↘ failed
```

DNS records (DKIM tokens) are provided by the API after domain creation. AWS SES verifies them asynchronously. Poll `GET /domains/:id` until `status = 'verified'` before sending.

**Plan limits:** free=1, starter=3, growth=10, pro=unlimited domains.

---

## 1. Transactional Emails

One-off emails to up to 50 recipients in a single API call.

### Send endpoint

```
POST /workspaces/:workspaceId/emails/send
Authorization: Bearer <jwt>
x-workspace-id: <workspaceId>
```

**Request body:**

```json
{
  "to": [
    { "email": "user@example.com", "name": "Jane Doe" }
  ],
  "from": {
    "email": "hello@yourdomain.com",
    "name": "Mailvex Team"
  },
  "replyTo": "support@yourdomain.com",

  // Option A: use a published template
  "templateId": "uuid",
  "variables": { "firstName": "Jane", "planName": "Pro" },

  // Option B: inline content (templateId OR subject+body, not both)
  "subject": "Your invoice is ready",
  "html": "<h1>Hi {{firstName}}</h1><p>Your invoice...</p>",
  "text": "Hi {{firstName}}, your invoice...",

  // Optional idempotency — same key returns the cached result, not a re-send
  "idempotencyKey": "invoice-2024-01-jane"
}
```

**Constraints:**
- `to`: 1–50 recipients
- `html`: max 1 MB
- Exactly one of `templateId` or (`subject` + at least one of `html`/`text`) is required
- `idempotencyKey`: if provided, checked in Redis (SET NX, 24h TTL) — duplicate key returns 200 with the original result instead of sending again
- `from.email` domain must be verified

**What happens internally:**
1. Idempotency check (Redis)
2. Domain verification (DB lookup)
3. Email quota check (billing)
4. Template materialize → `{{variable}}` substitution
5. Insert row into `email_sends` with `status = 'queued'`
6. Publish to NATS `email.send` subject
7. Billing usage recorded
8. Return `{ sendId, status: 'queued', recipientCount }`

---

## 2. Email Templates

Reusable, versioned email content. Templates decouple content authoring from sending.

### Endpoints

```
POST   /workspaces/:workspaceId/email-templates          — create
GET    /workspaces/:workspaceId/email-templates          — list
GET    /workspaces/:workspaceId/email-templates/:id      — get one
PUT    /workspaces/:workspaceId/email-templates/:id      — update
POST   /workspaces/:workspaceId/email-templates/:id/publish   — publish
DELETE /workspaces/:workspaceId/email-templates/:id      — archive
```

### Create/Update body

```json
{
  "name": "Welcome Email",
  "subject": "Welcome to {{productName}}!",
  "htmlBody": "<h1>Hi {{firstName}}</h1>",
  "textBody": "Hi {{firstName}}",
  "variables": ["firstName", "productName"],
  "publish": true
}
```

**Constraints:**
- `name`: 1–120 chars, alphanumeric + spaces + `-_().,`; unique per workspace
- `htmlBody`: max 1 MB
- `variables`: list of variable names declared in the template (informational, used for UI hinting)

### Template lifecycle

```
draft → published → archived
```

- Only `published` templates can be used in `POST /emails/send`
- Editing a published template creates a new version (clone + increment version); the old version is archived
- `version` field starts at 1 and increments on each publish

### Variable interpolation

Variables use `{{variableName}}` syntax. At send time, the `variables` map in the send request is used to replace all placeholders. Unreplaced placeholders are left as-is (no error).

```html
<!-- Template -->
<h1>Hi {{firstName}},</h1>
<p>Welcome to {{productName}}!</p>

<!-- Send request -->
{ "variables": { "firstName": "Jane", "productName": "Mailvex" } }

<!-- Rendered output -->
<h1>Hi Jane,</h1>
<p>Welcome to Mailvex!</p>
```

---

## 3. Campaign Emails

Bulk email sends to a segment of contacts.

### Endpoints

```
POST   /workspaces/:workspaceId/campaigns              — create
GET    /workspaces/:workspaceId/campaigns              — list
GET    /workspaces/:workspaceId/campaigns/:id          — get
PUT    /workspaces/:workspaceId/campaigns/:id          — update
POST   /workspaces/:workspaceId/campaigns/:id/send     — send now
POST   /workspaces/:workspaceId/campaigns/:id/schedule — schedule for later
POST   /workspaces/:workspaceId/campaigns/:id/pause    — pause
POST   /workspaces/:workspaceId/campaigns/:id/resume   — resume
DELETE /workspaces/:workspaceId/campaigns/:id          — soft delete
```

### Create body

```json
{
  "name": "January Newsletter",
  "type": "regular",
  "subject": "January updates from Mailvex",
  "previewText": "Here's what's new this month",
  "from": { "email": "hello@yourdomain.com", "name": "Mailvex" },
  "replyTo": "support@yourdomain.com",
  "html": "<h1>...</h1>",
  "text": "...",
  "templateId": "uuid",
  "segmentId": "uuid"
}
```

**Campaign types:** `regular` | `ab_test` | `rss` | `transactional`

### Campaign status machine

```
draft → scheduled ──→ sending → sent
     ↘             ↗         ↘ failed
       paused ←───────────────┘
       ↓
       cancelled / archived
```

- Content edits (subject, html, template, segment) only allowed in `draft`
- Schedule edits (`scheduledAt`) allowed in `draft` or `scheduled`
- `sent`, `failed`, `cancelled`, `sending` are immutable
- Pause is allowed from `scheduled` or `sending`
- Resume re-publishes to NATS if the campaign was actively sending

### Send flow

1. Segment must have `contactCount > 0`
2. Sender domain must be verified
3. Monthly campaign count checked against plan limit
4. Email quota checked against remaining `emails` quota for the billing period
5. Status transitioned to `sending` (optimistic-locked with `version`)
6. Payload published to NATS `campaign.send.start`
7. Email quota usage recorded
8. Returns `{ campaignId, status: 'sending', recipientCount }`

### Recipient-level statuses

Each contact in the segment gets a `campaign_recipients` row tracking:

```
pending → sending → sent → delivered
                         ↘ bounced
                         ↘ complained
                    ↘ failed
                    ↘ opened (tracked via pixel)
                    ↘ clicked (tracked via link rewrite)
                    ↘ unsubscribed
```

**Plan limits (campaigns per month):** free=1, starter=5, growth=20, pro=unlimited

---

## 4. Workflow Email Nodes

Email sending inside automated workflows. The workflow engine sends the email to the contact that triggered the execution — there is no separate `to` field.

### How recipient resolution works

1. A workflow execution is created for a specific `contactId` (set when the trigger fires)
2. When the workflow engine reaches an email node, it fetches the contact record for `contactId`
3. The contact's `email` field is used as the recipient
4. If the contact has no email, the email node fails (execution status → `failed`)

### Email node config (stored in workflow graph JSONB)

```json
{
  "type": "email",
  "config": {
    "subject": "Your trial is ending",
    "fromEmail": "hello@yourdomain.com",
    "fromName": "Mailvex Team",
    "html": "<h1>Hi {{firstName}}</h1><p>...</p>"
  }
}
```

- `fromEmail` domain must be verified (validated at workflow publish time)
- No `templateId` support in workflow nodes — content is inline only
- Variables like `{{firstName}}` are substituted from the contact's attributes at send time

### Execution statuses

```
queued → running → waiting (delay node) → completed
                ↘ failed
```

---

## 5. Email Send Statuses

All sent emails are tracked in the `email_sends` table:

| Status | Meaning |
|--------|---------|
| `queued` | Inserted, NATS message published, awaiting worker pickup |
| `sending` | Worker is actively calling AWS SES |
| `sent` | SES accepted the message (does not mean delivered) |
| `failed` | SES rejected or worker error |
| `bounced` | SES bounce webhook received |
| `complained` | SES complaint (spam report) webhook received |

---

## 6. Plan Quotas

Email sending is quota-gated per billing period:

| Plan | Emails/period | Domains | Campaigns/month |
|------|--------------|---------|----------------|
| free | 500 | 1 | 1 |
| starter | 20,000 | 3 | 5 |
| growth | 200,000 | 10 | 20 |
| pro | 2,000,000 | unlimited | unlimited |

The quota system uses `billing_usage` records. Before any send, the API calls `hasQuotaRemaining(workspaceId, 'emails', count)`. If the check fails, it returns `403 QUOTA_EXCEEDED`.

---

## 7. Auth Headers

All email API endpoints are dashboard-auth (JWT, not write key):

```
Authorization: Bearer <jwt-token>
x-workspace-id: <workspaceId>
```

Events ingestion (`POST /events`) uses write key auth instead:

```
x-write-key: <workspace-write-key>
```

---

## 8. Error Codes

| Code | HTTP | When |
|------|------|------|
| `SENDER_DOMAIN_NOT_VERIFIED` | 403 | `from` domain not in verified domains list |
| `QUOTA_EXCEEDED` | 403 | Monthly email quota or campaign count limit hit |
| `TEMPLATE_NOT_FOUND` | 404 | `templateId` doesn't exist or isn't published |
| `INVALID_SEGMENT` | 400/403 | Segment not found or empty audience |
| `INVALID_CAMPAIGN_STATE` | 403 | Action not allowed for current campaign status |
| `VERSION_CONFLICT` | 409 | Optimistic lock mismatch — re-fetch and retry |
| `CAMPAIGN_NAME_TAKEN` | 409 | Duplicate campaign name in workspace |
