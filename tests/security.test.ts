import { test } from 'node:test';
import assert from 'node:assert/strict';
import { brotliDecompressSync, gunzipSync } from 'node:zlib';
import handler, { createRequestHandler } from '../server/handler.ts';
import { securityHeaders } from '../server/security.ts';
import { sourceBucket } from '../server/contact-limits.ts';

void test('security headers cover assets, API errors, unknown paths and asset failures', async () => {
  const env = {
    ASSETS: { fetch: async () => new Response('page') },
  } as unknown as Parameters<typeof handler.fetch>[1];
  const scenarios = [
    [new Request('https://portfolio.test/'), env, 200],
    [new Request('https://portfolio.test/asset.css'), env, 200],
    [new Request('https://portfolio.test/api/contact'), env, 405],
    [
      new Request('https://portfolio.test/api/contact', {
        method: 'POST',
        headers: { Origin: 'https://evil.test' },
      }),
      env,
      403,
    ],
    [new Request('https://portfolio.test/api/missing'), env, 404],
    [
      new Request('https://portfolio.test/'),
      {
        ASSETS: {
          fetch: async () => {
            throw new Error('sensitive backend detail');
          },
        },
      },
      503,
    ],
  ] as const;
  for (const [request, bindings, status] of scenarios) {
    const response = await handler.fetch(request, bindings as typeof env);
    assert.equal(response.status, status);
    for (const [name, value] of Object.entries(securityHeaders))
      assert.equal(response.headers.get(name), value);
    assert.ok(!(await response.text()).includes('sensitive backend detail'));
  }
});

void test('IP normalization groups IPv6 prefixes, canonical aliases and IPv4-mapped addresses', () => {
  const bucket = (ip: string, extra: Record<string, string> = {}) =>
    sourceBucket(
      new Request('https://portfolio.test/', {
        headers: { 'cf-connecting-ip': ip, ...extra },
      }),
    );
  assert.equal(
    bucket('2001:0db8:1234:5678:0000:0000:0000:0001'),
    bucket('2001:db8:1234:5678::ffff'),
  );
  assert.notEqual(
    bucket('2001:db8:1234:5678::1'),
    bucket('2001:db8:1234:5679::1'),
  );
  assert.equal(bucket('::ffff:192.0.2.1'), bucket('192.0.2.1'));
  assert.equal(
    bucket('invalid', { 'x-forwarded-for': '192.0.2.1' }),
    'unknown',
  );
  assert.equal(
    bucket('192.0.2.1', { 'x-forwarded-for': '198.51.100.1' }),
    bucket('192.0.2.1'),
  );
});

void test('bundled document routes always get headers, with safe aliases and HEAD handling', async () => {
  const app = createRequestHandler({
    '/': '<h1>Home</h1>',
    '/en/': '<h1>English</h1>',
    '/confidentialite/': '<h1>Privacy</h1>',
    '/en/privacy/': '<h1>Privacy EN</h1>',
  });
  const env = {
    ASSETS: {
      fetch: async () => {
        throw new Error('Document must not use static hosting');
      },
    },
  } as unknown as Parameters<typeof app.fetch>[1];
  for (const route of ['/', '/en/', '/confidentialite/', '/en/privacy/']) {
    const response = await app.fetch(
      new Request('https://portfolio.test' + route),
      env,
    );
    assert.equal(response.status, 200);
    assert.match(response.headers.get('Content-Type') || '', /text\/html/);
    assert.equal(response.headers.get('X-Frame-Options'), 'DENY');
    const head = await app.fetch(
      new Request('https://portfolio.test' + route, { method: 'HEAD' }),
      env,
    );
    assert.equal(head.status, 200);
    assert.equal(await head.text(), '');
    const post = await app.fetch(
      new Request('https://portfolio.test' + route, { method: 'POST' }),
      env,
    );
    assert.equal(post.status, 405);
  }
  for (const [path, destination] of [
    ['/index.html', '/'],
    ['/en', '/en/'],
    ['/en/index.html', '/en/'],
    ['/confidentialite', '/confidentialite/'],
    ['/en/privacy/index.html', '/en/privacy/'],
    ['/en?source=contact', '/en/?source=contact'],
    ['/en?next=https%3A%2F%2Fevil.test', '/en/?next=https%3A%2F%2Fevil.test'],
  ]) {
    const response = await app.fetch(
      new Request('https://portfolio.test' + path),
      env,
    );
    assert.equal(response.status, 308);
    assert.equal(response.headers.get('Location'), destination);
    assert.equal(response.headers.get('X-Frame-Options'), 'DENY');
  }
});

void test('documents are compressed per negotiated encoding and unknown pages get a localized 404', async () => {
  const html = '<h1>Accueil</h1>'.repeat(200);
  const app = createRequestHandler(
    { '/': html },
    { fr: '<h1>Introuvable</h1>', en: '<h1>Not found</h1>' },
  );
  const env = {
    ASSETS: { fetch: async () => new Response('Not found', { status: 404 }) },
  } as unknown as Parameters<typeof app.fetch>[1];
  const get = (path: string, accept?: string, method = 'GET') =>
    app.fetch(
      new Request('https://portfolio.test' + path, {
        method,
        headers: accept === undefined ? {} : { 'Accept-Encoding': accept },
      }),
      env,
    );
  for (const [accept, encoding, decode] of [
    ['gzip, deflate, br', 'br', brotliDecompressSync],
    ['br;q=0, gzip', 'gzip', gunzipSync],
    ['*', 'br', brotliDecompressSync],
  ] as const) {
    // The second request is served from the per-encoding cache.
    for (let attempt = 0; attempt < 2; attempt++) {
      const response = await get('/', accept);
      assert.equal(response.headers.get('Content-Encoding'), encoding);
      assert.equal(response.headers.get('Vary'), 'Accept-Encoding');
      assert.equal(response.headers.get('X-Frame-Options'), 'DENY');
      const body = Buffer.from(await response.arrayBuffer());
      assert.ok(body.length < html.length / 10);
      assert.equal(decode(body).toString(), html);
    }
  }
  for (const accept of [undefined, 'identity', 'br;q=0, gzip;q=0', '*;q=0']) {
    const response = await get('/', accept);
    assert.equal(response.headers.get('Content-Encoding'), null);
    assert.equal(await response.text(), html);
  }
  const head = await get('/', 'br', 'HEAD');
  assert.equal(head.headers.get('Content-Encoding'), 'br');
  assert.equal(await head.text(), '');
  for (const [path, language] of [
    ['/missing/', 'Introuvable'],
    ['/projets/missing', 'Introuvable'],
    ['/en', 'Not found'],
    ['/en/projects/missing/', 'Not found'],
  ]) {
    const response = await get(path);
    assert.equal(response.status, 404);
    assert.match(response.headers.get('Content-Type') ?? '', /text\/html/);
    assert.equal(response.headers.get('X-Frame-Options'), 'DENY');
    assert.equal(await response.text(), `<h1>${language}</h1>`);
  }
  const compressed = await get('/missing/', 'gzip');
  assert.equal(compressed.status, 404);
  assert.equal(
    gunzipSync(Buffer.from(await compressed.arrayBuffer())).toString(),
    '<h1>Introuvable</h1>',
  );
  // Missing files and non-GET requests keep the plain asset response.
  for (const [path, method] of [
    ['/assets/missing.png', 'GET'],
    ['/missing/', 'POST'],
  ]) {
    const response = await get(path, undefined, method);
    assert.equal(response.status, 404);
    assert.equal(await response.text(), 'Not found');
  }
});
