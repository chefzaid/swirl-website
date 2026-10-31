# Deployment

Production is `https://swirlit.dev`; `https://www.swirlit.dev` redirects to it.
The source lives in two private repositories kept in sync: GitHub
`chefzaid/swirl-website` and GitLab `swirlit/swirl-website`.

This repository owns the website's image, its Kubernetes resources in the `apps`
namespace, its Argo CD Application, its DNS records and an operator playbook.
The `swirl-cloud` platform supplies Kubernetes, the GitLab registry,
Vault/External Secrets, Longhorn storage, Traefik ingress, Cloudflare and the
`apps/swirlit-dev-tls` certificate. The Swirl Cloud portal at
`cloud.swirlit.dev` is a separate application.

## Delivery

Push to `main` to deploy. GitLab runs:

1. **`verify`:** type check, lint, format check, unit tests with coverage,
   build, security and SEO checks of the build, `npm audit` (high) and the
   delivery and onboarding tests.
2. **`e2e`:** the Playwright and axe suite on the build, in the Playwright image.
3. **`image-build`:** once both pass, Kaniko builds the Dockerfile's `prebuilt`
   target from the verified build and pushes it under the commit SHA.
4. **`release`:** commits the image digest to `infra/k8s/kustomization.yaml`
   with `[skip ci]`, waits for Argo CD to report it Synced and Healthy, then
   checks the image and `/healthz`.

`sonar` runs after `verify` on `main` without blocking; on other branches it is
manual. A pipeline with `SONAR_SCAN_ONLY=true` runs only `verify` and `sonar`.
The platform creates the Sonar project and token from `.sonar-auto.json`.
Astro templates are not a Sonar language; `astro check` and the build checks
cover them.

Releases share the `swirl-website-production` resource group, so a newer commit
supersedes an older one and nothing is overwritten. Artifacts are kept seven
days. The CI job token must be allowed to push to this project's protected
`main`. The shared runner can only read the `apps/swirl-website` Deployment
(`infra/k8s/delivery-rbac.yaml`); it cannot change workloads or read Secrets.

Check the manifests locally with `kubectl kustomize infra/k8s` and
`ansible-playbook --syntax-check infra/ansible/site.yaml`.

## First installation

[Onboarding](onboarding.md) does this through the platform. By hand, store the
registry credentials in Vault KV v2 at `secret/apps/swirl-website/registry`:

| Field      | Value                                                        |
| ---------- | ------------------------------------------------------------ |
| `registry` | `registry.swirlit.dev`                                       |
| `username` | Project deploy-token username                                |
| `password` | Deploy token with `read_registry` and `read_repository`      |

`infra/k8s/registry-credentials.yaml` turns them into the image pull Secret and
`infra/argocd/repository-credentials.yaml` into Argo CD's access to
`http://gitlab.swirlit.internal/swirlit/swirl-website.git`. The
`vault-backend` ClusterSecretStore must be ready. Let the first pipeline commit
an image digest, then, from an operator host:

```sh
kubectl apply -f infra/argocd/repository-credentials.yaml
kubectl wait --for=condition=Ready externalsecret/swirl-website-gitlab-repository -n infra --timeout=120s
kubectl apply -f infra/k8s/delivery-rbac.yaml
ansible-playbook infra/ansible/site.yaml   # credentials, Application, rollout
```

Argo CD then follows `infra/k8s` on GitLab `main`.

## GitHub and GitLab sync

`.github/workflows/sync-gitlab.yml` reconciles branches and tags after a push on
GitHub or a dispatch from GitLab. It fast-forwards the side that lags, merges
compatible divergence and fails on conflicts; it never force-pushes or deletes
branches, so delete a branch on both remotes.

It uses the GitHub Actions secrets `GITLAB_SYNC_USERNAME`, `GITLAB_SYNC_TOKEN`
and `REPOSITORY_SYNC_ADMIN_TOKEN` and the variable `GITLAB_PROJECT_ID`. The
GitLab project token (`write_repository`, `self_rotate`) is checked monthly and
renewed before it expires. To reconcile the secrets and the GitLab webhook, with
`GITLAB_ADMIN_TOKEN` and `GITHUB_ADMIN_TOKEN` set in the environment (never on
the command line):

```sh
GITLAB_PROJECT_PATH=swirlit/swirl-website \
GITHUB_OWNER=chefzaid GITHUB_REPOSITORY=swirl-website \
  infra/scripts/configure-repository-sync.sh
```

