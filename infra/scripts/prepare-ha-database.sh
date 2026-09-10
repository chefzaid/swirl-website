#!/usr/bin/env bash
# Operator preparation only. Does not change the Application or migrate data.
set -euo pipefail
set +x
umask 077
repository_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
if [[ "${CREATE_WEBSITE_DB_SECRET:-false}" == true ]]; then
  : "${WEBSITE_DB_PASSWORD:?Set WEBSITE_DB_PASSWORD in the environment}"
  secret_file="$(mktemp)"
  trap 'rm -f -- "$secret_file"; unset WEBSITE_DB_PASSWORD' EXIT
  python3 - "$secret_file" <<'PY'
import json, os, sys
from urllib.parse import quote
password = os.environ['WEBSITE_DB_PASSWORD']
if len(password) < 24:
    raise SystemExit('Use a database password of at least 24 characters')
url = 'postgresql://website_user:' + quote(password, safe='') + '@postgres.infra.svc.cluster.local:5432/website'
with open(sys.argv[1], 'w') as stream:
    json.dump({'DATABASE_URL': url, 'password': password}, stream)
PY
  # Refuse to overwrite an existing secret or silently rotate a running role.
  vault kv put -mount=secret -cas=0 apps/website/database "@$secret_file" >/dev/null
  rm -f -- "$secret_file"
  unset WEBSITE_DB_PASSWORD
fi
kubectl apply -f "$repository_root/infra/overlays/ha/database-secrets.yaml"
kubectl wait -n apps --for=condition=Ready externalsecret/website-database externalsecret/website-db-admin-credentials --timeout=120s
printf '%s\n' 'Database secrets are ready. Provision and import before selecting the HA Application path.'
