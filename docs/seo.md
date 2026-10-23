# SEO

`src/layouts/Layout.astro` writes every page's title, description, canonical
URL, language alternates, social card and JSON-LD. Routes and site identity are
in `data/site.ts`; page text is in `data/` and the guides in
`src/content/articles/` (schema in `src/content.config.ts`).

## Pages

| Page                        | French                                | English                                  |
| --------------------------- | ------------------------------------- | ---------------------------------------- |
| Home                        | `/`                                   | `/en/`                                   |
| Services (3)                | `/developpement-applications-sur-mesure/`, `/logiciel-embarque-iot/`, `/cloud-prive-souverain-ia/` | `/en/custom-software-development/`, `/en/embedded-software-iot/`, `/en/sovereign-private-cloud-ai/` |
| Swirl Cloud                 | `/swirl-cloud/`                       | `/en/swirl-cloud/`                       |
| Swirl Cloud detail pages    | `/swirl-cloud/fonctionnement/`, `securite-conformite/`, `souverainete/`, `comparatif/` | `/en/swirl-cloud/how-it-works/`, `security-compliance/`, `sovereignty/`, `comparison/` |
| Resources and guides        | `/ressources/`, `/ressources/<slug>/` | `/en/resources/`, `/en/resources/<slug>/` |
| Case studies (10)           | `/projets/`, `/projets/<slug>/`       | `/en/projects/`, `/en/projects/<slug>/`  |
| Privacy                     | `/confidentialite/`                   | `/en/privacy/`                           |

Service URLs sit at the root to carry the main search terms; the product keeps
its name in both languages. Inner pages use `src/layouts/Subpage.astro` for the
header, visible breadcrumbs and `BreadcrumbList`.

## Rules for every page

- A unique title starting with `Swirl | ` (at most 75 characters), a
  description of at most 175 characters, one H1, a self-canonical and a link to the other language.
- Links stay in the HTML, crawlable without JavaScript. Inner pages hydrate only
  the chat button; the phone menu is a native popover that works without it.
- Internal links between related pages: home service cards, service pages and
  case studies link to each other (keep `projects` in `data/expertise.ts`
  covering every case study), and service pages, Swirl Cloud pages and guides
  end with their related guides (`relatedArticles` in `data/site.ts`).
- When adding or renaming a page, update both languages and the routes in
  `data/site.ts`; the sitemap, `llms.txt` and social cards follow.

`/sitemap.xml` lists every page with its language alternates. Only guides carry
a `lastmod`: their `updated` date, which you change whenever you re-check their
facts. `/robots.txt` excludes the contact API. Unknown paths get the localized
404 page with a 404 status and `noindex`.

## Structured data

Every page has `Organization` (with `/logo.png` and its founder), `WebSite`, the
CEO `Person` and a `WebPage`. On top of that:

| Page                         | Adds                                              |
| ---------------------------- | ------------------------------------------------- |
| Service pages                | `Service` with an `OfferCatalog`, and `FAQPage`   |
| Swirl Cloud                  | `SoftwareApplication` (no `offers` until prices are published) and `FAQPage` |
| Security and sovereignty     | `FAQPage`                                         |
| Guides                       | `Article`, with its sources as citations          |
| Resources and case-study hubs| `CollectionPage` with an `ItemList`               |
| Case studies                 | `CreativeWork`                                    |

FAQ answers must match the visible text. Google shows FAQ rich results only for
government and health sites, but other search and answer engines still read
them. JSON-LD escapes `<`, and inline scripts and styles must match the CSP
hashes.

## Social cards, icons and llms.txt

`src/pages/og/[image].png.ts` renders a 1200×630 card per page at build time
with the page's H1 (`lib/social-image.tsx`, Satori and sharp, with the bundled
Manrope font); the same module builds `/logo.png`, `/apple-touch-icon.png` and
`/favicon.ico` from `public/assets/mark.svg`. Satori sizes boxes the CSS way
(`content-box`), so a box with both a size and padding sets
`boxSizing: 'border-box'`. It pins `fflate` 0.7.3, which has a security advisory;
`overrides` in `package.json` swaps in 0.8.3, which renders identical cards.
Remove the override once satori depends on a fixed `fflate`.

`/llms.txt` summarizes the company, services, Swirl Cloud, guides and case
studies for AI answer engines, from the same data.

## Checks

`npm run build`, then `python3 scripts/check-built-seo.py` and
`python3 scripts/check-built-security.py` check every page and both 404s:
metadata, social cards, links and anchors, language pairs, structured data, the
sitemap, `llms.txt`, icons and CSP hashes. Both scripts hold the expected page
count; raise it by two for each new page pair.

After a domain or route change, check the live site's redirects, canonicals and
language links, and update `siteConfig.origin` and the runtime `PUBLIC_ORIGIN`
together ([deployment](deployment.md), [DNS](dns.md)). After changing a social
card, preview a shared link in LinkedIn Post Inspector.

## References

- [Google: title links](https://developers.google.com/search/docs/appearance/title-link)
- [Google: localized versions](https://developers.google.com/search/docs/specialty/international/localized-versions)
- [Google: sitemaps](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Google: structured data](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)
- [Google: organization logo](https://developers.google.com/search/docs/appearance/structured-data/organization)
- [The Open Graph protocol](https://ogp.me/)
- [llms.txt](https://llmstxt.org/)
