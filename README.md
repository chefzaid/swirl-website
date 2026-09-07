# Swirl IT portfolio

An Astro + React company website based on the supplied Swirl IT archive. Source lives in this `website` directory. French is the default language; `/en/` serves English. Each of the 10 projects also has a static page under `/projets/` and `/en/projects/`. The hero uses a simple bilingual software-lifecycle diagram, while the company section retains the original portrait with the centred “Zaïd Chefchaouni · CEO” signature and quotation. The supplied paper-plane logo is retained. A refreshed social card reflects the Web, IoT, cloud and AI expertise. Professional reference contact details from the CV are deliberately excluded.

## Local development

Requires Node 24.15+ and npm.

Production on the bare-metal K3s cluster uses Node 24 and serves
`https://swirlit.dev`. Its delivery and persistent contact database are described
in [K3s deployment](docs/deployment.md). GitHub `chefzaid/website` and GitLab
`swirlit/website` remain private; the public website is a separate deployment.

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

`npm run build` generates Astro pages, then bundles the HTML in `dist/server/index.js`; CSS, scripts, fonts, images, robots.txt and the sitemap remain in `dist/client`. Sites metadata and D1 migrations are packaged in `dist/.openai`. The Worker serves static assets and handles contact submissions. The root Wrangler config uses a placeholder database ID for local development; Sites provisions and binds the hosted D1 database.

## Content and presentation

- `data/portfolio.ts`: bilingual services and all 11 client projects.
- `components/Portfolio.tsx`: static company presentation, rendered on the server.
- The hero introduction mentions custom software development at a fixed price; [SEO research](docs/forfait-positioning.md) records the wording, keyword targets and sources.
- `src/layouts/Home.astro`: combines the static presentation with independent interactive components.
- `components/SiteHeader.tsx`: mobile menu, hydrated only below 1100px.
- `components/ProjectGallery.tsx`: project filters and dialogs, hydrated near the viewport; `data/project-view.ts` supplies only the active language.
- `components/ClientLogo.tsx`: shared client wordmarks in the reference rows and projects; [asset sources and theme treatment](docs/assets/client-logos.md).
- `components/SoftwareLifecycle.tsx`: accessible four-step diagram, with modular building blocks and translated labels.
- `components/ContactForm.tsx`: accessible form and submission feedback, hydrated near the viewport.
- `app/globals.css`: shared theme and responsive styles.
- `src/layouts/Layout.astro`: SEO, language and social metadata.
- `server/contact.ts`: validation, persistence, rate limits and optional Resend or Exchange notifications.

The archive's `prompt.txt` was treated as design context, not as authorization for unrelated features. The Intranet is an external link; this site does not implement an employee portal or LDAP login. No invented staff or third-party CV reference details are published. Client names represent assignments described in the CV, including work through consulting partners.

## Contact enquiries

The form works without an email provider. It stores enquiries in the private `contact_messages` table and confirms **storage**, not email delivery. It uses origin checks, strict field validation (including a free-text subject of 1–160 characters), bounded request bodies, a honeypot, timing checks, atomic rate counters and idempotency keys. There is no public endpoint to list messages.

For hosted enquiries, use the Site's owner database tools to read `contact_messages`. For local enquiries:

```sh
npx wrangler d1 execute swirl-it-contact --local --command "SELECT id, name, email, service, message, created_at, notification_status FROM contact_messages ORDER BY created_at DESC"
```

## Email notifications with Resend

