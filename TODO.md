# TODO

Open website work, added 2026-09-27. Worked through with the coding loop in
[`chefzaid/agents`](https://github.com/chefzaid/agents) (`CODING_AGENT.md`).

## Bugs to fix

- [x] `npm audit --audit-level=high` in the CI `verify` job failed on `vite` 8.2.2 (high) and `astro` 7.3.1 (moderate XSS and CSS injection): upgraded to `vite` 8.3.5 and `astro` 7.4.1. `satori` still pins `fflate` 0.7.3 (moderate, ZIP64 parsing), reached only at build time on our own fonts, with no upstream fix yet. *(2026-10-23)*
- [x] `components/SiteFooter.tsx` hardcoded "© 2013–2026"; the end year now comes from the build date. *(2026-10-23)*
- [x] `components/SiteFooter.tsx` and `components/ContactForm.tsx` hardcoded the privacy paths; both now use `privacyPath()`, passed to the contact form island as a prop so it does not bundle the site data. *(2026-10-23)*
- [ ] `src/layouts/NotFound.astro` has no "Skip to content" link, unlike every other page (`src/layouts/Subpage.astro`). *(found by: Coding Agent)*

## Needs Input

Parts of tasks that cannot advance without the owner's decision or information. Answer under the item, and the next agent run applies the answer and removes the entry.

- [ ] Company identity for the footer, contact section and legal notice: headquarters address, SIRET, legal form, share capital and RCS registry city, the OnOff business number (international format), and the publication director (Zaïd Chefchaouni as CEO?). *(task: Company details; asked by: Coding Agent)*
  - Answer:
- [ ] Host to name in the legal notice (French law asks for its name, address and phone): the provider and data-centre country of the bare-metal servers running `swirlit.dev`, and whether to also name Cloudflare as the CDN. *(task: Company details › legal notice; asked by: Coding Agent)*
  - Answer:
- [ ] How long to keep contact inquiries and chat leads on the website side once they are in Odoo? Options: delete from the website database as soon as Odoo accepts the lead (Odoo stays the record); keep 3 years after the last contact, the CNIL's guideline for prospects; or another period. *(task: Quality and maintenance › contact data retention; asked by: Coding Agent)*
  - Answer:
- [ ] Legal basis to state on the privacy page for answering inquiries and chats: pre-contractual steps at the visitor's request (GDPR art. 6(1)(b)), legitimate interest (art. 6(1)(f)), or consent (the form's checkbox, which then must be withdrawable)? *(task: Company details › GDPR Article 13 privacy notice; asked by: Coding Agent)*
  - Answer:
- [ ] Which domain serves the Swirl Cloud product pages: keep them under `swirlit.dev`, or move them to one of `swirl.cloud`, `swirlcloud.io`, `swirl-cloud.com` once acquired? *(task: Domains; asked by: Coding Agent)*
  - Answer:
- [ ] Licensing decision for the editions and pricing page and the cost calculator: edition names, what each includes, prices or "on quote", support hours and SLA targets. *(task: Swirl Cloud product pages › editions and pricing, cost calculator; asked by: Coding Agent)*
  - Answer:
- [ ] Material from the platform for the product pages: a sample evidence pack exported from a reference installation (no production data), screenshots or short videos of the setup hub, portal, deployment and compliance views for the guided tour, and the URL of the published product documentation and release notes for the releases page. *(task: Swirl Cloud product pages › sample evidence pack, guided tour, releases page; asked by: Coding Agent)*
  - Answer:
- [ ] Texts and links for the trust center and the offer's legal pages: the data processing agreement template, terms of service, SLA and acceptable use texts (reviewed by counsel?), and the status page URL. Build the trust center now from what is already published (data location, subprocessors, certification status, security contact) or wait for these? *(task: Swirl Cloud product pages › trust center, legal pages for the offer; asked by: Coding Agent)*
  - Answer:
- [ ] Search engine access: verify `swirlit.dev` in Google Search Console and Bing Webmaster Tools by DNS (`docs/dns.md`), or give the HTML verification tokens to add as meta tags; the Rich Results Test and LinkedIn Post Inspector are manual checks on your accounts. For keyword research, which data source (Semrush, Ahrefs, Google Keyword Planner) can the agent use? *(task: SEO follow-up; asked by: Coding Agent)*
  - Answer:
- [ ] Measured outcomes for each case study (figures, constraints, team size, duration, technology) that clients allow to be published. *(task: SEO follow-up › expand case studies; asked by: Coding Agent)*
  - Answer:

## Quality and maintenance (added 2026-10-23)

- [x] Align `@types/node` with the Node 24 runtime declared in `engines` and the Docker/CI images (22.19 to 24.19). *(2026-10-23)*
- [x] End-to-end tests (Playwright, `e2e/`) on the built site for the critical paths: project inquiry and Swirl Cloud demo submissions (demo preselected from the product page), language switch, theme kept across pages, and the chat contacting Odoo only once opened; the CI `e2e` job gates the image build. *(2026-10-23)*
- [x] Automated accessibility scan (axe, WCAG 2.2 AA) of each page template in both light and dark themes inside the end-to-end suite. Fixed what it reported: the light theme's accent green and three muted greys lacked 4.5:1 contrast, and the FR/EN links' accessible names did not contain their visible text. *(2026-10-23)*
- [ ] Contact data retention: delete stored inquiries, their CRM queue rows and expired rate-limit records after a fixed period once the lead is in Odoo, and state the period on the privacy page (FR and EN).

## Content and discovery (added 2026-10-23)

The guides are what a NIS2 or DORA buyer finds first, and the product pages are
what convinces them; link the two and keep adding guides on the questions
Swirl Cloud answers, with sources and dates as for the existing ones.

- [ ] Related guides: each Swirl Cloud page and each article links to the guides on its subject (security → NIS2, DORA; sovereignty and comparison → leaving a hyperscaler; …), from one mapping in `data/site.ts`.
- [ ] Sitemap `lastmod` for the resource articles, from their `updated` date.
- [ ] Print styles for articles, so a checklist prints or saves as PDF without the header, chat and footer, with link targets shown.
- [ ] Phone-width end-to-end checks: the header menu opens and navigates, and the axe scan passes on the home and an inner page.
- [ ] Guide (FR and EN): answering a customer security questionnaire — what NIS2 and DORA customers ask their suppliers, the common questionnaire formats, and the evidence to keep ready.
- [ ] Guide (FR and EN): the US CLOUD Act and data hosted in Europe — what the law allows, the EU–US Data Privacy Framework, SecNumCloud's protection against non-EU laws, and what it means when choosing a host.

## Company details

- [ ] Show the headquarters address in the footer and contact page (FR and EN).
- [ ] Show the SIRET number.
- [ ] Show the business phone number (OnOff virtual number) with a `tel:` link.
- [ ] Complete the privacy notice to GDPR Article 13 (FR and EN): controller identity (from the details above), legal basis, retention period and the right to lodge a complaint with the CNIL. The CNIL complaint right is published *(2026-10-23)*; the rest waits in **Needs Input**.
- [ ] Add a legal notice page (mentions légales) with company name, SIRET, headquarters address, phone, publication director and host, linked from the footer; no such page exists today.

## Odoo integration through its API

- [x] Create an Odoo CRM lead for every accepted contact-form submission through the platform's intake API, with the integration key from Vault `secret/apps/swirl-website/odoo` and the in-cluster Odoo address. *(2026-10-07)*
- [x] Keep the stored inquiry as the source of truth: `contact_crm_queue` retries with backoff until Odoo accepts, records the lead ID, and queues inquiries stored before the integration. *(2026-10-07)*
- [x] Tests for lead creation, Odoo unavailability, rejected keys, concurrent claims and the backfill migration. *(2026-10-07)*

