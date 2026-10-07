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

## Swirl Cloud product pages (added 2026-10-04)

Present Swirl Cloud as a product, not only as the "Cloud & AI" service card: a
sovereign company cloud on bare metal for European SMEs and regulated mid-market
companies, which they own like on-premises, run like SaaS and can leave at any
time. Publish a claim only once the platform demonstrates it (measured install
time, sovereignty mode, compliance evidence); mark the rest as roadmap.

- [ ] Product landing page (FR and EN): value proposition, target customers (20–500 employees, NIS2, DORA ICT suppliers, customer security questionnaires), what one installation includes by layer, how it is delivered (self-run or managed with customer-held keys) and a call to action, linked from the header and the "Cloud & AI" card.
- [ ] "How it works" page: install on rented or owned servers, architecture diagram, environments and delivery flow, high availability and recovery, with measured figures only.
- [ ] Sovereignty page: hosting locations, jurisdiction, the published list of external services and subprocessors, the strict sovereignty mode and the exit commitment (open components, standard formats, self-operation runbook).
- [ ] Security and compliance page: controls mapped to NIS2, ISO/IEC 27001, DORA and GDPR, a sample evidence pack, the vulnerability disclosure policy and penetration-test status.
- [ ] Editions and pricing page matching the licensing decision (self-hosted community, managed, enterprise/LTS): what each includes, support hours and the SLA.
- [ ] Cost calculator (React island): server count and size, users and applications in; fixed monthly cost and an equivalent hyperscaler estimate out, with every assumption and price source shown and dated.
- [ ] Comparison page against a hyperscaler, a do-it-yourself Kubernetes distribution and a stack of separate SaaS subscriptions, with factual criteria only.
- [ ] Case study of the company's own installation: what runs on it, deployment frequency, recovery drills and availability, from real measurements.
- [ ] Demo request path: a "Swirl Cloud demo" choice in the contact form, stored like other inquiries (and sent to the CRM once the Odoo integration above exists).
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
