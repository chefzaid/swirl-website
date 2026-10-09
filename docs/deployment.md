# Kubernetes deployment

The production website is `https://swirlit.dev`, with French at `/` and English
at `/en/`. `https://www.swirlit.dev` redirects to the same apex URL, preserving
the path and query string. GitHub `chefzaid/swirl-website` and GitLab `swirlit/swirl-website`
are private source repositories.

This repository owns its runtime image, resources in the `apps` namespace,
Argo CD Application, and operator playbook. `swirl-cloud` supplies Kubernetes, the
private GitLab Registry, Vault/External Secrets, Longhorn, ingress, Cloudflare,
and the `apps/swirlit-dev-tls` certificate. Keep website ingress separate from
the Swirl Cloud portal at `cloud.swirlit.dev`, which the header's Swirl Cloud link opens.

The swirl-website Ingress routes both names to the application. The Node runtime
redirects the `www` host with HTTP 308 to the fixed `PUBLIC_ORIGIN`, retaining
the validated original path and query, including trailing slashes. Forwarded
host and protocol headers cannot change this destination. Ingress also preserves
trailing slashes during its HTTP-to-HTTPS redirect. Keep the shared TLS certificate
valid for both names. This repository owns both Cloudflare DNS records; see
[public DNS](dns.md) for direct and HA routing.
Canonical metadata and `PUBLIC_ORIGIN` remain `https://swirlit.dev`, so visitors
reach the apex before using the same-origin contact form.

Traefik serves the native Ingress on `websecure`; the platform owns the
HTTP-to-HTTPS redirect. `infra/k8s/ingress.yaml` also owns the 18 KiB request-limit
Middleware and a ServersTransport allowing 30 seconds for backend response
headers. Connection timeouts are platform settings. The route forwards the
original path to the app, which owns alias redirection; NetworkPolicy admits
the platform's Traefik pods.

## Automatic delivery

[Repository onboarding](onboarding.md) configures a new deployment through the
platform's `add-repos.sh` entrypoint, using this repository's declaration.

Push source changes to `main` to deploy. GitLab runs three required stages:

1. `verify`: type checks, lint, tests, build, security/SEO checks, dependency audit
   and delivery-script checks.
2. `image-build`: builds the Dockerfile's `prebuilt` target with Kaniko and pushes
   the verified artifacts to the registry under the source commit SHA.
3. `release`: commits the immutable image digest to
   `infra/k8s/kustomization.yaml` with `[skip ci]`, then waits for Argo CD to report
   that revision as Synced/Healthy and verifies the image and `/healthz`.

Releases share the `swirl-website-production` resource group. A superseded source
revision skips deployment; concurrent source changes cannot be overwritten.
Build artifacts and release metadata are available in GitLab for seven days.

GitLab project settings must permit this project's CI job token to push its own
repository, including its protected default branch. Registry pushes use the
standard `CI_REGISTRY_USER` and `CI_REGISTRY_PASSWORD`; no CI credentials are
committed. The shared `swirl-cloud` runner uses its existing Argo CD Application
permissions. `infra/k8s/delivery-rbac.yaml` grants it read/watch access to only the
named `apps/swirl-website` Deployment for rollout and digest verification. The pipeline
cannot modify website workloads or read application Secrets.

Complete the first pipeline before installing the Application so its image
digest replaces `bootstrap`. Argo CD reconciles `infra/k8s` from GitLab `main`.

## Private GitLab and Registry access

Vault KV v2 path `secret/apps/swirl-website/registry` contains:

| Field | Value |
| --- | --- |
| `registry` | `registry.swirlit.dev` |
| `username` | Project deploy-token username |
| `password` | Project deploy token with `read_registry` and `read_repository` |

`infra/k8s/registry-credentials.yaml` creates the pull Secret in `apps`.
`infra/argocd/repository-credentials.yaml` independently creates Argo CD's
repository credential in `infra`, using the same token for
`http://gitlab.swirlit.internal/swirlit/swirl-website.git`. The cluster's
`vault-backend` ClusterSecretStore must be ready first.

Once the first CI image digest is committed, bootstrap from a configured
operator host:

```sh
kubectl apply -f infra/argocd/repository-credentials.yaml
kubectl wait --for=condition=Ready externalsecret/swirl-website-gitlab-repository -n infra --timeout=120s
kubectl apply -f infra/k8s/delivery-rbac.yaml
ansible-playbook infra/ansible/site.yaml
```

The playbook reconciles credentials and the Application, then waits for rollout.

## GitHub and GitLab synchronization

