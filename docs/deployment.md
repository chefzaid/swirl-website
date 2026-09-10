# K3s deployment

The production website is `https://swirlit.dev`, with French at `/` and English
at `/en/`. `https://www.swirlit.dev` redirects to the same apex URL, preserving
the path and query string. GitHub `chefzaid/website` and GitLab `swirlit/website`
are private source repositories. Publishing the website does not change repository
visibility or the separate Sites preview's access settings.

This repository owns its runtime image, resources in the `apps` namespace,
Argo CD Application, and operator playbook. `bm-cluster` supplies K3s, the
private GitLab Registry, Vault/External Secrets, Longhorn, ingress, Cloudflare,
and the existing `apps/swirlit-dev-tls` certificate. The platform's former apex
dashboard redirect must be removed before the website Ingress owns `swirlit.dev`.
The dashboard remains available at `dashboard.swirlit.dev`.

The website Ingress routes both names to the application. The Node runtime
redirects the `www` host with HTTP 308 to the fixed `PUBLIC_ORIGIN`, retaining
the validated original path and query, including trailing slashes. Forwarded
host and protocol headers cannot change this destination. Ingress also preserves
trailing slashes during its HTTP-to-HTTPS redirect. Keep the shared TLS certificate
valid for both names. This repository owns both Cloudflare DNS records; see
[public DNS](dns.md) for direct and HA routing.
Canonical metadata and `PUBLIC_ORIGIN` remain `https://swirlit.dev`, so visitors
reach the apex before using the same-origin contact form.

## Automatic delivery

[Repository onboarding](onboarding.md) configures a new deployment through the
platform's `add-repos.sh` entrypoint, using this repository's declaration.

GitLab runs the required `verify` job for every branch or merge request. It
installs the lockfile dependencies, performs Astro/TypeScript and lint checks,
runs contact/runtime tests, builds all documents, verifies the compiled CSP and
public artifacts, checks SEO, rejects high/critical npm audit findings, and
tests the delivery scripts. A failure blocks the release.

Successful `main` pipelines automatically build the Dockerfile's `prebuilt`
target from those verified `dist` artifacts in a dedicated official Kaniko
container. It publishes a commit-SHA image tag to the internal Registry and
passes its digest artifact to a fresh release job, which updates
`infra/k8s/kustomization.yaml` with that immutable digest. The runtime pulls
`registry.swirlit.dev/swirlit/website/site@sha256:...` through the cluster's
private Registry mapping.

The digest update is a normal Git push with `[skip ci]`, which prevents a
recursive pipeline. Releases share the `website-production` resource group.
Before updating GitOps, the release job verifies that its source commit still
leads `main`; a superseded job skips deployment even if its image was already
published. A concurrent source push after that check causes the normal Git push
to fail rather than overwrite it.
The successful job waits for Argo CD to report the exact deployment revision
as Synced/Healthy, verifies the running Deployment's image digest, and checks
the internal `/healthz` endpoint. Build artifacts and release metadata remain
available in GitLab for seven days.

GitLab project settings must permit this project's CI job token to push its own
repository, including its protected default branch. Registry pushes use the
standard `CI_REGISTRY_USER` and `CI_REGISTRY_PASSWORD`; no CI credentials are
committed. The shared `bm-cluster` runner uses its existing Argo CD Application
permissions. `infra/k8s/delivery-rbac.yaml` grants it read/watch access to only the
named `apps/website` Deployment for rollout and digest verification. The pipeline
cannot modify website workloads or read application Secrets.

The initial `bootstrap` image is deliberately replaced by the first successful
pipeline before the Application is installed. Later deployments require only a
source push; Argo CD continuously reconciles `infra/k8s` from GitLab `main`.

## Private GitLab and Registry access

Vault KV v2 path `secret/apps/website/registry` contains:

| Field | Value |
| --- | --- |
| `registry` | `registry.swirlit.dev` |
| `username` | Project deploy-token username |
| `password` | Project deploy token with `read_registry` and `read_repository` |

`infra/k8s/registry-credentials.yaml` creates the pull Secret in `apps`.
`infra/argocd/repository-credentials.yaml` independently creates Argo CD's
repository credential in `infra`, using the same token for
`http://gitlab.swirlit.internal/swirlit/website.git`. The cluster's
`vault-backend` ClusterSecretStore must be ready first.

