import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from 'node:http';
import { BlockList, isIP } from 'node:net';
import { readFile, realpath, stat } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { createHash } from 'node:crypto';
import { secureResponse } from '../server/security.ts';
import type { Env } from '../server/worker.ts';

export interface Worker {
  fetch(request: Request, env: Env): Promise<Response>;
}

function normalizedIp(value: string): string {
  if (value.startsWith('::ffff:') && isIP(value.slice(7)) === 4)
    return value.slice(7);
  return isIP(value) ? value : '';
}

export function trustedProxy(cidrs: string): (ip: string) => boolean {
  const list = new BlockList();
  for (const entry of cidrs
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)) {
    const parts = entry.split('/');
    const family = isIP(parts[0]);
    const addressBits = family === 4 ? 32 : 128;
    const prefix = parts.length === 1 ? addressBits : Number(parts[1]);
    if (
      !family ||
      parts.length > 2 ||
      !/^\d+$/.test(String(parts[1] ?? prefix)) ||
      !Number.isInteger(prefix) ||
      prefix < 1 ||
      prefix > addressBits
    )
      throw new Error(
        'TRUSTED_PROXY_CIDRS must contain explicit IP addresses or bounded CIDRs',
      );
    list.addSubnet(parts[0], prefix, family === 4 ? 'ipv4' : 'ipv6');
  }
  return (value) => {
    const ip = normalizedIp(value);
    return !!ip && list.check(ip, isIP(ip) === 4 ? 'ipv4' : 'ipv6');
  };
}

export function clientIp(
  remoteAddress: string,
  headers: Headers,
  trust: (ip: string) => boolean,
): string {
  const direct = normalizedIp(remoteAddress);
  // ingress-nginx overwrites X-Real-IP after trusting Cloudflare's network.
  // Client-supplied CF-Connecting-IP and X-Forwarded-For never reach the Worker.
  const forwarded = headers.get('x-real-ip') ?? '';
  return trust(direct) && isIP(forwarded) ? normalizedIp(forwarded) : direct;
}

const contentTypes: Record<string, string> = {
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.json': 'application/json',
};

export function assetFetcher(directory: string): Env['ASSETS'] {
  const root = resolve(directory);
  return {
    async fetch(request: Request) {
      if (!['GET', 'HEAD'].includes(request.method))
        return new Response(null, {
          status: 405,
          headers: { Allow: 'GET, HEAD' },
        });
      let path: string;
      try {
        path = decodeURIComponent(new URL(request.url).pathname);
      } catch {
        return new Response('Invalid path', { status: 400 });
      }
      if (
        path.includes('\\') ||
        path.includes('\0') ||
        path
          .split('/')
          .some(
            (part) =>
              part.startsWith('.') ||
              (part.startsWith('_') && part !== '_astro'),
          )
      )
        return new Response('Not found', { status: 404 });
      const type = contentTypes[extname(path).toLowerCase()];
      if (!type) return new Response('Not found', { status: 404 });
      try {
        const file = await realpath(resolve(root, '.' + path));
        if (!file.startsWith(root + sep))
          return new Response('Not found', { status: 404 });
        const details = await stat(file);
        if (!details.isFile())
          return new Response('Not found', { status: 404 });
        const body = await readFile(file);
        const etag =
          '"' + createHash('sha256').update(body).digest('hex') + '"';
        const headers = {
          'Content-Type': type,
          'Cache-Control': path.startsWith('/_astro/')
            ? 'public, max-age=31536000, immutable'
            : 'public, max-age=3600',
          'Content-Length': String(body.length),
          ETag: etag,
        };
        if (request.headers.get('if-none-match') === etag)
          return new Response(null, { status: 304, headers });
        return new Response(request.method === 'HEAD' ? null : body, {
          headers,
        });
      } catch (error) {
        if (
          (error as NodeJS.ErrnoException).code === 'ENOENT' ||
          (error as NodeJS.ErrnoException).code === 'ENOTDIR'
        )
          return new Response('Not found', { status: 404 });
        throw error;
      }
    },
  };
}

function requestBody(incoming: IncomingMessage): ReadableStream<Uint8Array> {
  let active = true;
  return new ReadableStream(
    {
      start(controller) {
        incoming.pause();
        incoming.on('data', (chunk: Buffer) => {
          incoming.pause();
          if (active) controller.enqueue(new Uint8Array(chunk));
        });
        incoming.once('end', () => {
          if (active) {
            active = false;
            controller.close();
          }
        });
        incoming.once('error', (error) => {
          if (active) {
            active = false;
            controller.error(error);
          }
        });
      },
      pull() {
        incoming.resume();
      },
      cancel() {
        // Preserve the socket long enough to return the API's 408/413 response.
        // The HTTP adapter closes keep-alive when a body has not been consumed.
        active = false;
        incoming.pause();
      },
    },
    { highWaterMark: 0 },
  );
}