`.github/workflows/sync-gitlab.yml` reconciles all branches and tags after a
GitHub push or GitLab `repository_dispatch`. It fast-forwards the lagging side,
merges compatible divergence with a normal merge, and fails on merge conflicts
or conflicting tag objects. It does not force-push or delete branches; coordinate
branch deletions on both remotes.

The workflow uses GitHub Actions secrets `GITLAB_SYNC_USERNAME`,
`GITLAB_SYNC_TOKEN`, and `REPOSITORY_SYNC_ADMIN_TOKEN`, plus the non-secret
`GITLAB_PROJECT_ID` variable. The GitHub credential needs repository contents,
workflow-file, Actions secret, and Actions variable access for this repository.
The GitLab project token has `write_repository` and `self_rotate`; its managed
credential is checked monthly and renewed before expiration.

An operator can reconcile these encrypted secrets and the GitLab webhook using
environment-provided administrative credentials:

```sh
GITLAB_PROJECT_PATH=swirlit/swirl-website \
GITHUB_OWNER=chefzaid GITHUB_REPOSITORY=swirl-website \
  infra/scripts/configure-repository-sync.sh
```

Set `GITLAB_ADMIN_TOKEN` and `GITHUB_ADMIN_TOKEN` in the caller's environment;
do not put token literals in command history. Set `TEST_REPOSITORY_SYNC_WEBHOOK=true` only after the
workflow is present on GitHub's default branch to send a dispatch test.

## Runtime and stored inquiries

The Node container listens on port 8080 as UID/GID 10001 with a read-only root
filesystem. `PUBLIC_ORIGIN=https://swirlit.dev` fixes the origin used by the
application. `/healthz` checks the SQLite connection. The single replica uses
the `swirl-website-data` Longhorn PVC at `/data`; the Node adapter stores
`contact.sqlite` and applies the plain SQL migrations in `db/migrations`.
`Recreate` ensures two application replicas never write the same database during
an update, with a short interruption while the replacement starts.

To use PostgreSQL and multiple replicas, follow the
[cutover guide](high-availability.md) before selecting `infra/overlays/ha`.
`DATABASE_URL` is unset in the SQLite profile and required for PostgreSQL.

The PVC uses `Prune=false` so an Argo CD manifest removal does not delete saved
inquiries. Longhorn replication is not an independent backup; include this
volume in the platform backup policy. Do not copy only the database file while
it is open in WAL mode; use SQLite's online backup support or a consistent
volume backup. Define retention and deletion for contact inquiries as part of
normal operations.

