# Mailvex — VPS Deployment

Deploy the **entire** platform (frontend + API + Go workers + Postgres + Redis +
NATS + automatic HTTPS) on a single VPS with one command.

```
                        Internet
                           │  :80 / :443
                           ▼
                    ┌──────────────┐
                    │    Caddy     │  auto Let's Encrypt TLS
                    └──────┬───────┘
          app.mailvex...   │   api.mailvex...
             ┌─────────────┴──────────────┐
             ▼                             ▼
      ┌────────────┐               ┌────────────┐
      │  frontend  │  Next.js      │    api     │  Fastify :4000
      │   :3000    │               │            │
      └────────────┘               └─────┬──────┘
                                          │
                          ┌───────────────┼───────────────┐
                          ▼               ▼               ▼
                    ┌──────────┐   ┌──────────┐    ┌──────────┐
                    │ postgres │   │  redis   │    │   nats   │
                    └──────────┘   └──────────┘    └──────────┘
                          ▲               ▲               ▲
                          └────────┬──────┴───────────────┘
                                   ▼
                             ┌──────────┐
                             │ workers  │  Go (SES delivery, events, workflows)
                             └──────────┘
```

Only Caddy exposes ports (`80`, `443`). Everything else stays on the private
Docker network.

---

## 1. Prerequisites

- A VPS running Linux (Ubuntu 22.04+ recommended) with a public IP.
- **Docker Engine + Compose plugin** installed:
  ```bash
  curl -fsSL https://get.docker.com | sh
  ```
- **DNS records** — create two `A` records pointing at your VPS IP:
  | Host | Type | Value |
  |------|------|-------|
  | `app.mailvex.raghuraj.codes` | A | `<your-vps-ip>` |
  | `api.mailvex.raghuraj.codes` | A | `<your-vps-ip>` |

  TLS certificates are issued automatically by Caddy the first time each domain
  resolves to the server, so set up DNS **before** deploying.

---

## 2. Configure

```bash
git clone <your-repo> && cd mailvex   # or scp the project to the VPS
cp .env.example .env
nano .env
```

Fill in at minimum:

- `ACME_EMAIL` — your email (Let's Encrypt notices)
- `POSTGRES_PASSWORD`, `REDIS_PASSWORD` — strong passwords
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` — `openssl rand -base64 48`
- `INTERNAL_API_KEY`
- `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` — for SES email sending
- `EMAIL_FROM` / `EMAIL_REPLY_TO`
- Stripe keys (optional — leave blank to run without billing)

The domains default to `app.mailvex.raghuraj.codes` / `api.mailvex.raghuraj.codes`.

---

## 3. Deploy

```bash
./infra/deploy.sh
```

This builds all images and starts the stack. On boot the `migrate` service runs
database migrations + seeds, then the API, workers, and frontend come up in
dependency order.

When it finishes:

- Frontend → `https://app.mailvex.raghuraj.codes`
- API health → `https://api.mailvex.raghuraj.codes/health`

The **first** request per domain may take ~30–60s while Caddy provisions the TLS
certificate.

---

## 4. Everyday operations

```bash
./infra/deploy.sh logs     # tail all logs
./infra/deploy.sh ps       # service status
./infra/deploy.sh down     # stop (data volumes preserved)
./infra/deploy.sh          # rebuild + redeploy after a code change
```

Raw compose commands work too:

```bash
docker compose -f docker-compose.prod.yml logs -f api
docker compose -f docker-compose.prod.yml restart workers
```

---

## 5. Notes & production hardening

- **Data** lives in named volumes (`postgres_data`, `redis_data`, `nats_data`,
  `caddy_data`). `deploy.sh down` keeps them; `docker compose ... down -v` wipes
  them (irreversible).
- **The frontend API URL is baked at build time** (`NEXT_PUBLIC_API_BASE_URL` →
  `https://${API_DOMAIN}/api/v1`). If you change `API_DOMAIN`, rebuild the
  frontend image (`./infra/deploy.sh` rebuilds automatically).
- **CORS** is locked to `https://${APP_DOMAIN}` and Swagger is disabled in prod.
- **Stripe webhooks:** point your Stripe endpoint at
  `https://api.mailvex.raghuraj.codes/api/v1/webhooks/stripe` and set
  `STRIPE_WEBHOOK_SECRET`.
- **Managed data stores:** for scale you can drop the `postgres` / `redis` /
  `nats` services and point `DATABASE_URL` / `REDIS_URL` / `NATS_URL` at managed
  equivalents (RDS, ElastiCache, NATS Cloud). Set `DATABASE_SSL=true` for the API
  and `?sslmode=require` for the workers in that case.
- **AWS credentials:** on AWS infra, prefer attaching an IAM role with
  `ses:SendEmail` to the workers instead of static keys.
```
