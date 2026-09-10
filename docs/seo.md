# Swirl IT SEO implementation

The site has 24 canonical HTML pages: French/English homepages, privacy notices, and 10 project pages in each language. Each page has a unique title, description, one H1, a self-canonical, and reciprocal French/English/x-default alternates. `data/site.ts` is the shared source for the origin, routes, sitemap and personal LinkedIn destination.

All project cards and real links exist in the initial homepage HTML. The additional cards use native `details`, so expanding them works without JavaScript. Only the header, gallery and contact form hydrate when needed; the presentation stays server-rendered. The gallery receives only the active language. Normal clicks can still open the existing dialog after hydration; modified clicks and JavaScript-free navigation follow the project URL. Each project page is static, has a visible breadcrumb, related project links, partnership attribution and a contact link, and requires no client-side JavaScript.

`/sitemap.xml` lists all canonical routes and language alternates. `/robots.txt` points to that sitemap and excludes the contact API. No guessed last-modified dates, ratings, locations, founding dates, client results or financial metrics are added. Team references have been removed from project titles and descriptions in both languages.

JSON-LD describes the organization, website, page, visible services and CEO; project pages also include breadcrumbs. The personal LinkedIn profile belongs to the Person entity, not the company. JSON-LD escapes `<` and is parsed during validation. It is an inert data block, while executable inline scripts and styles remain covered by the existing CSP hashes. All 24 documents continue to receive the Node response security headers.

Home social previews retain the existing image with its actual dimensions, localized description and alternative text. Project previews have their own title and description, and omit the generic home image. Only the two Latin variable font files used by French/English are emitted; the heading font is preloaded and both use `font-display: swap`. Images keep explicit dimensions, and the below-the-fold portrait remains lazy-loaded. No tracker or external font request was introduced.

The homepage's hero introduction mentions custom software development at a
fixed price and private-cloud hosting. Its localized title targets custom software development; the meta
description and `Service` JSON-LD retain the fixed-price development target. 
The introduction in `data/portfolio.ts` is shared with the structured description,
and the service URL points to `#home`. No `meta keywords` tag is added; the
terms appear in useful content and descriptive metadata.

## Validation

Run `npm run check`, `npm run build`, `python3 scripts/check-built-security.py`, and `python3 scripts/check-built-seo.py`. The SEO checker covers every route, metadata uniqueness, language reciprocity, internal links, structured data, sitemap parity and initial-HTML project discoverability. The existing contact/security suite remains available through `npm test`.

## Public launch

K3s production uses the public canonical domain `https://swirlit.dev`; see
[deployment](deployment.md).
The repository stays private. A successful deployment permits crawling but does
not guarantee indexing or ranking; Search Console ownership and submission are
separate operator steps.

After production deployment:

1. Connect and verify the final domain, then update `siteConfig.origin` in `data/site.ts` and rebuild. Do not point canonicals at an unconnected domain.
2. Verify the real public pages return HTTP 200 without sign-in and preserve canonicals, language alternates and security headers. Redirect any alternative public domain to the chosen one.
3. Verify ownership in Google Search Console, submit `/sitemap.xml`, and inspect representative French/English URLs and structured data.
4. Monitor real Core Web Vitals and indexing data after traffic becomes available. Improve content using verified client outcomes when supplied.

## Primary references

- [Google: crawlable links](https://developers.google.com/search/docs/crawling-indexing/links-crawlable)
- [Google: JavaScript SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)
- [Google: localized versions](https://developers.google.com/search/docs/specialty/international/localized-versions)
- [Google: sitemap construction](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Google: Organization structured data](https://developers.google.com/search/docs/appearance/structured-data/organization)
- [Google: structured-data access and accuracy](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)
