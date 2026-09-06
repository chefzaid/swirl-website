import { absoluteUrl, documentRoutes } from '../../data/site';
const escapeXml = (value: string) =>
  value.replace(
    /[<>&"']/g,
    (char) =>
      ({
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        '"': '&quot;',
        "'": '&apos;',
      })[char]!,
  );
export function GET() {
  const urls = documentRoutes
    .map(
      (route) =>
        `<url><loc>${escapeXml(absoluteUrl(route.path))}</loc>${Object.entries({
          ...route.alternates,
          'x-default': route.alternates.fr,
        })
          .map(
            ([lang, path]) =>
              `<xhtml:link rel="alternate" hreflang="${lang}" href="${escapeXml(absoluteUrl(path))}"/>`,
          )
          .join('')}</url>`,
    )
    .join('');
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls}</urlset>`,
    {
      headers: { 'Content-Type': 'application/xml; charset=utf-8' },
    },
  );
}
