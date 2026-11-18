#!/usr/bin/env bash
set -euo pipefail

repository_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$repository_root"
# shellcheck source=infra/scripts/check-onboarding.sh
source "$repository_root/infra/scripts/check-onboarding.sh"
check_onboarding_source

phase="${1:-all}"

source_is_current() {
  git fetch origin "$CI_DEFAULT_BRANCH"
  [[ "$CI_COMMIT_SHA" == "$(git rev-parse "origin/$CI_DEFAULT_BRANCH")" ]] || {
    printf '%s moved after this pipeline started; start a new pipeline to release it.\n' "$CI_DEFAULT_BRANCH" >&2
    return 1
  }
}

publish_release() {
  : "${APP_VERSION:?APP_VERSION is required}"
  : "${REGISTRY_PULL_IMAGE:?REGISTRY_PULL_IMAGE is required}"
  check_onboarding_head "${CI_COMMIT_SHA:-}"
  # Refuse before and after the image build: only the tip of main is released.
  source_is_current
  infra/scripts/ci-container-build.sh publish
  image_digest="$(< image-digest.txt)"

  source_is_current
  git checkout -B "$CI_DEFAULT_BRANCH" "origin/$CI_DEFAULT_BRANCH"
  infra/scripts/set-project-version.sh "$APP_VERSION"
  infra/scripts/set-image-tags.sh "$APP_VERSION" "$image_digest"
  git config user.name "Swirl Website GitLab CI"
  git config user.email "gitlab-ci@swirlit.dev"
  git add VERSION package.json package-lock.json infra/k8s/kustomization.yaml
  git commit -m "release: $APP_VERSION [skip ci]"
  release_revision="$(git rev-parse HEAD)"
  release_tag="v$APP_VERSION"
  git tag --annotate "$release_tag" --message "Swirl Website $APP_VERSION"

  major="${APP_VERSION%%.*}"
  remainder="${APP_VERSION#*.}"
  minor="${remainder%%.*}"
  next_version="$major.$((minor + 1)).0"
  infra/scripts/set-project-version.sh "$next_version"
  git add VERSION package.json package-lock.json
  infra/scripts/commit-deployment.sh "chore: prepare $next_version [skip ci]"
  deploy_revision="$(git rev-parse HEAD)"
  git push origin "HEAD:$CI_DEFAULT_BRANCH" "refs/tags/$release_tag"
  image="$REGISTRY_PULL_IMAGE:$APP_VERSION@$image_digest"
  printf 'APP_VERSION=%s\nDEPLOY_REVISION=%s\nRELEASE_REVISION=%s\nRELEASE_TAG=%s\nNEXT_VERSION=%s\nIMAGE=%s\n' \
    "$APP_VERSION" "$deploy_revision" "$release_revision" "$release_tag" "$next_version" "$image" > release.env

  release_json="$(jq -n --arg tag "$release_tag" --arg name "Swirl Website $APP_VERSION" \
    --arg description "Published Swirl Website release $APP_VERSION ($image) for production deployment through Argo CD." \
    --arg image_url "${CI_SERVER_URL}/${CI_PROJECT_PATH}/container_registry" \
    '{tag_name:$tag,name:$name,description:$description,assets:{links:[{name:"Container image",url:$image_url,link_type:"image"}]}}')"
  curl --fail --show-error --silent --request POST --header "JOB-TOKEN: $CI_JOB_TOKEN" \
    --header 'Content-Type: application/json' --data "$release_json" \
    "$CI_API_V4_URL/projects/$CI_PROJECT_ID/releases" >/dev/null
}

deploy_release() {
  if [[ -f release.env ]]; then
    # shellcheck disable=SC1091
    source release.env
  fi
  : "${DEPLOY_REVISION:?DEPLOY_REVISION is required}"
  : "${IMAGE:?IMAGE is required}"

  check_onboarding_head "$DEPLOY_REVISION"
  if [[ "${APP_ONBOARDING:-false}" == true ]]; then
    git merge-base --is-ancestor "$ONBOARDING_EXPECTED_SHA" "$DEPLOY_REVISION"
  fi

  # Repository credentials are provisioned by the operator bootstrap playbook;
  # the CI service account manages Applications without access to infra secrets.
  kubectl apply -f infra/argocd/application.yaml
  kubectl annotate application swirl-website -n infra argocd.argoproj.io/refresh=hard --overwrite
  deadline=$((SECONDS + 900))
  while (( SECONDS < deadline )); do
    application="$(kubectl get application swirl-website -n infra -o json 2>/dev/null || true)"
    [[ -n "$application" ]] || application='{}'
    jq -r '"Argo CD: revision=\(.status.sync.revision // "unknown") sync=\(.status.sync.status // "unknown") health=\(.status.health.status // "unknown")"' <<<"$application" || true
    if jq -e --arg revision "$DEPLOY_REVISION" '
        .status.sync.revision == $revision and
        .status.sync.status == "Synced" and .status.health.status == "Healthy"
      ' <<<"$application" >/dev/null; then
      kubectl rollout status deployment/swirl-website -n apps --timeout=120s
      kubectl get deployment swirl-website -n apps -o json | jq -e --arg image "$IMAGE" \
        'any(.spec.template.spec.containers[]; .name == "swirl-website" and .image == $image)' >/dev/null
      curl --fail --silent --show-error --retry 3 --retry-delay 3 \
        --connect-timeout 5 --max-time 15 http://swirl-website.apps.svc.cluster.local/healthz >/dev/null
      printf 'Swirl Website %s deployed at %s with %s\n' "${APP_VERSION:-}" "$DEPLOY_REVISION" "$IMAGE"
      return 0
    fi
    # If a newer commit has already advanced GitOps, this job must not report
    # its own release as the current deployment or reset that revision.
    git fetch --quiet origin "$CI_DEFAULT_BRANCH"
    if [[ "$(git rev-parse "origin/$CI_DEFAULT_BRANCH")" != "$DEPLOY_REVISION" ]]; then
      if [[ "${APP_ONBOARDING:-false}" == true ]]; then
        echo 'A newer revision replaced onboarding during deployment' >&2
        return 1
      fi
      printf 'Production has a newer source revision; stopping the superseded rollout wait.\n'
      return 0
    fi
    sleep 10
  done
  echo 'Argo CD did not reconcile the Swirl Website release within 15 minutes' >&2
  return 1
}

case "$phase" in
  publish)
    publish_release
    ;;
  deploy)
    deploy_release
    ;;
  all)
    publish_release
    deploy_release
    ;;
  *)
    printf 'Usage: %s [publish|deploy|all]\n' "$0" >&2
    exit 2
    ;;
esac