Once the first CI image digest is committed, bootstrap from a configured
operator host:

```sh
kubectl apply -f infra/argocd/repository-credentials.yaml
kubectl wait --for=condition=Ready externalsecret/website-gitlab-repository -n infra --timeout=120s
kubectl apply -f infra/k8s/delivery-rbac.yaml
ansible-playbook infra/ansible/site.yaml
```

The playbook reconciles credentials and the Application, requests a fresh Argo
CD reconciliation, and waits for the Deployment. Credentials remain in Vault
and Kubernetes Secrets; they are never copied into Git.

## GitHub and GitLab synchronization

`.github/workflows/sync-gitlab.yml` reconciles all branches and tags after a
GitHub push or GitLab `repository_dispatch`. It fast-forwards the lagging side,
merges compatible divergence with a normal merge, and fails on merge conflicts
or conflicting tag objects. It never force-pushes or changes repository
visibility. Equivalent refs produce no write, so notification round trips stop
once both sides match. Branch deletions require coordination; an existing
branch on either remote is preserved.

The workflow uses GitHub Actions secrets `GITLAB_SYNC_USERNAME`,
`GITLAB_SYNC_TOKEN`, and `REPOSITORY_SYNC_ADMIN_TOKEN`, plus the non-secret
`GITLAB_PROJECT_ID` variable. The GitHub credential needs repository contents,
workflow-file, Actions secret, and Actions variable access for this repository.
The GitLab project token has `write_repository` and `self_rotate`; its managed
credential is checked monthly and renewed before expiration.

An operator can reconcile these encrypted secrets and the GitLab webhook using
environment-provided administrative credentials:

```sh
GITLAB_PROJECT_PATH=swirlit/website \
GITHUB_OWNER=chefzaid GITHUB_REPOSITORY=website \
  infra/scripts/configure-repository-sync.sh
```

Set `GITLAB_ADMIN_TOKEN` and `GITHUB_ADMIN_TOKEN` in the caller's environment;
do not put token literals in command history. The helper discovers the GitLab
project ID and writes the workflow variable. It can prepare credentials before
the workflow exists. Set `TEST_REPOSITORY_SYNC_WEBHOOK=true` only after the
workflow is present on GitHub's default branch to send a dispatch test.

## Runtime and stored enquiries

The Node container listens on port 8080 as UID/GID 10001 with a read-only root
filesystem. `PUBLIC_ORIGIN=https://swirlit.dev` fixes the origin used by the
application. `/healthz` checks the SQLite connection. The single replica uses
the `website-data` Longhorn PVC at `/data`; the Node adapter stores
`contact.sqlite` and applies the existing migrations. `Recreate` ensures two
application replicas never write the same database during an update, with a
short interruption while the replacement starts.

The opt-in [multi-node profile and PostgreSQL cutover](high-availability.md)
remove that single-writer constraint after its prerequisites are met. The
default Application path and SQLite volume remain unchanged until an operator
selects the profile.

The PVC uses `Prune=false` so an Argo CD manifest removal does not delete saved
enquiries. Longhorn replication is not an independent backup; include this
volume in the platform backup policy. Do not copy only the database file while
it is open in WAL mode; use SQLite's online backup support or a consistent
volume backup. Define retention and deletion for contact enquiries as part of
normal operations.

Ingress overwrites `X-Real-IP` with the client address validated by the platform's
Cloudflare real-IP configuration. The Node adapter trusts that header only
from `10.42.0.0/16`, the current K3s pod network. The website NetworkPolicy admits
only the `infra` ingress controller and the shared CI jobs used for smoke tests.
Update this CIDR if the cluster pod network changes. An arbitrary Internet
`X-Forwarded-For` or `CF-Connecting-IP` header is not trusted by the runtime.