## Support / Chat with us widget

- [x] "Chat with us" button on the home pages opening Odoo Live Chat in a frame served by `odoo.swirlit.dev`; project pages stay free of client JavaScript. *(2026-10-07)*
- [x] Content Security Policy: only `frame-src https://odoo.swirlit.dev` is added; the widget runs under Odoo's origin. *(2026-10-07)*
- [x] Nothing loads or is stored until the visitor selects the button. *(2026-10-07)*
- [x] Privacy page (FR and EN): Odoo CRM leads, chat transcripts and the chat's cookies and storage. *(2026-10-07)*
- [x] Chloé, the chat persona (`infra/odoo/chat-persona.json`, avatar and FR/EN texts), and answering chats by email, explained on the privacy page. *(2026-10-07)*
- [x] Chat on every page; Chloé shown online (green dot) on the button and in the chat; a chat window opens at once on click while Odoo's chat starts; her closing message promises a quick answer without naming email. *(2026-10-09)*

## Swirl Cloud product pages (added 2026-10-04)

Present Swirl Cloud as a product, not only as the "Cloud & AI" service card: a
sovereign company cloud on bare metal for European SMEs and regulated mid-market
companies, which they own like on-premises, run like SaaS and can leave at any
time. Publish a claim only once the platform demonstrates it (measured install
time, sovereignty mode, compliance evidence); mark the rest as roadmap.

