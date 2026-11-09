import { markPng } from '../../lib/social-image';

// iOS fills transparency with black; use the site's light foreground instead.
export async function GET() {
  return new Response(
    new Uint8Array(await markPng(180, { padding: 22, background: '#f3f2f6' })),
    { headers: { 'Content-Type': 'image/png' } },
  );
}
