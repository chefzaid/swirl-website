#!/usr/bin/env bash
set -euo pipefail
set +x
umask 077

repository_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$repository_root"
for required in CI_COMMIT_SHA CI_DEFAULT_BRANCH REGISTRY_PULL_IMAGE; do
  [[ -n "${!required:-}" ]] || { printf '%s is required\n' "$required" >&2; exit 1; }
done
[[ "$CI_COMMIT_SHA" =~ ^[a-f0-9]{40}$ ]] || { echo 'Invalid source commit'; exit 1; }
[[ "$(git rev-parse HEAD)" == "$CI_COMMIT_SHA" ]] || { echo 'Build checkout does not match the pipeline source'; exit 1; }

source_is_current() {
  git fetch --quiet origin "$CI_DEFAULT_BRANCH" || { echo 'Unable to verify the current source revision' >&2; exit 1; }
  [[ "$(git rev-parse "origin/$CI_DEFAULT_BRANCH")" == "$CI_COMMIT_SHA" ]]
}

skip_stale_release() {
  printf 'DEPLOY_SKIPPED=true\nSOURCE_REVISION=%s\n' "$CI_COMMIT_SHA" > release.env
  printf 'A newer source commit is on %s; this pipeline will not change production.\n' "$CI_DEFAULT_BRANCH"
  exit 0
}

if ! source_is_current; then skip_stale_release; fi
[[ -s image-digest.txt ]] || { echo 'The image-build digest artifact is missing'; exit 1; }
image_digest="$(< image-digest.txt)"
[[ "$image_digest" =~ ^sha256:[a-f0-9]{64}$ ]] || { echo 'The image builder returned an invalid digest'; exit 1; }

# This job starts in a fresh tools image after Kaniko exits. The source check
# above excludes stale builds; a normal push rejects any race after the check.
git checkout --quiet -B "$CI_DEFAULT_BRANCH" "origin/$CI_DEFAULT_BRANCH"
bash infra/scripts/set-image-digest.sh "$image_digest"
git config user.name 'Website GitLab CI'
git config user.email 'gitlab-ci@swirlit.dev'
git add infra/k8s/kustomization.yaml
if ! git diff --cached --quiet; then
  git commit --quiet -m "deploy: website ${CI_COMMIT_SHA:0:12} [skip ci]"
  git push origin "HEAD:$CI_DEFAULT_BRANCH"
fi
deploy_revision="$(git rev-parse HEAD)"
printf 'DEPLOY_SKIPPED=false\nSOURCE_REVISION=%s\nDEPLOY_REVISION=%s\nIMAGE=%s@%s\n' \
  "$CI_COMMIT_SHA" "$deploy_revision" "$REGISTRY_PULL_IMAGE" "$image_digest" > release.env

# Repository credentials are provisioned by the operator bootstrap playbook;
# the CI service account manages Applications without access to infra secrets.
kubectl apply -f infra/argocd/application.yaml
kubectl annotate application website -n infra argocd.argoproj.io/refresh=hard --overwrite
deadline=$((SECONDS + 900))
while (( SECONDS < deadline )); do
  application="$(kubectl get application website -n infra -o json)"
  if jq -e --arg revision "$deploy_revision" '
      .status.sync.revision == $revision and
      .status.sync.status == "Synced" and .status.health.status == "Healthy"
    ' <<< "$application" >/dev/null; then
    kubectl rollout status deployment/website -n apps --timeout=120s
    kubectl get deployment website -n apps -o json | jq -e \
      --arg image "$REGISTRY_PULL_IMAGE@$image_digest" \
      'any(.spec.template.spec.containers[]; .name == "website" and .image == $image)' >/dev/null
    curl --fail --silent --show-error --retry 3 --retry-delay 3 \
      --connect-timeout 5 --max-time 15 http://website.apps.svc.cluster.local/healthz >/dev/null
    printf 'Website deployed at %s with %s@%s\n' "$deploy_revision" "$REGISTRY_PULL_IMAGE" "$image_digest"
    exit 0
  fi
  # If a newer pipeline has already advanced GitOps, an older job must not
  # report its own release as the current deployment or reset that revision.
  git fetch --quiet origin "$CI_DEFAULT_BRANCH"
  if [[ "$(git rev-parse "origin/$CI_DEFAULT_BRANCH")" != "$deploy_revision" ]]; then
    printf 'Production has a newer source revision; stopping the superseded rollout wait.\n'
    exit 0
  fi
  sleep 10
done
echo 'Argo CD did not reconcile the website release within 15 minutes' >&2
exit 1
