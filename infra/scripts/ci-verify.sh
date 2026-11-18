#!/usr/bin/env bash
set -euo pipefail

repository_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$repository_root"

phase="${1:-all}"
suites=(static unit delivery audit)

prepare_sources() {
  infra/scripts/set-project-version.sh "$APP_VERSION"
}

build_application() {
  npm ci --no-fund --prefer-offline
  npm run build
  python3 scripts/check-built-security.py
  python3 scripts/check-built-seo.py
}

# 02-test runs each suite in its own job (SUITE); none needs the build output.
test_suite() {
  case "$1" in
    static)
      npm ci --no-fund --prefer-offline
      # astro check also generates Astro's types (.astro/) for the type-aware lint.
      npm run check
      npm run lint
      npm run format:check
      ;;
    unit)
      npm ci --no-fund --prefer-offline
      # node --test sizes its pool from the node's threads, not the job's CPUs.
      TEST_CONCURRENCY="$(infra/scripts/job-cpus.sh)" npm run test:coverage
      ;;
    delivery)
      python3 infra/scripts/test-onboarding.py
      bash infra/scripts/test-delivery.sh
      kubectl kustomize infra/k8s >/dev/null
      kubectl kustomize infra/overlays/ha >/dev/null
      kubectl apply --dry-run=client --validate=false \
        -f infra/argocd/application.yaml >/dev/null
      ;;
    audit)
      # npm audit reads the lockfile; the suite needs no installed packages.
      node scripts/audit.mjs
      ;;
    *)
      printf 'SUITE must be one of: %s\n' "${suites[*]}" >&2
      exit 2
      ;;
  esac
}

prepare_sources
case "$phase" in
  build)
    build_application
    ;;
  test)
    test_suite "${SUITE:-}"
    ;;
  all)
    build_application
    for suite in "${suites[@]}"; do
      test_suite "$suite"
    done
    ;;
  *)
    printf 'Usage: %s [build|test|all]\n' "$0" >&2
    exit 2
    ;;
esac
