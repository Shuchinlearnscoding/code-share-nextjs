#!/usr/bin/env bash
# Dumps the Neon database (schema + data) to backups/neondb-<timestamp>.sql
#
# The dump includes the neon_auth schema, so it contains user rows, session
# tokens and JWKS private keys. backups/ is gitignored — keep it that way.
#
# Usage:  ./scripts/backup-db.sh
# Restore: psql "$DATABASE_URL" -f backups/neondb-<timestamp>.sql

set -euo pipefail

cd "$(dirname "$0")/.."

if [ -f .env.local ]; then
  set -a
  # shellcheck disable=SC1091
  . ./.env.local
  set +a
fi

if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL is not set (expected in .env.local)" >&2
  exit 1
fi

mkdir -p backups
out="backups/neondb-$(date +%Y%m%d-%H%M%S).sql"

pg_dump "$DATABASE_URL" --no-owner --no-privileges -f "$out"

echo "wrote $out ($(du -h "$out" | cut -f1))"