Add `TEST_REPOSITORY_SYNC_WEBHOOK=true` to send a test dispatch once the
workflow is on GitHub's default branch.

## Ingress and client addresses

The Ingress routes both hostnames to the app, which redirects `www` with a 308
to `PUBLIC_ORIGIN`, keeping the path, query and trailing slash; forwarded
headers cannot change the destination. Traefik serves HTTPS on `websecure` and the platform redirects
HTTP. `infra/k8s/ingress.yaml` limits request bodies to 18 KiB and gives the app
30 seconds to answer. The TLS certificate must cover both names; DNS is in
[DNS](dns.md).

The app trusts `X-Forwarded-For` only from `TRUSTED_PROXY_CIDRS` (the pod
network, `10.42.0.0/16`). Cloudflare appends the visitor's address and Traefik
its own peer, so the app takes the second-to-last address; a single address is
accepted, and a malformed chain falls back to the socket address. It ignores
caller-supplied `X-Real-IP`, `CF-Connecting-IP` and `Forwarded`. Keep Traefik
appending `X-Forwarded-For` and trusting only Cloudflare (direct) or loopback
(Tunnel), and update the CIDR if the pod network changes. The NetworkPolicy
admits Traefik and the CI smoke-test jobs.

## Runtime

The container runs as UID/GID 10001 on port 8080 with a read-only root
filesystem and a separate `/tmp`. `PUBLIC_ORIGIN=https://swirlit.dev` fixes the
origin. Every response gets security headers; HTML is compressed (Brotli or
gzip) and sent with `Cache-Control: no-cache, no-transform`, so no intermediary
can alter it and break the hash-based Content Security Policy.

`/healthz` checks the database. The probes allow 5 seconds per answer (3 for
readiness) and restart the container only after a minute without one, so a busy
node does not restart a working server; `test-delivery.sh` rejects shorter
values.

One replica stores `contact.sqlite` on the `swirl-website-data` Longhorn volume
at `/data` and applies `db/migrations` at startup. The `Recreate` strategy
prevents two writers during an update, at the cost of a short interruption. The
volume has `Prune=false`, so removing it from the manifests does not delete
inquiries. Longhorn replicas are not a backup: include the volume in the
platform backups, and back up SQLite with its online backup or a consistent
volume snapshot, never by copying the open file. PostgreSQL and two replicas
are in [PostgreSQL and HA](high-availability.md).

Each build renews the 180-day expiry of `/.well-known/security.txt`, so release
at least every few months.

## Cloudflare edge cache

Pages are the same for every visitor, so Cloudflare keeps the whole site at its
edge until the next release. A rule in the zone's `http_request_cache_settings`
ruleset, described `swirl-website: cache the site until the next release`,
caches every path on both hosts except `/api/` and `/healthz` for 30 days.
Errors are never cached. Browsers still revalidate each page with the edge, so
a release shows as soon as the edge is purged. Re-create the rule if the zone is
rebuilt; `swirl-cloud` manages only its own rule in that ruleset.

After each successful sync, the `swirl-website-cache-purge` PostSync Job
(`infra/k8s/cache-purge.yaml`) purges both hosts and nothing else in the zone.
It reads `purge_token` and `zone_id` from Vault `secret/apps/swirl-website/cloudflare`.
The token needs only **Zone → Cache Purge → Purge**; it is shared with
designXprint, so rotate both Vault entries together. Until both fields are set
the Job skips the purge, so do not enable the cache rule before. A failed purge
fails the sync and Argo CD retries it
(`kubectl logs -n apps job/swirl-website-cache-purge`). To refresh the edge
without a release, purge both hostnames in Cloudflare.

## Contact email

Resend notifies `contact@swirlit.dev` from `noreply@swirlit.dev`, with the
visitor as Reply-To. Incoming mail stays on Cloudflare Email Routing: verify
`swirlit.dev` in Resend for sending only, add the DNS records Resend gives
for it, and keep Cloudflare's MX records.

Store the domain-restricted sending key as `RESEND_API_KEY` in Vault
`secret/apps/swirl-website/contact`; `infra/k8s/contact-notifications.yaml`
syncs it to the `swirl-website-contact-email` Secret. Never put credentials in
manifests, CI variables, build arguments, Git or browser code. The Secret is
optional, so the site serves pages and stores inquiries without it, but the
ExternalSecret reports an error until the Vault field exists. After setting or
rotating the key, wait for the ExternalSecret to be Ready (it refreshes hourly;
request a refresh), then restart the Deployment.

