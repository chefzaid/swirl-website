# Future multi-node deployment

`infra/overlays/ha` is an opt-in profile for two Website replicas on different
hosts. The normal `infra/k8s` deployment remains one SQLite writer with a
`Recreate` update strategy. Selecting the HA profile requires a completed data
cutover; adding replicas to the SQLite deployment is unsafe.

The HA profile requires at least two schedulable hosts, redundant ingress, and
the platform's tested HA PostgreSQL service. PostgreSQL replication, failover,
backups and restore testing remain platform responsibilities. Two web pods
connected to a single PostgreSQL instance do not provide end-to-end HA.
Required hostname spreading intentionally leaves the second replica Pending
on a one-host cluster. The PDB keeps one healthy replica during voluntary
evictions; it does not prevent hardware failures or guarantee spare capacity.

## Database contract and preparation

Website owns database `website`, role `website_user`, and its schema. The
connection uses `postgres.infra.svc.cluster.local:5432`. Vault KV v2 path
`secret/apps/website/database` holds `DATABASE_URL` and `password`. The runtime
receives only `DATABASE_URL`; the administrator credentials at
`secret/infra/postgres` are reserved for the setup hook.

Build and release an image containing this runtime before using the overlay.
From an authenticated operator environment, prepare the ExternalSecrets:

```sh
# First creation only: supply WEBSITE_DB_PASSWORD through the environment.
CREATE_WEBSITE_DB_SECRET=true infra/scripts/prepare-ha-database.sh
# Existing secret: reconcile ExternalSecrets and wait for readiness.
infra/scripts/prepare-ha-database.sh
```

The helper refuses to overwrite an existing Vault secret. It never prints the
password or changes the Application. Both database ExternalSecrets and the
existing registry pull Secret must be ready **before** selecting the HA path:
Argo CD executes PreSync hooks before creating normal-sync ExternalSecrets.

The overlay has two ordered PreSync Jobs. `website-db-setup` serializes role and
database provisioning with a PostgreSQL advisory lock. It refuses an existing
database with a different owner. `website-schema-migration` initializes or
checks the versioned schema under a transaction lock. Both inherit the exact
Deployment image digest. The website process only checks schema readiness; it
does not create PostgreSQL tables during concurrent pod startup. Neither hook
imports SQLite data or sends email.

For the first cutover, run these two rendered Jobs in order and wait for each
to Complete while the default Application path is still selected. Rendering
with `kubectl kustomize infra/overlays/ha` supplies their namespace and image;
do not apply the whole overlay to prepare the database. Delete an earlier
completed Job before explicitly rerunning that Job. Subsequent HA releases
run the hooks through Argo CD automatically.

## Explicit SQLite cutover

Plan a short maintenance window. Pause application reconciliation and block
contact submissions before taking the final backup, keeping writes blocked
until PostgreSQL is selected. A snapshot taken while new enquiries continue
arriving cannot be used as a final cutover snapshot. Use SQLite's online backup
API or a verified consistent volume backup; copying an open database file
without its WAL loses committed records.

The importer accepts a private, standalone SQLite snapshot with no active WAL.
Run the built command from the repository or the corresponding image, using
an environment-provided `DATABASE_URL` that can reach the target PostgreSQL
service:

```sh
node dist/runtime/migrate-postgres.js --sqlite-snapshot /private/contact-cutover.sqlite
```

An operator outside Kubernetes can port-forward `infra/service/postgres` and
use a temporary local connection URL with the same database and role. Keep
URLs and snapshots out of Git, command history and logs. For a fresh empty
installation, the schema hook is sufficient; no snapshot import is needed.

The import runs in one transaction, preserving contact IDs, content,
timestamps, notification statuses and quota counters. Repeating the same
snapshot is a no-op. A conflicting existing record or counter aborts the
whole import; it never overwrites newer data. Historical `failed`, pending
and `unconfigured` notifications retain their status and are **not** enqueued
or replayed. Compare source and target counts and representative records
before allowing submissions. Include PostgreSQL in the backup policy.

Then persist `spec.source.path: infra/overlays/ha` in the app-owned
`infra/argocd/application.yaml` and apply that Application through the normal
operator playbook. A temporary live Argo path override is insufficient because
bootstrap can reapply the repository's Application. Image releases still
update the base Kustomization digest, inherited by the HA profile and hooks.
Keep the old PVC as a recovery snapshot; the HA Deployment does not mount it
and its existing `Prune=false` protection remains. Once PostgreSQL accepts new
writes, returning to SQLite requires reconciling those writes first.

## Contact delivery across replicas

PostgreSQL serializes the small shared submission quota and inserts each
enquiry with its notification job in the same transaction. Request IDs remain
idempotent across pods. A request tries immediate delivery after commit; each
pod also drains queued jobs. Row locks claim work, a two-minute lease bounds
ownership, and a unique claim token fences completion after recovery. A failed
email attempt never removes the saved enquiry. Liveness uses `/livez`;
readiness `/healthz` checks the database schema.

Resend retries use the existing `contact/<id>` key and the stored sender and
contact content. They stop after six attempts or twenty hours from the first
attempt, before Resend's [24-hour key retention](https://resend.com/docs/dashboard/emails/idempotency-keys).
Keep notification formatting stable while retries remain pending. Exhausted
or expired jobs become `manual`, including a crash after acceptance whose
result cannot be recovered safely. `sent` means provider acceptance, not
confirmed inbox delivery.

Microsoft Graph's [sendMail API](https://learn.microsoft.com/en-us/graph/api/user-sendmail?view=graph-rest-1.0)
does not provide the same documented idempotency-key contract. Failed or
interrupted Graph attempts therefore become `manual` without automatic retry
or provider fallback. Inspect provider/Sent Items records and the saved enquiry
before deciding on manual delivery; do not blindly reset these jobs. Historical
SQLite messages and submissions made without configured email credentials
remain outside the automatic queue. Provider outages can delay email even
while enquiries remain available in PostgreSQL.

## Verification

```sh
npm run check
npm run lint
npm test
npm run build
bash infra/scripts/test-delivery.sh
bash infra/scripts/test-postgres.sh
```

The PostgreSQL test helper creates and removes its own localhost-only Docker
fixture. It does not use `DATABASE_URL`. Tests exercise concurrent quotas,
duplicate submissions, rollback, claim fencing, Graph recovery, retry expiry,
idempotent/conflicting snapshot imports and database-dependent readiness.

Before admitting traffic on future nodes, test an actual host loss, PostgreSQL
primary failover, application drain and restore from backup. Verify enquiries
and quotas persist, old notification owners cannot overwrite recovered work,
the real client IP remains trusted only through the configured ingress, and
both root and `www` URLs work. These are operator acceptance tests; rendering
the profile on a one-host cluster does not establish HA.
