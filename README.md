# Swirl IT portfolio

Swirl IT's bilingual company website uses Astro 7 and React 19, served by a
Node 24 application on the bare-metal K3s cluster at `https://swirlit.dev`.
Pages are rendered at build time; the header, project gallery and contact form
hydrate independently. Contact enquiries are stored privately on the server.

## Local development

Requires Node 24.15+ and npm.

```sh
npm ci
cp .env.example .env
npm run dev
```

Astro prints the local URL (normally `http://127.0.0.1:4321`). The development
contact endpoint uses the same Node storage adapter, SQL migrations and
validation as production. By default it creates `.data/contact.sqlite`;
`DATA_DIR` can select another private directory. `.env` and local databases are
ignored by Git. Leave email credentials empty to test storage without sending
notifications. Stop development with `npx astro dev stop`.

To build and run the production Node server locally:

```sh
npm run build
npm start
```

`npm start` loads `.env` when present and listens on port 8080. The example
sets `PUBLIC_ORIGIN=http://127.0.0.1:8080`; use the same URL in your browser for
contact submissions. Production sets `PUBLIC_ORIGIN` and `DATA_DIR=/data`
through Kubernetes. `npm run build` bundles HTML and the request handler into
`dist/runtime`; CSS, scripts, fonts, images, robots.txt and the sitemap remain
in `dist/client`. The Node server applies security headers to every response.

See [K3s deployment](docs/deployment.md) for delivery and persistent storage,
and [repository onboarding](docs/onboarding.md) for a new cluster or import.

## Contact storage

The default deployment (`infra/k8s`) runs one replica with **SQLite**, using
Node's built-in `node:sqlite` module and `/data/contact.sqlite` on the
`website-data` persistent volume. `DATABASE_URL` is unset in this profile.
PostgreSQL support exists but is **opt-in**: setting `DATABASE_URL` selects it
only after the database/schema and any existing data have been prepared.
Follow [the PostgreSQL cutover guide](docs/high-availability.md) before selecting
`infra/overlays/ha`. Enabling the platform's PostgreSQL service alone does not
switch Website's contact storage.

SQLite migrations are plain SQL under `db/migrations`, applied transactionally
at startup and recorded with checksums. Preserve applied filenames and contents;
add a new numbered SQL file for a change. PostgreSQL's versioned schema and
migration/import commands are in `runtime/postgres.ts` and
`runtime/migrate-postgres.ts`. Neither adapter uses an ORM.

## Content and presentation

- `data/portfolio.ts`: bilingual services and client projects.
- `components/Portfolio.tsx`: static company presentation, rendered on the server.
- `src/layouts/Home.astro`: combines the static presentation with independent interactive components.
- `components/SiteHeader.tsx`: mobile menu, hydrated only below 1100px.
- `components/ProjectGallery.tsx`: project filters and dialogs, hydrated near the viewport; `data/project-view.ts` supplies only the active language.
- `components/ClientLogo.tsx`: shared client wordmarks in the reference rows and projects; [asset sources and theme treatment](docs/client-logos.md).
- `components/SoftwareLifecycle.tsx`: accessible four-step diagram, with modular building blocks and translated labels.
- `components/ContactForm.tsx`: accessible form and submission feedback, hydrated near the viewport.
- `app/globals.css`: shared theme and responsive styles.
- `src/layouts/Layout.astro`: SEO, language and social metadata.
- `server/contact.ts`: validation, persistence, rate limits and optional Resend or Exchange notifications.
- `server/handler.ts`: page/API routing and response security.
- `runtime/contact.ts`: shared development/production database and notification setup.
- `runtime/server.ts`: Node HTTP server, canonical redirects and safe static assets.

## Contact enquiries

The form stores enquiries in the private `contact_messages` table and confirms **storage**, not email delivery. It uses origin checks, strict field validation (including a free-text subject of 1–160 characters), bounded request bodies, a honeypot, timing checks, atomic rate counters and idempotency keys. There is no public endpoint to list messages.

Inspect production enquiries through an authenticated operator session against
the selected database. To inspect a local SQLite database without modifying it:

```sh
node --input-type=module <<'JS'
import { DatabaseSync } from 'node:sqlite';
const db = new DatabaseSync('.data/contact.sqlite', { readOnly: true });
try {
  console.table(db.prepare('SELECT id, name, email, service, created_at, notification_status FROM contact_messages ORDER BY created_at DESC').all());
} finally {
  db.close();
}
JS
```

Optional notifications use `RESEND_API_KEY` and `CONTACT_SENDER`, or Microsoft
Graph's `MS_TENANT_ID`, `MS_CLIENT_ID`, `MS_CLIENT_SECRET` and `CONTACT_SENDER`.
Resend takes precedence when configured. Keep credentials server-side in `.env`
locally or Vault/Kubernetes Secrets in production; see
[contact email credentials](docs/deployment.md#contact-email-credentials).

## Validation

```sh
npm run check
npm run lint
npm test
npm run build
python3 scripts/check-built-security.py
python3 scripts/check-built-seo.py
bash infra/scripts/test-delivery.sh
python3 infra/scripts/test-onboarding.py
bash infra/scripts/test-postgres.sh
```

Contact and runtime tests use real temporary SQLite databases and the same SQL
migrations as production. They cover validation, persistence, idempotency,
quotas, rollbacks, notification contracts, proxy trust, redirects and security
headers. Provider requests are mocked. Development middleware tests check the
local contact endpoint and storage across server restarts. The PostgreSQL test
helper requires Docker and creates an isolated localhost-only database; it
never uses the application's `DATABASE_URL` or the live cluster.

## Cookies and privacy

The application has no advertising or analytics trackers, browser cookies, localStorage, sessionStorage or IndexedDB usage. Fonts, images, CSS and scripts are served from the site. Contact requests go to the same-origin `/api/contact` endpoint. Submission timing and retry identifiers stay in React memory; enquiry records and temporary anti-abuse hashes are stored server-side in SQLite, or PostgreSQL when that profile is selected. Intranet is a regular external link, and email notifications are server-side.

No cookie banner is installed because the current application has no consent-requiring tracker. This follows the [CNIL distinction between necessary functions and trackers requiring consent](https://www.cnil.fr/fr/cookies-et-autres-traceurs/que-dit-la-loi). Reassess this decision before adding analytics, advertising, embedded media or third-party widgets. The separate Intranet has its own privacy scope.

The bilingual privacy notice explains this behavior and is linked beside the form’s consent checkbox. Visitor rate-limit hashes expire after windows of up to one hour; expired rows are deleted on the next valid new submission, rather than by a scheduled task. Global daily counters contain no visitor identifier. Contact messages are not automatically purged: a retention period and deletion procedure still need to be defined for operational use. The cookie review is not a full GDPR compliance assessment.
