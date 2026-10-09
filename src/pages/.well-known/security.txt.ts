import { absoluteUrl, productPagePath, siteConfig } from '../../../data/site';

// RFC 9116 security contact. Expires is set when the site is built, so every
// release renews it while staying under the one-year limit the RFC recommends.
export const VALID_DAYS = 180;
export function GET() {
  const expires = new Date(Date.now() + VALID_DAYS * 86_400_000);
  const policy = (lang: 'fr' | 'en') =>
    `Policy: ${absoluteUrl(productPagePath('security', lang))}#disclosure`;
  const body = [
    `Contact: mailto:${siteConfig.email}`,
    `Expires: ${expires.toISOString().replace(/\.\d{3}Z$/, 'Z')}`,
    policy('en'),
    policy('fr'),
    'Preferred-Languages: fr, en',
    `Canonical: ${absoluteUrl('/.well-known/security.txt')}`,
    '',
  ].join('\n');
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