`notification_status = sent` means Resend accepted the email, not that it
arrived; check Resend's logs. Microsoft Graph (`MS_*`) is the alternative when
`RESEND_API_KEY` is empty. With SQLite, failed notifications are not retried;
PostgreSQL has a [retry queue](high-availability.md#contact-delivery-across-replicas).

## Odoo CRM and Live Chat

The platform's Odoo receives every inquiry as a lead and hosts the chat (see the
platform's [Odoo website guide](https://gitlab.swirlit.dev/swirlit/swirl-cloud/-/blob/main/docs/guides/odoo-website.md)).
Set it up once from the platform host:

```sh
python3 scripts/configure-odoo-website.py --application swirl-website \
  --website-origin https://swirlit.dev
```

This stores a key that can only create leads at Vault
`secret/apps/swirl-website/odoo`; `infra/k8s/odoo-integration.yaml` passes it
to the app as `ODOO_URL`, `ODOO_DATABASE` and `ODOO_API_KEY`, and the pod label
`swirl-cloud.io/odoo-crm-intake: "true"` admits the pod to Odoo. Without these
values inquiries wait in `contact_crm_queue` and are sent once Odoo is set up.

A lead is named after the inquiry's subject, or `Démo Swirl Cloud — <company>`
for a demo request (sent with the company as `partner_name`). Queue rows record
`status` (`queued`, `sent` or `manual`), `attempts`, `lead_id` and `last_error`.
Outages are retried with backoff up to hourly; a rejected key or request (401,
403, 422) becomes `manual`. Once the cause is fixed:

```sql
UPDATE contact_crm_queue SET status = 'queued', run_at = 0 WHERE status = 'manual';
```

The **Chat with us** button (`components/SiteChat.astro`) shows Chloé
online. Nothing is requested or stored until it is selected (hovering only
opens a connection). It then shows at once a window drawn like Odoo's while it
frames `https://odoo.swirlit.dev/platform_crm_intake/chat/1?lang=<fr|en>&open=1`;
Odoo's widget (about 700 KB) replaces it once the chat is open, and after 20
seconds without it the button offers the contact form instead. Because the
widget runs on Odoo's origin, the page's CSP only adds
`frame-src https://odoo.swirlit.dev`. The origin and channel ID are in
`data/site.ts`; the channel's colours (`#d7ee92`, text `#171c11`) are set in
Odoo under **Live Chat → Configuration → Channels**. Agents answer in Odoo
**Discuss**; when none is online, the chatbot collects the visitor's email and
request and creates a lead.

### Chloé and answering by email

`infra/odoo/chat-persona.json` defines Chloé: her name, avatar (`chloe.png`,
drawn from the site's `public/assets/chloe.svg`) and the French and English
text of each chatbot step (one message per step, in order). New visitor messages
are emailed to the team, and replying to that email answers in the chat as
Chloé, by email too if the visitor has left. Apply the persona and email
settings from the platform host:

```sh
python3 scripts/configure-odoo-website.py --application swirl-website \
  --website-origin https://swirlit.dev \
  --notify zaid@swirlit.dev --reply-sender zaid@swirlit.dev --reply-sender <mailbox you reply from> \
  --timezone Europe/Paris --chat-persona ../swirl-website/infra/odoo/chat-persona.json \
  --resend-key-path apps/swirl-website/contact --email-worker
```

Odoo sends through the same Resend account, from `chat@swirlit.dev`; replies
come back through Cloudflare Email Routing and an Email Worker (`--email-worker`
needs `CLOUDFLARE_API_TOKEN` with Workers Scripts and Email Routing Rules edit
rights). Replies from addresses not listed with `--reply-sender` are bounced.

## Logs

The [Swirl Website — Application Logs](https://kibana.swirlit.dev/app/dashboards#/view/swirl-website-logs)
dashboard in Kibana shows the app's output (`kubernetes-logs-*`, namespace
`apps`, `app: swirl-website`), kept seven days. Requests are not logged one by
one. `infra/k8s/observability.yaml` defines the dashboard and saved searches;
a PostSync hook imports them with `apps/kibana-bootstrap-credentials`.
