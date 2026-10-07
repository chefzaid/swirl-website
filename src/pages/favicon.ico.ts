import { faviconIco } from '../../lib/social-image';

// Browsers and crawlers request /favicon.ico regardless of the SVG icon link.
export async function GET() {
  return new Response(new Uint8Array(await faviconIco()), {
    headers: { 'Content-Type': 'image/x-icon' },
  });
}
