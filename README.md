# Swirl IT portfolio

Swirl IT portfolio website is built with [Astro](https://astro.build) 7, [React](https://react.dev) 18, [Drizzle ORM](https://orm.drizzle.team) 3, and [Cloudflare Workers](https://workers.cloudflare.com). It uses a bilingual content model, server-rendered static pages, and a single-page React application for the project gallery and contact form. The contact form persists enquiries in a private D1 database and sends email notifications.

## Local development

Requires Node 24.15+ and npm.

Production on the bare-metal K3s cluster uses Node 24 and serves
`https://swirlit.dev`. Its delivery and persistent contact database are described
in [K3s deployment](docs/deployment.md).

```sh
npm install
npm run dev
```

Astro prints the local preview URL (normally `http://127.0.0.1:4321`). The development middleware provides the same `/api/contact` handler as production, using a local D1 database. Migrations are applied automatically for local development. Local data is stored in `.wrangler/state/v3` and is never committed. Astro 7 manages its development process; stop it with `npx astro dev stop`.

```sh
npm run check
npm run lint
npm test
npm run build
npm start
```

`npm run build` generates Astro pages, then bundles the HTML in `dist/server/index.js`; CSS, scripts, fonts, images, robots.txt and the sitemap remain in `dist/client`. The Worker serves static assets and handles contact submissions. The root Wrangler config uses a placeholder database ID for local development; Sites provisions and binds the hosted D1 database.

## Content and presentation

- `data/portfolio.ts`: bilingual services and all 11 client projects.
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

## Contact enquiries

The form stores enquiries in the private `contact_messages` table and confirms **storage**, not email delivery. It uses origin checks, strict field validation (including a free-text subject of 1–160 characters), bounded request bodies, a honeypot, timing checks, atomic rate counters and idempotency keys. There is no public endpoint to list messages.

For hosted enquiries, use the Site's owner database tools to read `contact_messages`. For local enquiries:

```sh
npx wrangler d1 execute swirl-it-contact --local --command "SELECT id, name, email, service, message, created_at, notification_status FROM contact_messages ORDER BY created_at DESC"
```

## Validation

Tests use a real in-memory SQLite database with the generated migrations. They cover input validation, durable inserts, retries, rate limits, cross-origin requests, oversized bodies, storage failures, and the Resend and Exchange request contracts with mocked HTTP. Resend tests also check provider selection, invalid responses, preservation after sending failures, and duplicate submissions. No real email or third-party request is made by these tests.

## Cookies and privacy

The application has no advertising or analytics trackers, browser cookies, localStorage, sessionStorage or IndexedDB usage. Fonts, images, CSS and scripts are served from the site. Contact requests go to the same-origin `/api/contact` endpoint. Submission timing and retry identifiers stay in React memory; enquiry records and temporary anti-abuse hashes are stored server-side in SQLite on K3s, or D1 on Sites. Intranet is a regular external link, and email notifications are server-side.

No cookie banner is installed because the current application has no consent-requiring tracker. This follows the [CNIL distinction between necessary functions and trackers requiring consent](https://www.cnil.fr/fr/cookies-et-autres-traceurs/que-dit-la-loi). Reassess this decision before adding analytics, advertising, embedded media or third-party widgets. The separate Intranet have their own privacy scope.

The bilingual privacy notice explains this behavior and is linked beside the form’s consent checkbox. Visitor rate-limit hashes expire after windows of up to one hour; expired rows are deleted on the next valid new submission, rather than by a scheduled task. Global daily counters contain no visitor identifier. Contact messages are not automatically purged: a retention period and deletion procedure still need to be defined for operational use. The cookie review is not a full GDPR compliance assessment.
