# TODO

Open website work, added 2026-09-27. The Odoo side (modules, integration user,
Vault credentials, network policy) is tracked in `swirl-cloud/TODO.md` §23.

## Company details

- [ ] Show the headquarters address in the footer and contact page (FR and EN).
- [ ] Show the SIRET number.
- [ ] Show the business phone number (OnOff virtual number) with a `tel:` link.
- [ ] Add a legal notice page (mentions légales) with company name, SIRET, headquarters address, phone, publication director and host, linked from the footer; no such page exists today.

## Odoo integration through its API

- [ ] Create an Odoo CRM lead for every accepted contact-form submission through the Odoo API, using the integration user's key from Vault (`secret/apps/swirl-website/<env>/odoo`) and the in-cluster Odoo address.
- [ ] Keep the local SQLite storage as the source of truth, and retry Odoo delivery idempotently (store the Odoo lead ID) so an Odoo outage never loses an inquiry.
- [ ] Tests for lead creation, Odoo unavailability and duplicate submissions.

## Support / Chat with us widget

- [ ] Embed Odoo Live Chat (`im_livechat`) as the "Chat with us" widget on every page, loaded from `odoo.<domain>`.
- [ ] Update the Content Security Policy for the Odoo loader, styles and WebSocket connection.
- [ ] Load the widget only on interaction or after consent if it sets cookies; the site currently promises no cookies and no third-party scripts.
- [ ] Update the privacy page (FR and EN): Odoo processing of contact data and chat transcripts.

## Domains

- [x] `swirlit.dev`
- [ ] `swirl.cloud`
- [ ] `swirlcloud.io`
- [ ] `swirl-cloud.com`
