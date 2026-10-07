import { markPng } from '../../lib/social-image';

// Raster logo for the Organization structured data (Google requires ≥112px).
export async function GET() {
  return new Response(new Uint8Array(await markPng(512)), {
    headers: { 'Content-Type': 'image/png' },
  });
}
