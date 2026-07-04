#!/bin/sh
# ─────────────────────────────────────────────────────────────────────────────
# Manual migrate + seed script
# Run from the repo root on the VPS:  ./infra/migrate.sh
# ─────────────────────────────────────────────────────────────────────────────
set -e

COMPOSE="docker compose -f docker-compose.prod.yml"
MIGRATIONS_DIR="engageiq-api/database/migrations"
PG_USER="${POSTGRES_USER:-mailvex}"
PG_DB="${POSTGRES_DB:-mailvex}"

echo ""
echo "================================================="
echo "  Mailvex — Manual Migrate + Seed"
echo "================================================="
echo ""

# ── Step 1: Copy migrations into postgres container ──────────────────────────
echo "[1/10] Copying migration files into postgres container..."
$COMPOSE cp "$MIGRATIONS_DIR/." postgres:/migrations/
echo "       Done."
echo ""

# ── Step 2: Run migrations one by one ────────────────────────────────────────
run_migration() {
  FILE=$1
  NAME=$2
  echo "[migrate] Running $NAME..."
  $COMPOSE exec -T postgres psql -U "$PG_USER" -d "$PG_DB" -v ON_ERROR_STOP=1 -f "/migrations/$FILE"
  echo "[migrate] $NAME — OK"
  echo ""
}

run_migration "0000_initial.sql"              "0000 — initial (users, workspaces, roles, permissions)"
run_migration "0001_contacts_segments.sql"    "0001 — contacts & segments"
run_migration "0002_workflows.sql"            "0002 — workflows & flow builder"
run_migration "0003_billing.sql"              "0003 — billing & subscriptions"
run_migration "0004_worker_tables.sql"        "0004 — worker / campaign tables"
run_migration "0005_api_keys.sql"             "0005 — api keys"
run_migration "0006_domain_unique_partial.sql" "0006 — domain unique partial index"
run_migration "0007_domain_byodkim.sql"       "0007 — domain BYODKIM fields"

# ── Step 3: Seed ─────────────────────────────────────────────────────────────
echo "[seed] Seeding roles, permissions, and API keys..."
$COMPOSE exec -T api node dist/scripts/seed.js
echo "[seed] Done."
echo ""

echo "================================================="
echo "  All migrations and seed completed successfully!"
echo "================================================="
echo ""
