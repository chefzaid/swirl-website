import { test } from 'node:test';
import assert from 'node:assert/strict';
import worker, { createWorker } from '../server/worker.ts';
import { securityHeaders } from '../server/security.ts';
import { sourceBucket } from '../server/contact-limits.ts';

void test('security headers cover assets, API errors, unknown paths and asset failures', async () => {
  const env = {
    ASSETS: { fetch: async () => new Response('page') },
  } as unknown as Parameters<typeof worker.fetch>[1];
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
    const response = await worker.fetch(request, bindings as typeof env);
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
  const app = createWorker({
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
