# Swirl IT security review — 6 September 2026

## Scope and evidence

Reviewed the Astro/React application, contact Worker, database queries and migrations, compiled public files, dependencies, Git history and current Sites access. Reproductions used isolated in-memory SQLite and local HTTP requests. No load attack, live contact submission, email notification or destructive production operation was performed.

The live Site was owner-only at review time. An authenticated read-only HEAD request confirmed that the old homepage had none of the intended browser security headers. The production log query returned zero error events for the preceding 24 hours. This is limited operational evidence, not proof that a breach has never occurred. Historical access logs, mailbox activity, host-account compromise and the separate Intranet were not audited.

## Findings and fixes

| Finding                                                                    | Assessment                                                                 | Fix                                                                                                                                                                    |
| -------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| IPv6 address rotation bypassed the per-IP form limit                       | Medium; reproduced 20 accepted enquiries from one /64                      | Canonical IP parsing, IPv6 /64 quotas, IPv4-mapped normalization, per-email and global quotas                                                                          |
| Unlimited exact replays reached D1 before throttling                       | Low; repeated successful retries did not consume the old limit             | Separate request-rate ceilings before enquiry lookup; bounded cache for sources already blocked in a Worker                                                            |
| Simultaneous retries consumed several new-message allowances               | Low; one stored message could exhaust the allowance                        | D1 transaction evaluates all quotas, reserves the submission, updates allowances and inserts once; the reservation is removed within the transaction                   |
| A later exhausted quota could consume earlier allowances                   | Found while testing the fix                                                | Check all allowances before charging any; rejected messages consume no new-message quota; transaction failure rolls everything back                                    |
| Request streams had no application read deadline; cancellation could stall | Hardening against resource exhaustion                                      | 18,000-byte bounded buffer, 5-second deadline, cancellation that cannot block the error response; reject invalid encodings and lengths                                 |
| Email validation allowed ASCII control characters                          | Low; malformed addresses were stored                                       | Reject control characters and angle brackets before persistence                                                                                                        |
| Static assets bypassed Worker headers; API early returns did too           | Confirmed in configuration and on the live homepage                        | Shared response headers, Worker-served HTML documents, and `_headers` for hosts that support it; cover framing, MIME sniffing, HTTPS, referrer and browser permissions |
| No Content Security Policy                                                 | Defense in depth; no exploitable application XSS found                     | Astro-generated per-page script/style hashes, same-origin resources, no script `unsafe-inline` or `unsafe-eval`, prohibited frames/plugins/base URL changes            |
| GHSA-67mh-4wv8-2f99 in transitive development esbuild                      | Moderate advisory; affects its development server, not the deployed Worker | Override the affected Drizzle dependency to esbuild 0.25.12; verify migration generation and audit again                                                               |

## Controls verified

- SQL queries bind visitor values as parameters. SQL metacharacters remain literal data.
- React renders messages as escaped text; the application has no user-controlled raw-HTML sink, dynamic script evaluation or redirect target. Contact values are not reflected in API responses.
- Email is server-side structured JSON, plain text, fixed to `contact@swirlit.dev`, with the visitor as Reply-To. Tests mock Resend and Microsoft; no live mail is sent. Resend uses the enquiry ID as its idempotency key. Credentials stay server-side, and provider errors never remove stored enquiries.
- Required fields, consent, lengths, origin, content type, honeypot and body timing are checked; failures do not expose internal errors or enquiry contents.
- Persistent and atomic quotas remain authoritative across concurrent Worker requests. Request limits include retries, and rejected transactions leave no temporary reservations.
- All 24 built pages have matching hashes for their inline scripts and styles. The public artifact check rejects database files, SQL, source maps, environment files and private-key file extensions.
- Security headers are checked on asset responses, API errors, unknown API routes and asset-service failures.
- Secrets and local databases remain ignored by Git and excluded from the deployment archive. No recognized private-key/token patterns were found in tracked history during review.

Validation passed: 22 automated tests, Astro/TypeScript checks, production build, CSP/hash and public-artifact checks, local HTTP header/error checks, and zero npm audit advisories. The built local site also hydrated, opened/closed a project dialog and filtered projects without console or CSP errors. No schema change was required.

Validation commands: `npm run check`, `npm test`, `npm run build`, `python3 scripts/check-built-security.py`, `npm run db:generate`, `npm audit`.

The initial audit found unrelated lint failures in stale Next.js configuration, markup semantics and timing initialization. The subsequent technical cleanup corrected these; `npm run lint` now passes, including type-aware checks. Intentional control-character rejection expressions remain documented locally.

## Current anti-abuse limits

Windows begin with the first use, rather than resetting at clock-hour boundaries:

- 30 valid parsed requests per minute per IP/network, including retries and conflicts.
- 120 valid parsed requests per minute across the site.
- 5 new submissions per hour per IP/network and per email address.
- 30 new submissions per hour and 100 per day across the site.

Responses include `Retry-After` based on the actual blocked window. Shared networks can share an allowance; direct email remains available. Expired counters are cleaned on a later valid new submission. No contact messages are automatically deleted.

## Hosting header behavior

The first deployment confirmed that Sites ignored the static `_headers` file despite local Wrangler applying it. The build now embeds all HTML documents in the Worker and removes every HTML copy from the public asset directory only after the Worker bundle succeeds. Canonical routes and fixed redirect aliases receive the headers, including HEAD and method errors. Per-page Astro CSP remains unchanged. CSS, fonts and images stay on the static CDN; Sites-level custom headers on those non-document responses remain outside this implementation's control. The document CSP restricts what these assets can do.

## Limits of application protection

These measures cap stored enquiries and outbound notifications. They do not guarantee availability against a distributed attack, bound every Worker invocation or database bill, or prove a visitor is human. Origin headers, honeypots and client-provided timing can be imitated by a dedicated client. The local rejection cache helps a warm Worker but is not the distributed authority.

High-volume denial-of-service protection belongs at the hosting edge, before the Worker/database. The Site uses managed Cloudflare infrastructure; its account-level WAF, bot/challenge settings, billing controls and DDoS telemetry are not exposed by the available Sites tools and were not changed. Before public launch, the host operator should verify those settings for `/api/contact`. A managed bot challenge would require its own configured credentials and deployment; no placeholder challenge was added.

This review does not establish full GDPR compliance. The operational retention period and deletion process for contact messages still need to be defined. The Intranet, Microsoft tenant and GitHub account security are separate systems.

## Primary references

- [Astro Content Security Policy](https://docs.astro.build/en/reference/configuration-reference/#securitycsp)
- [Cloudflare static asset headers](https://developers.cloudflare.com/workers/static-assets/headers/)
- [Cloudflare DDoS protection](https://developers.cloudflare.com/ddos-protection/)
- [OWASP denial-of-service guidance](https://cheatsheetseries.owasp.org/cheatsheets/Denial_of_Service_Cheat_Sheet.html)
- [esbuild security advisory](https://github.com/evanw/esbuild/security/advisories/GHSA-67mh-4wv8-2f99)

## Container runtime dependency maintenance

The K3s runtime uses digest-pinned Node 24.19.0 on Alpine and applies Alpine
security updates during image construction. The bundled Worker and SQLite
adapter run with Node built-ins, so the final runtime removes npm and Yarn.
The independent build stage retains npm for installing and bundling the site.
The runtime still runs as the `node` user with a read-only root filesystem
and a separate writable `/data` mount. Validate both the bundled image and
its SQLite-backed tests when changing the base distribution or Node release.
