# TODO

Open website work, added 2026-09-27.

## Company details

- [ ] Show the headquarters address in the footer and contact page (FR and EN).
- [ ] Show the SIRET number.
- [ ] Show the business phone number (OnOff virtual number) with a `tel:` link.
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

## Swirl Cloud product pages (added 2026-10-04)

Present Swirl Cloud as a product, not only as the "Cloud & AI" service card: a
sovereign company cloud on bare metal for European SMEs and regulated mid-market
companies, which they own like on-premises, run like SaaS and can leave at any
time. Publish a claim only once the platform demonstrates it (measured install
time, sovereignty mode, compliance evidence); mark the rest as roadmap.

- [x] Product landing page (FR and EN) at `/swirl-cloud/` and `/en/swirl-cloud/`: value proposition, target customers (20–500 employees, NIS2, DORA ICT suppliers, customer security questionnaires), what one installation includes by layer, how it is delivered (installed and run by the customer today; managed with customer-held keys shown as roadmap), roadmap, FAQ and a demo call to action, linked from every header and the "Cloud & AI" card. *(2026-10-09)*
- [x] "How it works" page (`/swirl-cloud/fonctionnement/`, `/en/swirl-cloud/how-it-works/`): install on rented or owned servers, architecture diagram, environments and delivery flow, high availability and recovery, with measured figures only (October 2026; recovery time is left out until measured). *(2026-10-09)*
- [ ] Sovereignty page: hosting locations, jurisdiction, the published list of external services and subprocessors, the strict sovereignty mode and the exit commitment (open components, standard formats, self-operation runbook).
- [ ] Security and compliance page: controls mapped to NIS2, ISO/IEC 27001, DORA and GDPR, a sample evidence pack, the vulnerability disclosure policy and penetration-test status.
- [ ] Editions and pricing page matching the licensing decision (self-hosted community, managed, enterprise/LTS): what each includes, support hours and the SLA.
- [ ] Cost calculator (React island): server count and size, users and applications in; fixed monthly cost and an equivalent hyperscaler estimate out, with every assumption and price source shown and dated.
- [ ] Comparison page against a hyperscaler, a do-it-yourself Kubernetes distribution and a stack of separate SaaS subscriptions, with factual criteria only.
- [ ] Case study of the company's own installation: what runs on it, deployment frequency, recovery drills and availability, from real measurements.
- [x] Demo request path: a "Swirl Cloud demo" choice in the contact form (preselected from the product page's demo links), naming the company instead of a subject, stored like other inquiries and sent to the CRM as a lead named after the company with the company as partner. *(2026-10-09)*
- [ ] Guided product tour (screenshots or short videos of the setup hub, portal, deployment and compliance views) without requiring a live account.
- [ ] Trust center page: data location, subprocessors, data processing agreement template, certification status, status page link and security contact.
- [ ] Serve `/.well-known/security.txt` with the security contact, policy link and expiry, and keep it in the built-security check.
- [ ] Legal pages for the offer: terms of service, SLA, data processing agreement and acceptable use (FR and EN), linked from the footer.
- [ ] Releases page listing platform versions, release channels and changelog highlights, linked to the published product documentation.
- [ ] Resource articles (FR and EN): NIS2 readiness checklist, DORA obligations for ICT suppliers, leaving a hyperscaler, French electronic invoicing; each ends with the demo call to action.
- [ ] Structured data (`SoftwareApplication`/`Product`, `Organization`, `FAQPage`), sitemap entries, hreflang pairs and Open Graph images for every new page; extend `check-built-seo.py` to cover them.
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
- [ ] Trim the chat launcher bundle on the home pages: its `data/site.ts` import pulls all portfolio content into a 21 KB chunk (7 KB gzipped); pass the values it needs as props instead.
