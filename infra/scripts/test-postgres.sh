#!/usr/bin/env bash
# Disposable fixture only; never reads the application DATABASE_URL.
set -euo pipefail
set +x
umask 077
cd "$(dirname "${BASH_SOURCE[0]}")/../.."
fixture_dir="$(mktemp -d)"
container=""
trap '[[ -z "$container" ]] || docker rm -f "$container" >/dev/null; rm -rf -- "$fixture_dir"' EXIT
python3 - "$fixture_dir" <<'PY'
import pathlib, secrets, sys
directory = pathlib.Path(sys.argv[1])
password = secrets.token_hex(32)
(directory/'password').write_text(password)
(directory/'env').write_text('POSTGRES_PASSWORD='+password+'\nPOSTGRES_DB=swirl_website_ha_test\n')
PY
container="$(docker run -d --rm --env-file "$fixture_dir/env" --tmpfs /var/lib/postgresql:rw,size=256m -p 127.0.0.1::5432 "${POSTGRES_TEST_IMAGE:-docker.io/library/postgres:18.6-bookworm}")"
for attempt in $(seq 1 60); do
  if docker exec "$container" pg_isready -U postgres -d swirl_website_ha_test >/dev/null 2>&1; then break; fi
  sleep 1
done
fixture_port="$(docker port "$container" 5432/tcp | cut -d: -f2)"
SWIRL_WEBSITE_PG_TEST_URL="postgresql://postgres:$(cat "$fixture_dir/password")@127.0.0.1:$fixture_port/swirl_website_ha_test" \
  node --experimental-strip-types --test tests/postgres.integration.ts