- [x] Product landing page (FR and EN) at `/swirl-cloud/` and `/en/swirl-cloud/`: value proposition, target customers (20–500 employees, NIS2, DORA ICT suppliers, customer security questionnaires), what one installation includes by layer, how it is delivered (installed on the customer's servers, run by their team, or operated by Swirl on servers hosted in the EU), roadmap, FAQ and a demo call to action, linked from every header and the "Cloud & AI" card. *(2026-10-09)*
- [x] "How it works" page (`/swirl-cloud/fonctionnement/`, `/en/swirl-cloud/how-it-works/`): install on rented or owned servers, architecture diagram, environments and delivery flow, high availability and recovery, with measured figures only (October 2026; recovery time is left out until measured). *(2026-10-09)*
- [x] Sovereignty page (`/swirl-cloud/souverainete/`, `/en/swirl-cloud/sovereignty/`): hosting and jurisdiction chosen by the customer, every external service with its provider and what it receives, telemetry switched off, standard formats for leaving, and the strict sovereignty mode and exit runbook as roadmap. *(2026-10-09)*
- [x] Security and compliance page (`/swirl-cloud/securite-conformite/`, `/en/swirl-cloud/security-compliance/`): the 27 catalog controls by theme with their NIS2, ISO/IEC 27001, DORA, GDPR and CIS mappings, how the evidence is produced, the audit reports, the vulnerability disclosure policy (contact@swirlit.dev) and penetration-test status. *(2026-10-09)*
- [ ] Publish a sample evidence pack generated on a reference installation (no production data) on the security page.
- [ ] Editions and pricing page matching the licensing decision (self-hosted community, managed, enterprise/LTS): what each includes, support hours and the SLA.
- [ ] Cost calculator (React island): server count and size, users and applications in; fixed monthly cost and an equivalent hyperscaler estimate out, with every assumption and price source shown and dated.
- [x] Comparison page (`/swirl-cloud/comparatif/`, `/en/swirl-cloud/comparison/`) against a hyperscaler, a do-it-yourself Kubernetes distribution and a stack of separate SaaS subscriptions on seven factual criteria, with when to choose each. *(2026-10-09)*
- [ ] Case study of the company's own installation: what runs on it, deployment frequency, recovery drills and availability, from real measurements. **Blocked:** needs a full month of availability measurements (recorded since 2026-10-05) and a measured restore drill.
- [x] Demo request path: a "Swirl Cloud demo" choice in the contact form (preselected from the product page's demo links), naming the company instead of a subject, stored like other inquiries and sent to the CRM as a lead named after the company with the company as partner. *(2026-10-09)*
- [ ] Guided product tour (screenshots or short videos of the setup hub, portal, deployment and compliance views) without requiring a live account.
- [ ] Trust center page: data location, subprocessors, data processing agreement template, certification status, status page link and security contact.
- [x] Serve `/.well-known/security.txt` with the security contact (contact@swirlit.dev), policy links to the disclosure section and a 180-day expiry renewed by each build, and keep it in the built-security check. *(2026-10-09)*
- [ ] Legal pages for the offer: terms of service, SLA, data processing agreement and acceptable use (FR and EN), linked from the footer.
- [ ] Releases page listing platform versions, release channels and changelog highlights, linked to the published product documentation.
- Resource articles (FR and EN) under `/ressources/` and `/en/resources/`, each with its sources, last-checked date and the demo call to action:
  - [x] NIS2 readiness checklist, with the French transposition status as of 2026-10-09. *(2026-10-09)*
  - [x] DORA obligations for ICT suppliers: register, contract clauses, incident support, subcontracting, audits, exit and critical providers. *(2026-10-09)*
  - [x] Leaving a hyperscaler: Data Act switching rights, inventory, portable equivalents, sizing, data move, cutover and records. *(2026-10-09)*
  - [x] French electronic invoicing: the 2026–2027 calendar, approved platforms, formats, the four new mentions, e-reporting and sanctions. *(2026-10-09)*
- [x] Structured data (`SoftwareApplication` and `FAQPage` on the product page, `FAQPage` on the security and sovereignty pages, `Article` on guides, `CollectionPage` hubs), sitemap entries, hreflang pairs and Open Graph images for every new page, all covered by `check-built-seo.py`. *(2026-10-09)*
- [ ] Customer links in the header once they exist: status page, support and fleet console sign-in.

## Domains

- [x] `swirlit.dev`
- [ ] `swirl.cloud`
- [ ] `swirlcloud.io`
- [ ] `swirl-cloud.com`
- [ ] Choose which domain serves the product pages (a section of `swirlit.dev` or a product domain above), then set canonical URLs and redirects so both never compete in search.

## SEO follow-up (added 2026-10-07)

Review after the service pages, case-study hub, social cards and HTML
compression: technical SEO A−, on-page B, content C, authority D,
measurement D (C+ overall). The site is technically sound but thin and
unmeasured; competitive terms need the items below, plus the legal notice
(Company details) and the resource articles (Swirl Cloud product pages).

- [ ] Verify `swirlit.dev` in Google Search Console and Bing Webmaster Tools, submit `/sitemap.xml` and record a baseline (indexed pages, queries, impressions).
- [x] Confirm documents reach visitors with `Content-Encoding` through Cloudflare (2026-10-08: Brotli for Brotli clients, also from the edge cache, and plain HTML for the others)
- [ ] Run Google's Rich Results Test on a service, hub and case-study page, and check a shared link in LinkedIn Post Inspector.
- [ ] Keyword research with real volume and difficulty data (FR and EN); adjust service titles, H1s and slugs only where the data supports it.
- [ ] Expand each case study to 600–1,000 words with measured outcomes, constraints and technology, and a subtitle or H2 carrying its search terms; verifiable facts only.
- [ ] Add the company LinkedIn page and directory profiles (Clutch, Malt, Sortlist) to the `Organization` `sameAs` once they exist.
- [ ] Create a Google Business Profile once the headquarters address is published.
- [x] Trim the chat launcher bundle on the home pages: the Odoo origin, chat channel and contact link now come as props, so the island no longer bundles the site data (22 KB to 2.3 KB, 7.7 KB to 1.3 KB gzipped). *(2026-10-09)*
