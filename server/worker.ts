import { handleContact, type ContactEnv } from './contact.ts';
import { secureResponse } from './security.ts';
export interface Env extends ContactEnv {
  ASSETS: { fetch(request: Request): Promise<Response> };
}
export function createWorker(pages: Record<string, string> = {}) {
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
        return secureResponse(
          new Response(request.method === 'HEAD' ? null : html, {
            headers: {
              'Content-Type': 'text/html; charset=utf-8',
              'Cache-Control': 'no-cache',
            },
          }),
        );
      }
      try {
        return secureResponse(await env.ASSETS.fetch(request));
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
export default createWorker();
