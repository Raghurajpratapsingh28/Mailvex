# Mailvex — User Guide

Mailvex is a multi-workspace SaaS platform for email marketing, transactional email, and contact automation. This guide covers how to use every feature.

---

## Getting Started

### 1. Create an Account

Go to `/signup`. Enter your name, email, and password. You'll receive a verification email — click the link to activate your account, then sign in at `/signin`.

### 2. Create a Workspace

After signing in you land on `/home`. Create a workspace from **Settings → Workspaces**. A workspace is an isolated environment with its own contacts, campaigns, domains, and billing. You can belong to multiple workspaces with different roles (owner, admin, viewer).

### 3. Add a Sending Domain

Before sending any email you must verify a domain. Go to **Domains**, select your workspace, and click **Add Domain**. Enter your domain (e.g. `acme.com`). The platform provisions an AWS SES identity and returns three DNS records:

| Type | Purpose |
|------|---------|
| `TXT @` | SPF — authorises SES to send on your behalf |
| `CNAME ×3` | DKIM — cryptographic signing of outbound mail |
| `TXT _dmarc` | DMARC — policy for failed authentication |

Publish these in your DNS provider. Verification is automatic and typically completes within a few minutes to 72 hours. Once the domain shows **Verified** you can use any `@yourdomain.com` address as a sender.

---

## Contacts

**Path:** `/contact → /contact/[workspaceId]`

Contacts are the people in your audience. Each contact has:
- Email, name, phone
- **Lifecycle stage**: Lead → Subscriber → Customer → Churned
- **Lead score** (0–100)
- Tags, custom properties
- Suppression and unsubscribe flags

**Actions:**
- **Add Contact** — create individually via the drawer
- **Import** — bulk CSV import (up to 10 000 rows per upload)
- **Suppress** — mark a contact so they never receive email from this workspace
- **Filter** — search by email, lifecycle stage, tags, date range, suppression status

---

## Segments

**Path:** `/segments → /segments/[workspaceId]`

Segments are dynamic or static groups of contacts used as campaign audiences.

- **Dynamic segments** — define filter rules (field / operator / value, combined with AND/OR). The platform recomputes membership automatically when a refresh is triggered or contacts change.
- **Static segments** — fixed lists, membership only changes when you manually add or remove contacts.

After creating a segment click **Refresh** to compute its membership. The `contactCount` shown on campaigns and the home dashboard reflects the last computed value.

---

## Campaigns

**Path:** `/campaigns → /campaigns/[workspaceId]`

Campaigns are one-time bulk email sends to a segment.

### Create a Campaign

1. **Setup tab** — give it a name and pick a target segment.
2. **Sender tab** — enter a `From Email` (must be from a verified domain), `From Name`, and optional `Reply To`.
3. **Content tab** — write the subject, preview text, HTML body, and plain-text fallback.
4. **Preview tab** — live render of your HTML in desktop or mobile viewport.

### Send Options

| Button | What it does |
|--------|-------------|
| **Save as Draft** | Saves without sending. Editable later. |
| **Send Now** | Creates the campaign and immediately dispatches to the segment audience. |

From the campaign detail page you can also:
- **Schedule** — pick a future date/time to send automatically.
- **Pause** — halt a sending or scheduled campaign mid-flight.
- **Resume** — continue a paused campaign.
- **Delete** — soft-deletes the campaign (cannot delete while sending — pause first).

### Campaign Statuses

`draft → scheduled → sending → sent | failed | paused`

---

## Transactional Emails

**Path:** `/transactional → /transactional/[workspaceId]`

Transactional emails are individual, triggered emails (receipts, password resets, notifications). Unlike campaigns they go to one recipient at a time via the API or the dashboard.

### Send an Email

Go to `/transactional/[workspaceId]/send`. Fill in:
- **Recipients** — type an email and press Enter (up to 50)
- **From Email / Name / Reply To**
- **Content mode**:
  - *Write Custom* — enter subject, HTML body, and plain text directly
  - *Use Template* — pick a published template and fill in its variables

