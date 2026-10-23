import { getEntry } from 'astro:content';
import {
  absoluteUrl,
  documentRoutes,
  type DocumentRoute,
} from '../../data/site';
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
// Articles record when their facts were last checked; other pages have no
// trustworthy modification date, so they carry none.
async function lastmod({ page, lang }: DocumentRoute) {
  if (page.kind !== 'article') return '';
  const entry = await getEntry('articles', `${lang}/${page.id}`);
  return `<lastmod>${entry!.data.updated.toISOString().slice(0, 10)}</lastmod>`;
}
export async function GET() {
  const dates = await Promise.all(documentRoutes.map(lastmod));
  const urls = documentRoutes
    .map(
      (route, index) =>
        `<url><loc>${escapeXml(absoluteUrl(route.path))}</loc>${dates[index]}${Object.entries(
          {
            ...route.alternates,
            'x-default': route.alternates.fr,
          },
        )
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