Resend can send from `noreply@swirlit.dev` without a Microsoft 365 mailbox.
Verify `swirlit.dev` for **sending only**, then create a Sending access API key
restricted to that domain. Keep Cloudflare Email Routing enabled: retain its
apex MX records, leave Resend's Receiving option off, and add only the sending
records Resend provides (normally MX and SPF at `send.swirlit.dev`, plus DKIM
at `resend._domainkey.swirlit.dev`). Do not replace the apex MX/SPF records or
add a second SPF record at an existing hostname. See
[Resend's Cloudflare guide](https://resend.com/docs/knowledge-base/cloudflare).

Configure these values server-side (an ignored `.dev.vars` file for local
Wrangler development, or the Vault-backed Secret described in
[K3s deployment](docs/deployment.md#contact-email-credentials) for production):

```dotenv
RESEND_API_KEY=your-sending-api-key
CONTACT_SENDER=noreply@swirlit.dev
```

The sender setting is a plain email address; the adapter adds the Swirl IT
display name. Notifications go only to `contact@swirlit.dev`, which can continue
forwarding to your existing inbox. The visitor is Reply-To. No acknowledgement
is sent to the visitor. The website calls Resend over HTTPS; no new runtime
dependency or SMTP connection is required.

Enquiries are saved before sending. The existing `notification_status = sent`
means the provider accepted the request, not that the recipient inbox confirmed
delivery. Provider failures and timeouts leave the enquiry saved as `failed`.
Resend receives an idempotency key derived from the enquiry ID, and repeated
form submissions do not send another notification. Saved and failed enquiries
are not automatically replayed when email is enabled. Use the provider's logs
to investigate delivery after acceptance.

When `RESEND_API_KEY` is present, Resend is selected even if Microsoft credentials
also exist. A Resend failure never falls back to Microsoft, avoiding duplicate
delivery after an ambiguous timeout. Without a Resend key, the existing Microsoft
adapter remains available; without either provider's settings, storage continues
with `notification_status = unconfigured`. Never expose API keys in browser
code, logs, or Git.

## Microsoft Exchange alternative

Notifications are prepared for **Microsoft Exchange Online / Microsoft 365** using Microsoft Graph. An on-premises Exchange server would need a different adapter.

When the mailbox exists, register a Microsoft Entra application and configure mailbox-scoped authorization to send from your chosen sender. Set these runtime values through Sites, or in an ignored `.dev.vars` file for local development:

```dotenv
MS_TENANT_ID=your-tenant-id
MS_CLIENT_ID=your-application-id
MS_CLIENT_SECRET=your-secret
CONTACT_SENDER=contact@swirlit.dev
```

`.env.example` lists the same keys. Keep credentials server-side. The destination is fixed to `contact@swirlit.dev`; the visitor's address is used only as Reply-To. Scope the application's sending access to the intended mailbox. See [Microsoft Graph sendMail](https://learn.microsoft.com/en-us/graph/api/user-sendmail?view=graph-rest-1.0) and [Exchange application RBAC](https://learn.microsoft.com/en-us/exchange/permissions-exo/application-rbac).

When configured without a Resend key, new submissions are saved first and then passed to Exchange. If notification fails, the enquiry remains saved with `notification_status = failed`. Old enquiries and failed notifications are not automatically replayed when Exchange is later enabled. No live email has been sent or tested during initial setup.

## Validation

Tests use a real in-memory SQLite database with the generated migrations. They cover input validation, durable inserts, retries, rate limits, cross-origin requests, oversized bodies, storage failures, and the Resend and Exchange request contracts with mocked HTTP. Resend tests also check provider selection, invalid responses, preservation after sending failures, and duplicate submissions. No real email or third-party request is made by these tests.

## Hero diagram and social preview

The hero is a lightweight semantic HTML/CSS diagram with Lucide icons: define the idea, assemble the building blocks, verify, and launch. Labels are translated for French and English, and remain readable on mobile. The diagram replaces the former decorative 3D image. The About portrait remains beneath the company content.

The social card (`public/og.png`) was refreshed with the built-in ImageGen tool. Its exact prompt is saved in `docs/assets/company-social-card-prompt.txt`.

The contact API now accepts `subject` as free text, and still accepts the former `service` field from already-open forms. The existing database column `service` stores the subject, so no migration or change to previously saved enquiries is needed.

## Cookies and privacy

The application has no advertising or analytics trackers, browser cookies, localStorage, sessionStorage or IndexedDB usage. Fonts, images, CSS and scripts are served from the site. Contact requests go to the same-origin `/api/contact` endpoint. Submission timing and retry identifiers stay in React memory; enquiry records and temporary anti-abuse hashes are stored server-side in SQLite on K3s, or D1 on Sites. Intranet is a regular external link, and email notifications are server-side.

No cookie banner is installed because the current application has no consent-requiring tracker. This follows the [CNIL distinction between necessary functions and trackers requiring consent](https://www.cnil.fr/fr/cookies-et-autres-traceurs/que-dit-la-loi). Reassess this decision before adding analytics, advertising, embedded media or third-party widgets. The hosting platform’s private sign-in and the separate Intranet have their own privacy scope.

The bilingual privacy notice explains this behavior and is linked beside the form’s consent checkbox. Visitor rate-limit hashes expire after windows of up to one hour; expired rows are deleted on the next valid new submission, rather than by a scheduled task. Global daily counters contain no visitor identifier. Contact messages are not automatically purged: a retention period and deletion procedure still need to be defined for operational use. The cookie review is not a full GDPR compliance assessment.

## Security

See [the security review](docs/security-review.md) for findings, protections, evidence and remaining hosting responsibilities.

The contact endpoint accepts at most 18,000 bytes and enforces a 5-second body-read deadline. Persistent quotas allow 30 parsed, valid requests per minute per IP/network (including retries), 120 globally per minute, 5 new submissions per hour per IP/network and email, 30 globally per hour and 100 globally per day. Windows start when first used, so crossing a clock-hour boundary does not reset them. IPv6 addresses share a /64 quota; forwarded client-supplied IP headers are ignored. Quota updates and message insertion use one D1 transaction. Concurrent retries consume one new-message allowance. Higher request ceilings still apply. A rejected submission consumes no new-message quota. Responses include `Retry-After`; the form also offers direct email.

A bounded per-Worker rejection cache avoids repeated database work for already-blocked sources where possible; persistent D1 counters remain authoritative. These controls bound stored messages and email notifications, not all distributed network traffic or provider charges. Origin and browser-timing checks are additional friction, not proof of a human.

Astro generates a hash-based Content Security Policy for all pages, without `unsafe-inline` or `unsafe-eval` scripts. The final build embeds all HTML documents in the Worker and removes their public static copies, because Sites currently ignores static `_headers` rules. This enforces the security headers on documents and API responses. CSS, images and fonts remain CDN assets; `_headers` is also generated for hosts that support it. The build fails if the route map and generated pages differ. `dist/server/page-manifest.json` is private build evidence for CSP checks.

Run `npm run check`, `npm test`, `npm run build`, `python3 scripts/check-built-security.py`, and `npm audit`. Drizzle’s transitive esbuild dependency is overridden to 0.25.12 to address GHSA-67mh-4wv8-2f99; keep this override until its parent dependency updates.

## Search and project pages

See [SEO implementation and public-launch steps](docs/seo.md). All project links are present in server-rendered HTML; the additional cards use native `details`. Project URLs, canonical origins and language pairs share `data/site.ts`. Update its `linkedin` value to switch the footer social destination later. The footer groups LinkedIn with the Swirl IT logo and centres copyright independently of the side links.

Run `python3 scripts/check-built-seo.py` after a build to validate all 24 documents. Public indexing requires a public publication and verified domain; the current owner-private preview remains private.

## Technical footprint

The homepage no longer hydrates its static presentation. The mobile header uses `client:media`; the project gallery and form use `client:visible` with a 300px margin. The same server-rendered content and links are available immediately. Base UI still manages dialog focus and keyboard behavior.

The cleanup removed the unused select wrapper, unused dialog helpers and button variants, `class-variance-authority`, obsolete Next.js configuration and overridden CSS. The current lint configuration checks Astro/React, including types, and passes without disabling accessibility rules globally.

During the hydration refactor, total emitted JavaScript decreased from 330,890 to 300,072 bytes (106,128 to 98,231 gzip), and CSS from 51,032 to 46,271 bytes (11,082 to 10,308 gzip). These are build-asset measurements, not a field performance score; conditional hydration changes when those scripts are downloaded and executed. At the time of that refactor, a comparison of all 26 generated pages confirmed identical text, links, images and form constraints.
