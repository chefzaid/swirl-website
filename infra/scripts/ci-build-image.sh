#!/bin/sh
# Runs only in the official Kaniko debug container; use a fresh job for GitOps.
set -eu
set +x
umask 077

: "${CI_PROJECT_DIR:?CI_PROJECT_DIR is required}"
: "${CI_PROJECT_PATH:?CI_PROJECT_PATH is required}"
: "${CI_COMMIT_SHA:?CI_COMMIT_SHA is required}"
: "${CI_REGISTRY_USER:?CI_REGISTRY_USER is required}"
: "${CI_REGISTRY_PASSWORD:?CI_REGISTRY_PASSWORD is required}"
: "${REGISTRY_PUSH_HOST:?REGISTRY_PUSH_HOST is required}"
: "${KANIKO_EXECUTOR:=/kaniko/executor}"
cd "$CI_PROJECT_DIR"
printf '%s\n' "$CI_COMMIT_SHA" | grep -Eq '^[a-f0-9]{40}$' || { echo 'Invalid source commit'; exit 1; }
case "$REGISTRY_PUSH_HOST" in
  ''|*[!A-Za-z0-9.:-]*) echo 'Invalid private registry address' >&2; exit 1 ;;
esac
[ -s dist/server/index.js ] && [ -d dist/client ] || { echo 'Verified build artifacts are missing'; exit 1; }

DOCKER_CONFIG="${DOCKER_CONFIG:-/kaniko/.docker}"
export DOCKER_CONFIG
mkdir -p "$DOCKER_CONFIG"
trap 'rm -f -- "$DOCKER_CONFIG/config.json"; unset CI_REGISTRY_PASSWORD registry_auth' EXIT
registry_auth="$(printf '%s:%s' "$CI_REGISTRY_USER" "$CI_REGISTRY_PASSWORD" | base64 | tr -d '\n')"
printf '{"auths":{"%s":{"auth":"%s"}}}\n' "$REGISTRY_PUSH_HOST" "$registry_auth" > "$DOCKER_CONFIG/config.json"
unset registry_auth

"$KANIKO_EXECUTOR" \
  --context "dir://$CI_PROJECT_DIR" \
  --dockerfile "$CI_PROJECT_DIR/Dockerfile" \
  --target prebuilt \
  --destination "$REGISTRY_PUSH_HOST/$CI_PROJECT_PATH/site:$CI_COMMIT_SHA" \
  --insecure-registry "$REGISTRY_PUSH_HOST" \
  --cache=false \
  --digest-file "$CI_PROJECT_DIR/image-digest.txt"
grep -Eq '^sha256:[a-f0-9]{64}$' image-digest.txt || { echo 'The builder returned an invalid image digest'; exit 1; }
