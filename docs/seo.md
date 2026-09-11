# SEO maintenance

`src/layouts/Layout.astro` generates page titles, descriptions, canonical URLs,
language alternates and JSON-LD. Routes and site identity are defined in
`data/site.ts`; service and project content lives in `data/portfolio.ts`.
The public site name and organization name are separate configuration fields.

When adding or renaming a page, update the route map and both language versions.
Each page needs a unique title and description, one H1, a self-canonical and
reciprocal language links. `/sitemap.xml` is generated from the route map;
`/robots.txt` excludes the contact API. Keep project links in the rendered HTML
so they remain crawlable without JavaScript.

The homepage service description is shared with its JSON-LD. JSON-LD must escape
`<`, and executable inline scripts and styles must match the generated CSP.
Social previews use page titles and descriptions; provide a public image asset
before adding image metadata.

## Validation

```sh
npm run check
npm run build
python3 scripts/check-built-security.py
python3 scripts/check-built-seo.py
```

The checks cover all 24 pages, metadata, internal links, language alternates,
structured data, sitemap entries and CSP hashes.

## Production checks

After a domain or route change, verify public access, redirects, canonicals and
language links at `https://swirlit.dev`. Update `siteConfig.origin` and the runtime
`PUBLIC_ORIGIN` together; see [deployment](deployment.md) and [DNS](dns.md).
Verify domain ownership in Google Search Console, submit `/sitemap.xml`, and
inspect representative URLs after deployment.

## References

- [Google: title links](https://developers.google.com/search/docs/appearance/title-link)
- [Google: localized versions](https://developers.google.com/search/docs/specialty/international/localized-versions)
- [Google: sitemaps](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Google: structured data](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)
