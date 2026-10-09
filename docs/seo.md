# SEO maintenance

`src/layouts/Layout.astro` generates page titles, descriptions, canonical URLs,
language alternates, social cards and JSON-LD. Routes and site identity are
defined in `data/site.ts`; service and project content lives in
`data/portfolio.ts`, the service landing pages in `data/expertise.ts` and the
Swirl Cloud product pages in `data/product.ts` and `data/how-it-works.ts`.

## Site structure

| Page | French | English |
| --- | --- | --- |
| Home | `/` | `/en/` |
| Services (3) | `/developpement-applications-sur-mesure/`, `/logiciel-embarque-iot/`, `/cloud-prive-souverain-ia/` | `/en/custom-software-development/`, `/en/embedded-software-iot/`, `/en/sovereign-private-cloud-ai/` |
| Swirl Cloud product | `/swirl-cloud/` | `/en/swirl-cloud/` |
| Swirl Cloud: how it works | `/swirl-cloud/fonctionnement/` | `/en/swirl-cloud/how-it-works/` |
| Case-study hub | `/projets/` | `/en/projects/` |
| Case studies (10) | `/projets/<slug>/` | `/en/projects/<slug>/` |
| Privacy | `/confidentialite/` | `/en/privacy/` |

Service URLs sit at the root and carry the main search terms. The product page
keeps the product name in both languages and is linked from every header and
the home "Cloud & AI" card; its detail pages sit below it (`productPages` in
`data/site.ts`) and are linked from it. Inner pages use
`src/layouts/Subpage.astro` for the shared header, visible breadcrumbs and
`BreadcrumbList`. Home service cards, case studies and service pages link to
each other: keep `projects` in `data/expertise.ts` covering every case study.

When adding or renaming a page, update the route map and both language versions.
Each page needs a unique title (brand first: `Swirl | …`) and description, one
H1, a self-canonical and reciprocal language links. `/sitemap.xml` is generated
from the route map; `/robots.txt` excludes the contact API. Keep project links
in the rendered HTML so they remain crawlable without JavaScript; inner pages
hydrate nothing except the chat launcher.

## Structured data

Every page carries `Organization` (with the raster `/logo.png` and founder),
`WebSite`, the CEO `Person` and its `WebPage`. Service pages add `Service` with
an `OfferCatalog` and `FAQPage`; the product page adds `SoftwareApplication`
and `FAQPage`; the hub is a `CollectionPage` with an
`ItemList`; case studies add `CreativeWork`. Homepage `Service` entities share
the `@id` of their landing page. JSON-LD must escape `<`, and executable inline
scripts and styles must match the generated CSP. FAQ answers must match the
visible text and stay factual: Google shows FAQ rich results only for
authoritative government and health sites, but the markup still describes the
page to other search and answer engines. The same holds for
`SoftwareApplication`: it has no `offers` until pricing is published, so Google
treats it as ineligible for software rich results.

## Social cards, icons and llms.txt

`src/pages/og/[image].png.ts` renders a 1200×630 card per document at build
time (`lib/social-image.tsx`: Satori with the bundled Manrope font, then
sharp), mirroring the page H1. The same module builds `/logo.png`,
`/apple-touch-icon.png` and `/favicon.ico` from `public/assets/mark.svg`.
`/llms.txt` summarizes the company, services and case studies for AI answer
engines from the same data.

## Delivery

The Node handler serves Brotli or gzip HTML (negotiated, cached per document,
`Vary: Accept-Encoding`) because `Cache-Control: no-transform` stops Cloudflare
from compressing documents. Cloudflare keeps documents and files at its edge
until the next release, so crawlers and visitors are served from the nearest
location; see [Cloudflare edge cache](deployment.md#cloudflare-edge-cache).
Unknown document paths return the localized `noindex` 404 page with a 404
status; missing files keep a plain 404. Neither is stored at the edge.

## Validation

```sh
npm run check
npm run build
python3 scripts/check-built-security.py
python3 scripts/check-built-seo.py
```

The checks cover all 36 pages and both 404 pages: metadata, social cards,
internal links and fragments, language alternates, structured data, sitemap
entries, `llms.txt`, icons and CSP hashes.

## Production checks

After a domain or route change, verify public access, redirects, canonicals and
language links at `https://swirlit.dev`. Update `siteConfig.origin` and the runtime
`PUBLIC_ORIGIN` together; see [deployment](deployment.md) and [DNS](dns.md).
Verify domain ownership in Google Search Console and Bing Webmaster Tools,
submit `/sitemap.xml`, and inspect representative URLs after deployment. Check
a document response carries `Content-Encoding` through Cloudflare, and preview
a shared link (LinkedIn Post Inspector) after changing a card.

## References

- [Google: title links](https://developers.google.com/search/docs/appearance/title-link)
- [Google: localized versions](https://developers.google.com/search/docs/specialty/international/localized-versions)
- [Google: sitemaps](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Google: structured data](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)
- [Google: organization logo](https://developers.google.com/search/docs/appearance/structured-data/organization)
- [The Open Graph protocol](https://ogp.me/)
- [llms.txt](https://llmstxt.org/)