function incomingRequest(
  incoming: IncomingMessage,
  path: string,
  origin: URL,
  trust: (ip: string) => boolean,
): Request {
  const headers = new Headers();
  for (const [name, value] of Object.entries(incoming.headers)) {
    if (value !== undefined)
      headers.set(name, Array.isArray(value) ? value.join(', ') : value);
  }
  const ip = clientIp(incoming.socket.remoteAddress ?? '', headers, trust);
  for (const name of [
    'cf-connecting-ip',
    'x-forwarded-for',
    'x-real-ip',
    'forwarded',
    'x-forwarded-host',
    'x-forwarded-proto',
  ])
    headers.delete(name);
  headers.set('cf-connecting-ip', ip);
  const method = incoming.method ?? 'GET';
  const init = {
    method,
    headers,
    duplex: 'half',
    ...(!['GET', 'HEAD'].includes(method)
      ? { body: requestBody(incoming) }
      : {}),
  };
  return new Request(new URL(path, origin).href, init);
}

function healthResponse(method: string, healthy: boolean): Response {
  const message = healthy ? 'ok\n' : 'unavailable\n';
  let status = healthy ? 200 : 503;
  if (!['GET', 'HEAD'].includes(method)) status = 405;
  return secureResponse(
    new Response(method === 'HEAD' ? null : message, {
      status,
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-store',
        Allow: 'GET, HEAD',
      },
    }),
  );
}

export function createNodeServer(options: {
  worker: Worker;
  env: Env;
  origin: string;
  aliasHost?: string;
  trustedProxyCidrs?: string;
  healthy: () => boolean | Promise<boolean>;
}) {
  const origin = new URL(options.origin);
  if (
    !['http:', 'https:'].includes(origin.protocol) ||
    origin.username ||
    origin.password ||
    origin.pathname !== '/' ||
    origin.search ||
    origin.hash
  )
    throw new Error(
      'PUBLIC_ORIGIN must be an HTTP(S) origin without a path or credentials',
    );
  const trust = trustedProxy(options.trustedProxyCidrs ?? '');
  const aliasHost = options.aliasHost ?? `www.${origin.hostname}`;
  if (
    aliasHost.length > 253 ||
    aliasHost === origin.hostname ||
    !aliasHost
      .split('.')
      .every((label) => /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(label))
  )
    throw new Error(
      'PUBLIC_ALIAS_HOST must be a hostname distinct from PUBLIC_ORIGIN',
    );
  async function handle(incoming: IncomingMessage, outgoing: ServerResponse) {
    try {
      const path = incoming.url ?? '/';
      if (
        !path.startsWith('/') ||
        path.startsWith('//') ||
        path.includes('\\')
      ) {
        const response = secureResponse(
          new Response(null, { status: 400, headers: { Connection: 'close' } }),
        );
        outgoing.writeHead(
          response.status,
          Object.fromEntries(response.headers),
        );
        outgoing.end();
        return;
      }
      const request = incomingRequest(incoming, path, origin, trust);
      const method = request.method;
      let response: Response;
      const host = incoming.headers.host?.toLowerCase().replace(/:\d+$/, '');
      if (host === aliasHost) {
        response = secureResponse(
          new Response(null, {
            status: 308,
            headers: { Location: origin.origin + path },
          }),
        );
      } else if (new URL(request.url).pathname === '/healthz') {
        response = healthResponse(method, await options.healthy());
      } else if (new URL(request.url).pathname === '/livez') {
        response = healthResponse(method, true);
      } else response = await options.worker.fetch(request, options.env);
      if (
        !incoming.complete ||
        (!['GET', 'HEAD'].includes(method) && !request.bodyUsed)
      )
        outgoing.shouldKeepAlive = false;
      outgoing.writeHead(response.status, Object.fromEntries(response.headers));
      outgoing.end(
        method === 'HEAD'
          ? undefined
          : Buffer.from(await response.arrayBuffer()),
      );
    } catch {
      outgoing.shouldKeepAlive = false;
      if (!outgoing.headersSent) {
        const response = secureResponse(
          new Response('Service unavailable', {
            status: 503,
            headers: { 'Cache-Control': 'no-store' },
          }),
        );
        outgoing.writeHead(
          response.status,
          Object.fromEntries(response.headers),
        );
        outgoing.end('Service unavailable');
      } else outgoing.destroy();
    }
  }
  const server = createServer(
    {
      requestTimeout: 10_000,
      headersTimeout: 10_000,
      keepAliveTimeout: 5000,
      maxHeaderSize: 16_384,
    },
    (incoming, outgoing) => {
      void handle(incoming, outgoing);
    },
  );
  server.maxHeadersCount = 64;
  return server;
}