Tags and an idempotency key (for deduplication) are optional.

### Email Status

| Status | Meaning |
|--------|---------|
| `queued` | Accepted, waiting for the worker |
| `sending` | Being delivered by SES |
| `sent` | Delivered successfully |
| `failed` | Permanent failure (bad domain, SES rejection) |
| `bounced` | Recipient inbox rejected the message |

Click any send row to view full details including the provider message ID and failure reason.

### Templates

Go to `/transactional/[workspaceId]/template` to create reusable templates. Templates support `{{variable_name}}` interpolation. Variables are filled at send time from `templateData`. A template must be **published** before it can be used in a send.

---

## Workflows (Flow Builder)

**Path:** `/flow-builder → /flow-builder/[workspaceId]`

Workflows automate multi-step contact journeys triggered by events.

### Create a Workflow

Go to `/flow-builder/[workspaceId]/create`. Name the workflow and build the graph:

1. **Trigger node** — when does this start?
   - *Event* — a named analytics event (e.g. `Trial Started`)
   - *Segment Enter* — contact enters a segment
   - *Manual* — triggered by API call
2. **Email node** — send an email. Requires subject, from email, and HTML body.
3. **Delay node** — wait for a duration (minutes / hours / days / weeks, minimum 60 seconds).
4. **End node** — marks the workflow complete.

Add intermediate nodes with the **+** buttons between existing nodes.

### Publish

Click **Create & Publish** (or **Save as Draft** to publish later). Publishing registers the trigger with the Go worker — from that point, any contact matching the trigger is automatically enrolled.

### Statuses

| Status | Meaning |
|--------|---------|
| `draft` | Editable, not yet active |
| `published` | Active, enrolling contacts |
| `paused` | No new enrollments; in-flight executions continue |
| `archived` | Deleted |

The detail page (`/flow-builder/[workspaceId]/details/[workflowId]`) shows a read-only graph and a live executions table with contact IDs, status, and current node.

---

## Domains

**Path:** `/domains → /domains/[workspaceId]`

Manage sending domains per workspace. See the setup progress stepper (Add → Publish DNS → Verifying → Ready), full DNS record tables with one-click copy, and DKIM token details.

**Re-verify** — if DNS was published after the initial check, click Re-verify to re-enqueue the SES poll without waiting.

**Delete** — removes the SES identity. Any campaigns or transactional sends using this domain will fail until a new domain is verified.

---

## Billing

**Path:** `/billing → /billing/[workspaceId]`

Plans and their limits:

| Plan | Contacts | Emails/mo | Events/mo |
|------|----------|-----------|-----------|
| Free | 100 | 500 | 1 000 |
| Starter | 5 000 | 20 000 | 50 000 |
| Growth | 50 000 | 200 000 | 500 000 |
| Pro | 500 000 | 2 000 000 | 5 000 000 |

Click **Manage Subscription** (from Home or Billing) to open the Stripe Customer Portal where you can upgrade, change billing interval, update payment methods, and download invoices.

---

## Settings

**Path:** `/settings → /settings/[workspaceId]`

- **Workspace** — rename, change slug, deactivate/reactivate
- **Members** — invite by email, change roles, remove members
- **Email Defaults** — default from name, from email, reply-to used in the send modals
- **Webhooks** — configure a webhook URL and secret to receive platform events
- **API Keys** — create keys for the SDK and REST API

---

## Home Dashboard

**Path:** `/home → /home/[workspaceId]`

A live overview pulled from all services:
- **Usage bars** — contacts, emails, and events consumed vs plan limits for the current billing period
- **Plan card** — current plan with renewal date; opens Stripe portal
- **Quick actions** — one-click navigation to create a campaign, add a contact, create a segment, or build a workflow
- **Campaigns** — recent 5 campaigns with status
- **Workflows** — published count and aggregated execution stats; alerts on failed executions
- **Domains** — verified and pending counts
- **Contacts** — total contact count
- **Segments** — top 5 segments by contact weight

Click **Sync Data** to refresh all panels.
