import { brotliCompressSync, constants, gzipSync } from 'node:zlib';
import { handleContact, type ContactEnv } from './contact.ts';
import { secureResponse } from './security.ts';
export interface Env extends ContactEnv {
  ASSETS: { fetch(request: Request): Promise<Response> };
}
type Encoding = 'br' | 'gzip';
type Lang = 'fr' | 'en';

// Prefer Brotli, then gzip, honouring q=0 exclusions and the * wildcard.
function preferredEncoding(header: string | null): Encoding | undefined {
  const weights = new Map<string, number>();
  for (const part of (header ?? '').toLowerCase().split(',')) {
    const [name, ...params] = part.split(';').map((value) => value.trim());
    if (!name) continue;
    const quality = params.find((param) => param.startsWith('q='));
    weights.set(name, quality ? Number(quality.slice(2)) : 1);
  }
  return (['br', 'gzip'] as const).find(
    (name) => (weights.get(name) ?? weights.get('*') ?? 0) > 0,
  );
}

const compress: Record<Encoding, (html: string) => Uint8Array<ArrayBuffer>> = {
  br: (html) =>
    brotliCompressSync(html, {
      params: {
        [constants.BROTLI_PARAM_MODE]: constants.BROTLI_MODE_TEXT,
        [constants.BROTLI_PARAM_QUALITY]: constants.BROTLI_MAX_QUALITY,
      },
    }),
  gzip: (html) => gzipSync(html, { level: constants.Z_BEST_COMPRESSION }),
};

export function createRequestHandler(
  pages: Record<string, string> = {},
  notFound: Partial<Record<Lang, string>> = {},
) {
  // Documents are static: compress each one once per encoding on first use.
  const encoded = new Map<string, Uint8Array<ArrayBuffer>>();
  function documentResponse(
    request: Request,
    key: string,
    html: string,
    status = 200,
  ) {
    const encoding = preferredEncoding(request.headers.get('accept-encoding'));
    const headers: Record<string, string> = {
      'Content-Type': 'text/html; charset=utf-8',
      // Preserve the generated HTML and its hash-based script policy when
      // passing through Cloudflare or another transforming CDN. That also
      // stops the CDN compressing documents, so the origin does it.
      'Cache-Control': 'no-cache, no-transform',
      Vary: 'Accept-Encoding',
    };
    let body: string | Uint8Array<ArrayBuffer> = html;
    if (encoding) {
      const cacheKey = `${encoding}:${key}`;
      body = encoded.get(cacheKey) ?? compress[encoding](html);
      encoded.set(cacheKey, body);
      headers['Content-Encoding'] = encoding;
    }
    return secureResponse(
      new Response(request.method === 'HEAD' ? null : body, {
        status,
        headers,
      }),
    );
  }
  return {
    async fetch(request: Request, env: Env): Promise<Response> {
      const url = new URL(request.url);
      const path = url.pathname;
      if (path === '/api/contact')
        return secureResponse(await handleContact(request, env));
      if (path.startsWith('/api/'))
        return secureResponse(new Response('Not found', { status: 404 }));
      for (const [route, html] of Object.entries(pages)) {
        const alias =
          path === `${route}index.html` ||
          (route !== '/' && path === route.slice(0, -1));
        if (path !== route && !alias) continue;
        if (!['GET', 'HEAD'].includes(request.method)) {
          return secureResponse(
            new Response(null, {
              status: 405,
              headers: { Allow: 'GET, HEAD' },
            }),
          );
        }
        if (alias)
          return secureResponse(
            new Response(null, {
              status: 308,
              headers: { Location: route + url.search },
            }),
          );
        return documentResponse(request, route, html);
      }
      try {
        const response = await env.ASSETS.fetch(request);
        // Unknown document paths (no file extension) get the localized 404
        // page with its navigation; missing files keep the plain response.
        const lang: Lang =
          path === '/en' || path.startsWith('/en/') ? 'en' : 'fr';
        const page = notFound[lang];
        if (
          response.status === 404 &&
          page &&
          ['GET', 'HEAD'].includes(request.method) &&
          !/\.[^/]*$/.test(path)
        )
          return documentResponse(request, `404:${lang}`, page, 404);
        return secureResponse(response);
      } catch {
        return secureResponse(
          new Response('Service unavailable', {
            status: 503,
            headers: { 'Cache-Control': 'no-store' },
          }),
        );
      }
    },
  };
}
export default createRequestHandler();
