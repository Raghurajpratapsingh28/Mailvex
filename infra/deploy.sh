#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Mailvex — one-command VPS deployment
#
#   ./infra/deploy.sh              build + (re)deploy the whole stack
#   ./infra/deploy.sh migrate      run DB migrations only (contacts, workflows, …)
#   ./infra/deploy.sh seed         run DB seeds only (roles, api keys)
#   ./infra/deploy.sh logs         tail logs for all services
#   ./infra/deploy.sh down         stop the stack (data volumes are kept)
#   ./infra/deploy.sh ps           show service status
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

cd "$(dirname "$0")/.."

COMPOSE="docker compose -f docker-compose.prod.yml"

if ! command -v docker >/dev/null 2>&1; then
  echo "ERROR: docker is not installed. Install Docker Engine + the compose plugin first." >&2
  exit 1
fi

require_env() {
  if [ ! -f .env ]; then
    echo "ERROR: .env not found. Run:  cp .env.example .env  and fill in your values." >&2
    exit 1
  fi
}

case "${1:-up}" in
  logs)
    exec $COMPOSE logs -f --tail=200
    ;;
  down)
    exec $COMPOSE down
    ;;
  ps)
    exec $COMPOSE ps
    ;;
  migrate)
    require_env
    echo "==> Running database migrations (0000 → 0007: contacts, segments, workflows, billing, workers, …)..."
    $COMPOSE run --rm migrate sh -c "node dist/scripts/migrate.js"
    echo "==> Migrations complete. Restarting api + workers..."
    $COMPOSE restart api workers
    echo "Done."
    exit 0
    ;;
  seed)
    require_env
    echo "==> Running database seeds..."
    $COMPOSE run --rm migrate sh -c "npx tsx database/seeds/index.ts"
    echo "Done."
    exit 0
    ;;
esac

require_env

echo "==> Building images..."
$COMPOSE build

echo "==> Starting stack..."
$COMPOSE up -d

echo "==> Current status:"
$COMPOSE ps

# shellcheck disable=SC1091
set -a; . ./.env; set +a
echo
echo "Deployment started. Once DNS + TLS settle (first run can take ~1 min):"
echo "   Frontend : https://${APP_DOMAIN}"
echo "   API      : https://${API_DOMAIN}/health"
echo
echo "Tail logs with:  ./infra/deploy.sh logs"
echo "Run migrations:  ./infra/deploy.sh migrate"
