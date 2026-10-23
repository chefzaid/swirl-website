# Swirl website

Swirl's bilingual company website (French at `/`, English at `/en/`), live at
`https://swirlit.dev`. Pages are built with Astro 7 and React 19 and served by a
Node 24 application on Swirl's bare-metal Kubernetes cluster. Only the chat
button hydrates on every page; the homepage also hydrates its project gallery,
contact form and, on small screens, its header.

| Guide                                           | When to read it                                          |
| ----------------------------------------------- | -------------------------------------------------------- |
| [Deployment](docs/deployment.md)                | CI/CD, runtime, secrets, edge cache, email, Odoo, logs   |
| [DNS](docs/dns.md)                              | Public DNS records, direct or HA ingress                 |
| [Onboarding](docs/onboarding.md)                | Installing on a new cluster                              |
| [PostgreSQL and HA](docs/high-availability.md)  | Moving from one SQLite replica to PostgreSQL and two     |
| [SEO](docs/seo.md)                              | Adding or renaming pages, metadata and structured data   |
| [Client logos](docs/client-logos.md)            | Replacing a client logo                                  |

## Run it locally

Requires Node 24.15+ and npm.

```sh
npm ci
cp .env.example .env
npm run dev          # http://127.0.0.1:4321, stop with: npx astro dev stop
```

The development contact form uses the same storage, migrations and validation
as production and writes to `.data/contact.sqlite`. Leave the email and Odoo
settings empty to store inquiries without sending anything.

To run the production server instead:

```sh
npm run build
npm start            # http://127.0.0.1:8080, loads .env
```

Open it at exactly `PUBLIC_ORIGIN` from `.env`: the contact form rejects other
origins, `localhost` included.

## Checks

CI runs all of these except the PostgreSQL test; run them before pushing:

```sh
npm run check                          # Astro and TypeScript
npm run lint
npm run format:check
npm test                               # unit tests (CI also measures coverage)
npm run build
npm run test:e2e                       # Playwright and axe, on the build
python3 scripts/check-built-security.py
python3 scripts/check-built-seo.py
bash infra/scripts/test-delivery.sh
python3 infra/scripts/test-onboarding.py
bash infra/scripts/test-postgres.sh    # needs Docker
```

The end-to-end suite serves the build on port 4173 with a temporary database and
blocks requests to Odoo. Install its browser once with
`npx playwright install chromium`, or set `CHROMIUM_PATH` to an existing one.

## Where things are

| Area                         | Files                                                              |
| ---------------------------- | ------------------------------------------------------------------ |
| Text, routes and site data   | `data/` (French and US English side by side; routes in `site.ts`)  |
| Resource guides              | `src/content/articles/<lang>/<id>.md`                              |
| Pages and shared blocks      | `src/layouts/`, `src/components/`, `components/` (React)           |
| Styles                       | `app/globals.css` → `app/styles/`, `app/swirl-cloud.css`, `app/articles.css` |
| Social cards and icons       | `lib/social-image.tsx`, `src/pages/og/`                            |
| Contact form, CRM and email  | `server/`, `runtime/`, `db/migrations/`                            |
| End-to-end tests             | `e2e/`, `playwright.config.ts`                                     |
| Deployment                   | `infra/`, `Dockerfile`, `.gitlab-ci.yml`                           |

## Conventions

- **Colours.** The site is dark by default; the header switches to light. Every
  colour is a `light-dark(<light>, <dark>)` pair with at least 4.5:1 contrast;
  the axe scan checks every page template in both themes.
- **Styles.** `app/globals.css` imports `app/styles/` in cascade order: later
  files override earlier ones, so keep the order. In a layout, import its
  stylesheet before new components, or the stylesheet order on the page changes.
- **Claims.** Publish a fact about Swirl Cloud only once the platform
  demonstrates it; mark the rest as roadmap.

### Adding a guide

1. Write `src/content/articles/fr/<id>.md` and `en/<id>.md`, with sources and
   `updated` set to the day the facts were checked.
2. Register its slugs in `articleSlugs` and its related guides in
   `relatedArticles` (`data/site.ts`), and link it from the pages on its subject.
3. Raise the page count in `scripts/check-built-security.py` and
   `scripts/check-built-seo.py` by two.

## Contact form and data

Visitors send a project inquiry or a Swirl Cloud demo request (links ending in
`?topic=demo#contact` preselect it). The form confirms that the inquiry is
**stored**, not emailed. It checks the origin, validates every field, limits
body size and submission rate, and uses a honeypot, a timing check and
idempotency keys. No endpoint lists messages.

- **Storage:** SQLite on a persistent volume, one replica. PostgreSQL is opt-in
  and needs a data cutover first; see [PostgreSQL and HA](docs/high-availability.md).
  Migrations are numbered SQL files in `db/migrations`: never edit an applied
  one, add a new file.
- **CRM:** every inquiry is queued and sent to Odoo as a lead, retried until
  Odoo accepts it, never twice. The chat button opens Odoo Live Chat.
- **Email:** optional notifications through Resend (or Microsoft Graph).
- **Retention:** inquiries are not deleted automatically yet; the period waits
  on a decision (`TODO.md`).

Inspect a local database without changing it:

```sh
node --input-type=module -e "
import { DatabaseSync } from 'node:sqlite';
const db = new DatabaseSync('.data/contact.sqlite', { readOnly: true });
console.table(db.prepare('SELECT id, topic, company, name, email, created_at, notification_status FROM contact_messages ORDER BY created_at DESC').all());
db.close();"
```

## Privacy

No analytics, advertising trackers or cookies. The browser keeps only the theme
choice (`localStorage`) and, once the chat is opened, a marker for the current
tab (`sessionStorage`). Before adding any third-party script or embed, check the
[CNIL rules](https://www.cnil.fr/fr/cookies-et-autres-traceurs/que-dit-la-loi)
and update the notice in `src/layouts/Privacy.astro` (French and English).