HTML responses use `Cache-Control: no-cache, no-transform` so intermediary
modifications cannot invalidate the generated hash-based Content Security Policy.
Cloudflare [honors `no-transform` for JavaScript Detection injection](https://developers.cloudflare.com/cloudflare-challenges/challenge-types/javascript-detections/#if-your-origin-sends-a-no-transform-header).
This is scoped to website documents; it does not relax CSP or change the zone's
WAF settings. Static assets retain their separate cache policy.

The contact form persists enquiries without an email provider. Resend and
Microsoft Graph notifications require the server-side credentials described
in the main README. Deploying this website does not send a test email or import
data from the separate Sites database.

## Contact email credentials

Production uses Resend to notify `contact@swirlit.dev` from
`noreply@swirlit.dev`; the visitor's email is Reply-To. Incoming mail continues
through Cloudflare Email Routing. Verify `swirlit.dev` in Resend for sending
only, leaving its Receiving option off and retaining Cloudflare's apex MX
records. The main README describes the separate sending DNS records.

Store the domain-restricted Sending access key as the `RESEND_API_KEY` field
at Vault KV v2 path `secret/apps/website/contact` before deploying the email
integration. `infra/k8s/contact-notifications.yaml` synchronizes it to the
`apps/website-contact-email` Secret through `vault-backend`. The website
Deployment reads only that key through `secretKeyRef`; the sender is a
non-secret environment setting. Do not place credentials in manifests,
CI variables, build arguments, Git, or browser code.

The Secret reference is optional so a missing Secret does not prevent the
website from serving pages or saving enquiries. Email remains unconfigured
until the key is present. The ExternalSecret itself will report a sync error
until its Vault field exists; provision it before expecting a healthy Argo CD
release. After provisioning or rotating the key, wait for the ExternalSecret
to become Ready and restart the Deployment to pick up the new environment
value. External Secrets refreshes hourly by default; request a refresh when
rotating rather than assuming a restart refreshes Vault data.

The provider's successful response records `notification_status = sent`,
meaning accepted for sending, not guaranteed inbox delivery. Check Resend logs
for delivery or bounce events. Stored enquiries and failed notifications are
not automatically replayed by the default SQLite adapter. The PostgreSQL
profile's new submissions use the [bounded notification queue](high-availability.md#contact-delivery-across-replicas).
Unit tests mock the provider; live delivery needs
a separate contact submission after the domain and credentials are ready.

## Local delivery verification

```sh
bash infra/scripts/test-delivery.sh
kubectl kustomize infra/k8s
ansible-playbook --syntax-check infra/ansible/site.yaml
```

The delivery tests use temporary local Git repositories and mock registry and
Kubernetes commands. They verify the canonical redirect/TLS contract, immutable
release updates, credential/resource contracts, and source changes before and
during image construction without touching a live cluster.

The website container runs with UID/GID 10001 and a read-only root filesystem.
The contact database volume receives group access through `fsGroup`; temporary
files remain on the dedicated `/tmp` volume.

## Application logs

Open [Website — Application Logs](https://kibana.swirlit.dev/app/dashboards#/view/website-logs)
in Kibana for Website's container output, with separate recent-log and
warnings/errors panels. The dashboard opens the last 24 hours and refreshes every
30 seconds; widen the time picker when the application has been quiet.

Fluent Bit automatically collects stdout and stderr from every container in
`apps`. Website is selected with `kubernetes.namespace_name : "apps" and
app : "website"` in the shared `kubernetes-logs-*` data view. The warnings/errors
panel includes stderr so unstructured Node diagnostics are visible alongside
structured warning/error levels. These are application-emitted logs; the runtime
does not emit an access log for every HTTP request.

`infra/k8s/observability.yaml` owns the saved searches and dashboard. Its Argo CD
PostSync hook imports them using the platform-managed
`apps/kibana-bootstrap-credentials` Secret and the shared
`kubernetes-container-logs` data view. The hook deletes itself after success.
Logs continue to use the platform's seven-day lifecycle policy; this dashboard
requires no additional collector, index, persistent volume, or application image.

## Automatic Sonar coverage

The default branch automatically runs the non-blocking `sonar` job after `verify`,
including when verification reports a failure, using available Node test LCOV
coverage and the source paths in `sonar-project.properties`.
Sonar analyzes supported TypeScript/TSX, JavaScript, CSS and other supported source
files; Astro templates are not a supported Sonar language and remain checked by
`astro check`, the build and the compiled security/SEO checks.

The platform discovers Website from its Argo CD workloads in `apps`, provisions a
private Sonar project and masked analysis token, and refreshes missing or stale
analysis. `.sonar-auto.json` declares this contract. A default-branch pipeline with
`SONAR_SCAN_ONLY=true` runs `verify` and `sonar` without building an image or
releasing. Its reports expire after seven days. Private repository and Sonar
visibility are preserved.
