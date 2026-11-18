#!/usr/bin/env bash
set -euo pipefail
set +x
umask 077

repository_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$repository_root"
# shellcheck source=infra/scripts/check-onboarding.sh
source "$repository_root/infra/scripts/check-onboarding.sh"

mode="${1:-verify}"
: "${APP_VERSION:?APP_VERSION is required}"
: "${CI_PROJECT_PATH:?CI_PROJECT_PATH is required}"
: "${REGISTRY_PUSH_HOST:?REGISTRY_PUSH_HOST is required}"
: "${KANIKO_EXECUTOR:?KANIKO_EXECUTOR is required}"
case "$REGISTRY_PUSH_HOST" in
  ''|*[!A-Za-z0-9.:-]*) echo 'Invalid private registry address' >&2; exit 1 ;;
esac

# Registry credentials for Kaniko: built with shell builtins and base64 on
# stdin, so no secret reaches a process argument, and removed on exit.
auth_entry() {
  printf '"%s":{"auth":"%s"}' "$1" "$(printf '%s:%s' "$2" "$3" | base64 | tr -d '\n')"
}
auths=()
options=()

case "$mode" in
  verify)
    options+=(--no-push --cache=false)
    ;;
  publish)
    check_onboarding_source
    check_onboarding_head "${CI_COMMIT_SHA:-}"
    : "${CI_REGISTRY_USER:?CI_REGISTRY_USER is required}"
    : "${CI_REGISTRY_PASSWORD:?CI_REGISTRY_PASSWORD is required}"
    auths+=("$(auth_entry "$REGISTRY_PUSH_HOST" "$CI_REGISTRY_USER" "$CI_REGISTRY_PASSWORD")")
    unset CI_REGISTRY_PASSWORD
    rm -f image-digest.txt
    options+=(--cache=false --digest-file "$repository_root/image-digest.txt")
    ;;
  *)
    printf 'Usage: %s [verify|publish]\n' "$0" >&2
    exit 2
    ;;
esac

# Base images come through the group's GitLab Dependency Proxy, which avoids
# Docker Hub's anonymous pull limit; Kaniko falls back to Docker Hub itself.
if [[ -n "${CI_DEPENDENCY_PROXY_GROUP_IMAGE_PREFIX:-}" && -n "${CI_DEPENDENCY_PROXY_SERVER:-}" &&
      -n "${CI_DEPENDENCY_PROXY_USER:-}" && -n "${CI_DEPENDENCY_PROXY_PASSWORD:-}" ]]; then
  auths+=("$(auth_entry "$CI_DEPENDENCY_PROXY_SERVER" "$CI_DEPENDENCY_PROXY_USER" "$CI_DEPENDENCY_PROXY_PASSWORD")")
  if [[ "${CI_DEPENDENCY_PROXY_SERVER%:443}" != "$CI_DEPENDENCY_PROXY_SERVER" ]]; then
    auths+=("$(auth_entry "${CI_DEPENDENCY_PROXY_SERVER%:443}" "$CI_DEPENDENCY_PROXY_USER" "$CI_DEPENDENCY_PROXY_PASSWORD")")
  fi
  unset CI_DEPENDENCY_PROXY_PASSWORD
  options+=(--registry-mirror "$CI_DEPENDENCY_PROXY_GROUP_IMAGE_PREFIX")
fi

if (( ${#auths[@]} )); then
  DOCKER_CONFIG="${DOCKER_CONFIG:-/kaniko/.docker}"
  export DOCKER_CONFIG
  mkdir -p "$DOCKER_CONFIG"
  trap 'rm -f -- "$DOCKER_CONFIG/config.json"' EXIT
  (IFS=,; printf '{"auths":{%s}}\n' "${auths[*]}") > "$DOCKER_CONFIG/config.json"
  unset auths
fi

[[ -s dist/runtime/main.js && -s dist/runtime/migrate-postgres.js && -d dist/client ]] || {
  echo 'The verified build artifacts from 01-build are missing' >&2
  exit 1
}
# The image's package.json carries the version being built.
infra/scripts/set-project-version.sh "$APP_VERSION"

# Kaniko creates implicit COPY parent directories with its inherited umask.
# Keep credentials private, but let the image's non-root user traverse newly
# created directories. This subshell leaves our credential umask unchanged.
(
  umask 022
  "$KANIKO_EXECUTOR" \
    --context "dir://$repository_root" \
    --dockerfile "$repository_root/Dockerfile.runtime" \
    --destination "$REGISTRY_PUSH_HOST/$CI_PROJECT_PATH/site:$APP_VERSION" \
    --insecure-registry "$REGISTRY_PUSH_HOST" \
    "${options[@]}"
)
if [[ "$mode" == publish ]]; then
  grep -Eq '^sha256:[a-f0-9]{64}$' image-digest.txt || {
    echo 'The builder returned an invalid image digest' >&2
    exit 1
  }
fi
