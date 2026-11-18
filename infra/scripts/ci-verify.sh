#!/usr/bin/env bash
set -euo pipefail

repository_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$repository_root"

phase="${1:-all}"

prepare_sources() {
  infra/scripts/set-project-version.sh "$APP_VERSION"
}

build_application() {
  python3 infra/scripts/test-onboarding.py
  bash infra/scripts/test-delivery.sh
  kubectl kustomize infra/k8s >/dev/null
  kubectl kustomize infra/overlays/ha >/dev/null
  kubectl apply --dry-run=client --validate=false \
    -f infra/argocd/application.yaml >/dev/null

  npm ci --no-fund --prefer-offline
  npm run check
  npm run build
  python3 scripts/check-built-security.py
  python3 scripts/check-built-seo.py
}

test_application() {
  npm ci --no-fund --prefer-offline
  # The type-aware lint needs Astro's generated types (.astro/), which 01-build
  # creates with astro check in its own job.
  npx astro sync
  npm run lint
  npm run format:check
  npm run test:coverage
  node scripts/audit.mjs
}

prepare_sources
case "$phase" in
  build)
    build_application
    ;;
  test)
    test_application
    ;;
  all)
    build_application
    test_application
    ;;
  *)
    printf 'Usage: %s [build|test|all]\n' "$0" >&2
    exit 2
    ;;
esac
