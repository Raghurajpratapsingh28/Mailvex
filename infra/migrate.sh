#!/bin/sh
# Apply raw SQL migrations via psql (fallback / manual use).
# Production stack uses Drizzle via:  ./infra/deploy.sh migrate
set -e

PGHOST="${PGHOST:-postgres}"
PGUSER="${POSTGRES_USER:-postgres}"
PGPASSWORD="${POSTGRES_PASSWORD:-postgres}"
PGDATABASE="${POSTGRES_DB:-mailvex}"
MIGRATIONS_DIR="${MIGRATIONS_DIR:-/migrations}"

export PGPASSWORD

for f in $(ls "${MIGRATIONS_DIR}"/*.sql 2>/dev/null | sort); do
  echo "[migrate] Applying $f..."
  psql -h "$PGHOST" -U "$PGUSER" -d "$PGDATABASE" -v ON_ERROR_STOP=1 -f "$f"
done

echo "[migrate] All SQL migrations done."