The Node adapter accepts `X-Forwarded-For` only from `TRUSTED_PROXY_CIDRS`
(`10.42.0.0/16`, the cluster's current pod network). Cloudflare appends the real visitor
address, then Traefik appends its immediate edge peer or Tunnel loopback address.
The adapter uses the penultimate address, ignoring any visitor-supplied prefix;
a single address is accepted for sanitized direct or legacy ingress requests.
Keep Traefik's `notAppendXForwardedFor` disabled and its trusted peers restricted
to Cloudflare networks in direct mode or loopback in Tunnel mode. Missing or
malformed chain tails fall back to the socket address. The adapter ignores
`X-Real-IP`, `CF-Connecting-IP` and `Forwarded` supplied by callers, then passes
only its validated address to contact rate limiting.

The swirl-website NetworkPolicy admits the `infra` ingress controller and the shared
CI jobs used for smoke tests. Update the trusted pod CIDR if the cluster network
changes. Other reverse-proxy topologies require reviewing this two-hop contract.

HTML responses use `Cache-Control: no-cache, no-transform` so intermediary
modifications cannot invalidate the generated hash-based Content Security Policy.
Cloudflare [honors `no-transform` for JavaScript Detection injection](https://developers.cloudflare.com/cloudflare-challenges/challenge-types/javascript-detections/#if-your-origin-sends-a-no-transform-header).

## Cloudflare edge cache

Every visitor receives the same prebuilt pages (no cookies, hash-based script
policy), so Cloudflare keeps the whole site at its edge until the next release.
The zone's `http_request_cache_settings` ruleset holds a rule, described
`swirl-website: cache the site until the next release`, that caches every path
on both hosts except `/api/` and `/healthz` for 30 days, whatever the origin's
`Cache-Control` says. Error responses are never stored, and browsers still follow
the origin headers: they revalidate pages with the edge on each visit, so a new
release appears as soon as the edge is purged. Cloudflare serves the cached
Brotli page to Brotli clients and decompresses it for the others. The platform's
Smart Tiered Cache applies to the whole zone. Re-create the rule if the zone is
rebuilt; `swirl-cloud` reconciles only its own rule in that ruleset.

After every successful Argo CD sync, the `swirl-website-cache-purge` PostSync Job
in `infra/k8s/cache-purge.yaml` purges both hosts, leaving other applications'
cache in the zone untouched. It runs the release image with outbound HTTPS only,
reading `purge_token` and `zone_id` from Vault KV v2 path
`secret/apps/swirl-website/cloudflare`. The token needs only **Zone → Cache Purge
→ Purge** on the zone; the current token also purges designxprint.com and is
stored for designXprint too, so rotate both Vault entries together. Onboarding
seeds both fields empty; until they are set
the Job skips the purge, so a deployment without them must not enable the cache
rule. A failed purge marks the Argo CD sync failed and Argo CD retries it; check
`kubectl logs -n apps job/swirl-website-cache-purge`. To refresh the edge
without a release, purge both hostnames in Cloudflare.

## Contact email credentials

Production uses Resend to notify `contact@swirlit.dev` from
`noreply@swirlit.dev`; the visitor's email is Reply-To. Incoming mail continues
through Cloudflare Email Routing. Verify `swirlit.dev` in Resend for sending
only, leaving its Receiving option off and retaining Cloudflare's apex MX
records. Add the sending DNS records supplied by Resend for this domain.

Store the domain-restricted Sending access key as the `RESEND_API_KEY` field
at Vault KV v2 path `secret/apps/swirl-website/contact` before deploying the email
integration. `infra/k8s/contact-notifications.yaml` synchronizes it to the
`apps/swirl-website-contact-email` Secret through `vault-backend`. The website
Deployment reads only that key through `secretKeyRef`; the sender is a
non-secret environment setting. Do not place credentials in manifests,
CI variables, build arguments, Git, or browser code.

The Secret reference is optional so a missing Secret does not prevent the
website from serving pages or saving inquiries. Email remains unconfigured
until the key is present. The ExternalSecret itself will report a sync error
until its Vault field exists; provision it before expecting a healthy Argo CD
release. After provisioning or rotating the key, wait for the ExternalSecret
to become Ready and restart the Deployment to pick up the new environment
value. External Secrets refreshes hourly by default; request a refresh when
rotating rather than assuming a restart refreshes Vault data.

The provider's successful response records `notification_status = sent`,
meaning accepted for sending, not guaranteed inbox delivery. Check Resend logs
for delivery or bounce events. Stored inquiries and failed notifications are
not automatically replayed by the default SQLite adapter. The PostgreSQL
profile's new submissions use the [bounded notification queue](high-availability.md#contact-delivery-across-replicas).
Unit tests mock the provider; live delivery needs
a separate contact submission after the domain and credentials are ready.

## Odoo CRM and Live Chat

The platform's Odoo (`swirl-cloud`, [Odoo website integration](https://gitlab.swirlit.dev/swirlit/swirl-cloud/-/blob/main/docs/guides/odoo-website.md))
receives every inquiry as a CRM lead and hosts the site's live chat. Provision
the integration once from the platform host:

```sh
python3 scripts/configure-odoo-website.py --application swirl-website \
  --website-origin https://swirlit.dev
```

It stores a key that can only create leads at Vault
`secret/apps/swirl-website/odoo` (`url`, `database`, `login`, `apiKey`).
`infra/k8s/odoo-integration.yaml` turns it into the `swirl-website-odoo`
Secret, read as `ODOO_URL`, `ODOO_DATABASE` and `ODOO_API_KEY`. The
Deployment's `swirl-cloud.io/odoo-crm-intake: "true"` pod label is what admits
the pod to Odoo on port 8069. Without these values the site still stores
inquiries; they wait in `contact_crm_queue` and are sent once Odoo is
configured. The SQLite migration and PostgreSQL schema version 2 also queue
inquiries stored before the integration existed.

A lead carries the inquiry's subject as its name, the visitor's name, email,
message and language. A Swirl Cloud demo request (`topic = 'demo'` in
`contact_messages`, added by SQLite migration `0002` and PostgreSQL schema
version 3) has no visitor subject: its lead is named
`Démo Swirl Cloud — <company>` and the company is sent as `partner_name`.

Each queue row records `status` (`queued`, `sent` or `manual`), `attempts`,
`lead_id` and `last_error`. Odoo outages and unexpected replies are retried with
backoff up to hourly; a rejected key or request (`401`, `403`, `422`) is set to
`manual` for review. After fixing the cause, requeue those rows:

```sql
UPDATE contact_crm_queue SET status = 'queued', run_at = 0 WHERE status = 'manual';
```

Every page shows the **Chat with us** button (`src/components/SiteChat.astro`),
with Chloé marked online. Hovering or focusing it only opens a connection to
Odoo; nothing is requested or stored until the visitor selects it. It then
shows a chat window of its own at once (Chloé, online, typing) while it frames
`https://odoo.swirlit.dev/platform_crm_intake/chat/1?lang=<fr|en>&open=1`, which
runs Odoo's widget on Odoo's origin, so the page's Content Security Policy only
adds `frame-src https://odoo.swirlit.dev`. Odoo's widget takes a moment to start
(about 700 KB to download and 3 MB of script to run), so the frame replaces that
window once it reports the chat open. The button reappears when the visitor
closes the chat; if the chat cannot
start within 20 seconds the button offers the contact form instead. The channel
ID (`chatChannelId`) and Odoo origin are in `data/site.ts`. The channel's
colours match the site (header and button `#d7ee92`, text `#171c11`) and are set
in Odoo under **Live Chat → Configuration → Channels**. Agents answer in
Odoo **Discuss**; while none is online, the chatbot collects the visitor's email
and request and creates a lead.

### Chloé and answering by email

The chatbot appears as **Chloé**, defined in `infra/odoo/chat-persona.json`
(name, the `chloe.png` avatar drawn from `chloe.svg`, and the English and
French text of each chatbot step); the button's window uses the same name and a
copy of the avatar in `public/assets/chloe.svg`. Odoo's chat window shows Chloé
online too. New visitor messages are emailed to the team;
replying to that email answers in the chat as Chloé, and the answer is emailed
to the visitor if they have left the site, so they can reply in turn. Apply the
persona and the email settings from the platform host:

```sh
python3 scripts/configure-odoo-website.py --application swirl-website \
  --website-origin https://swirlit.dev \
  --notify zaid@swirlit.dev --reply-sender zaid@swirlit.dev --reply-sender <mailbox you reply from> \
  --timezone Europe/Paris --chat-persona ../swirl-website/infra/odoo/chat-persona.json \
  --resend-key-path apps/swirl-website/contact --email-worker
```

Odoo then sends its mail through the same Resend account as the contact form,
from `chat@swirlit.dev`. Replies reach Odoo through Cloudflare Email Routing
(`chat@swirlit.dev` and its plus-addresses) and an Email Worker; `--email-worker`
needs `CLOUDFLARE_API_TOKEN` with Workers Scripts and Email Routing Rules edit
rights. List every address you reply from with `--reply-sender`: replies from
other senders are bounced. To change Chloé's texts or face, edit the persona
file (keep one message per chatbot step, in order) and rerun the command.

## Local delivery verification

```sh
bash infra/scripts/test-delivery.sh
kubectl kustomize infra/k8s
ansible-playbook --syntax-check infra/ansible/site.yaml
```

These checks use temporary repositories and mock infrastructure commands.
The container uses UID/GID 10001, a read-only root filesystem, `fsGroup` access to
the database volume and a separate `/tmp` volume.

## Application logs

Use [Swirl Website — Application Logs](https://kibana.swirlit.dev/app/dashboards#/view/swirl-website-logs)
in Kibana. Filter `kubernetes-logs-*` by `kubernetes.namespace_name: apps` and
`app: swirl-website`. Fluent Bit collects stdout and stderr; the runtime does not log
every HTTP request. Retention follows the platform's seven-day policy.

`infra/k8s/observability.yaml` defines the dashboard and saved searches. Its Argo
CD PostSync hook imports them using `apps/kibana-bootstrap-credentials` and the
`kubernetes-container-logs` data view.

## Automatic Sonar coverage

The default branch automatically runs the non-blocking `sonar` job after a successful
`verify`, using the Node test LCOV coverage and the source paths in
`sonar-project.properties`. Other branches and merge requests offer it as a manual job.
Sonar analyzes supported TypeScript/TSX, JavaScript, CSS and other supported source
files; Astro templates are not a supported Sonar language and remain checked by
`astro check`, the build and the compiled security/SEO checks.

The platform discovers Swirl Website from its Argo CD workloads in `apps`, provisions a
private Sonar project and masked analysis token, and refreshes missing or stale
analysis. `.sonar-auto.json` declares this contract. A default-branch pipeline with
`SONAR_SCAN_ONLY=true` runs `verify` and `sonar` without building an image or
releasing. Reports expire after seven days.
