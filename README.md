# Swirl portfolio

Swirl's bilingual company website uses Astro 7 and React 19, served by a
Node 24 application on the bare-metal Kubernetes cluster at `https://swirlit.dev`.
Pages are rendered at build time; the header, project gallery and contact form
hydrate independently. Contact inquiries are stored privately on the server.

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
`dist/runtime`; CSS, scripts, fonts, images, social cards, robots.txt,
llms.txt, the sitemap and `.well-known/security.txt` remain in `dist/client`.
The Node server applies security headers to every response and compresses
HTML documents. `security.txt` (RFC 9116) names the security contact and links
the disclosure policy on the Swirl Cloud security page; each build renews its
180-day expiry, so release at least every few months.

See [Kubernetes deployment](docs/deployment.md) for delivery, persistent storage and the
[Cloudflare edge cache](docs/deployment.md#cloudflare-edge-cache),
and [repository onboarding](docs/onboarding.md) for a new cluster or import.

## Light and dark themes

The site is dark by default. The header's theme button (`components/SiteHeader.tsx`)
switches to the light theme; a script at the start of `<body>`
(`src/layouts/Layout.astro`) applies the saved choice before the page paints and
is allowed by its hash in the Content Security Policy. Colours are
`light-dark(<light>, <dark>)` pairs in `app/*.css`, resolved by the page's
`color-scheme`; give every new colour both values.

## Contact storage

The default deployment (`infra/k8s`) runs one replica with **SQLite**, using
Node's built-in `node:sqlite` module and `/data/contact.sqlite` on the
`swirl-website-data` persistent volume. `DATABASE_URL` is unset in this profile.
PostgreSQL support exists but is **opt-in**: setting `DATABASE_URL` selects it
only after the database/schema and any existing data have been prepared.
Follow [the PostgreSQL cutover guide](docs/high-availability.md) before selecting
`infra/overlays/ha`. Enabling the platform's PostgreSQL service alone does not
switch Swirl Website's contact storage.

SQLite migrations are plain SQL under `db/migrations`, applied transactionally
at startup and recorded with checksums. Preserve applied filenames and contents;
add a new numbered SQL file for a change. PostgreSQL's versioned schema and
migration/import commands are in `runtime/postgres.ts` and
`runtime/migrate-postgres.ts`.

## Source map

| Area | Files |
| --- | --- |
| Resource articles (Markdown) | `src/content/articles/`, `src/content.config.ts` |
| French and US English content | `data/portfolio.ts`, `data/expertise.ts`, `data/product.ts`, `data/how-it-works.ts`, `data/security.ts`, `data/compliance-controls.ts`, `data/sovereignty.ts`, `data/comparison.ts`, `data/site.ts` |
| Pages and metadata | `src/layouts/` |
| Social cards and icons | `lib/social-image.tsx`, `src/pages/og/` |
| UI and shared project content | `components/`, `data/project-view.ts` |
| Styles and assets | `app/globals.css`, `public/assets/` |
| Contact API and notifications | `server/contact.ts`, `runtime/contact.ts` |
| Odoo CRM delivery and Live Chat | `server/odoo.ts`, `runtime/crm.ts`, `components/ChatLauncher.tsx` |
| Request handling | `server/handler.ts`, `runtime/server.ts` |
| Deployment | `infra/` |

See [SEO maintenance](docs/seo.md) for route and metadata changes, and
[client asset sources](docs/client-logos.md) when updating logos.

## Contact inquiries

The form stores inquiries in the private `contact_messages` table and confirms **storage**, not email delivery. Visitors choose a project inquiry or a **Swirl Cloud demo** request (`topic`); a demo request names the company instead of a subject, and the Swirl Cloud page's demo links open the form with `?topic=demo`. It uses origin checks, strict field validation (including a free-text subject of 1–160 characters), bounded request bodies, a honeypot, timing checks, atomic rate counters and idempotency keys. There is no public endpoint to list messages.

Inspect production inquiries through an authenticated operator session against
the selected database. To inspect a local SQLite database without modifying it:

```sh
node --input-type=module <<'JS'
import { DatabaseSync } from 'node:sqlite';
const db = new DatabaseSync('.data/contact.sqlite', { readOnly: true });
try {
  console.table(db.prepare('SELECT id, topic, company, name, email, service, created_at, notification_status FROM contact_messages ORDER BY created_at DESC').all());
} finally {
  db.close();
}
JS
```

Every stored inquiry is also queued for Odoo CRM (`contact_crm_queue`) and
sent as a lead through the platform's intake API with the `ODOO_*` settings.
Delivery runs after the response and retries with backoff until Odoo accepts it,
so an Odoo outage delays leads without losing them; retries reuse the inquiry
ID and never create a second lead. Every page also offers a **Chat with us**
button that opens Odoo Live Chat in a frame; see
[Odoo CRM and Live Chat](docs/deployment.md#odoo-crm-and-live-chat).

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
npm run test:e2e
python3 scripts/check-built-security.py
python3 scripts/check-built-seo.py
bash infra/scripts/test-delivery.sh
python3 infra/scripts/test-onboarding.py
bash infra/scripts/test-postgres.sh
```

Tests use temporary databases and mocked email providers. `npm run test:e2e`
runs the Playwright suite (`e2e/`) in Chromium against the production build,
served on port 4173 with a temporary SQLite directory and no Odoo or email
delivery; requests to Odoo are blocked. Install its browser once with
`npx playwright install chromium`, or point `CHROMIUM_PATH` at an existing
Chromium. CI runs it in the matching Playwright image after `verify`, and the
image build waits for it. The PostgreSQL helper
requires Docker and creates an isolated local database.

## Privacy maintenance

The site uses no analytics or advertising trackers. Browser storage holds only
the visitor's light or dark theme choice (`localStorage`) and, once they open the
chat, a marker for the current tab (`sessionStorage`). Review
consent requirements before introducing third-party scripts or embeds, and keep
the bilingual notice in `src/layouts/Privacy.astro` aligned with data handling.
See [CNIL guidance](https://www.cnil.fr/fr/cookies-et-autres-traceurs/que-dit-la-loi).

Expired visitor rate-limit records are deleted on the next valid new submission.
Contact messages have no automatic retention limit; define and operate a deletion
policy for production data.
