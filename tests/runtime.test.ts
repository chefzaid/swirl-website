import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  mkdtemp,
  mkdir,
  readFile,
  writeFile,
  rm,
  symlink,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { request as httpRequest } from 'node:http';
import { once } from 'node:events';
import type { AddressInfo } from 'node:net';
import { SqliteContactDatabase } from '../runtime/sqlite.ts';
import {
  assetFetcher,
  clientIp,
  createNodeServer,
  trustedProxy,
} from '../runtime/server.ts';
import { createRequestHandler } from '../server/handler.ts';

void test('a configured alias redirects to a custom primary host without trusting forwarding headers', async (t) => {
  const directory = await mkdtemp(join(tmpdir(), 'swirl-website-alias-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const db = new SqliteContactDatabase(
    join(directory, 'contact.sqlite'),
    'db/migrations',
  );
  t.after(() => db.close());
  const options = {
    handler: createRequestHandler({ '/': '<h1>Home</h1>' }),
    env: { DB: db, ASSETS: assetFetcher(directory) },
    origin: 'https://portal.example.test',
    healthy: () => true,
  };
  for (const aliasHost of [
    'portal.example.test',
    '@.example.test',
    'evil.test/path',
    'bad..test',
    'host:443',
    'https://evil.test',
  ]) {
    assert.throws(
      () => createNodeServer({ ...options, aliasHost }),
      /PUBLIC_ALIAS_HOST/,
    );
  }
  const server = createNodeServer({
    ...options,
    aliasHost: 'welcome.example.test',
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(
    () =>
      new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
        server.closeAllConnections();
      }),
  );
  for (const [host, expectedStatus] of [
    ['WELCOME.EXAMPLE.TEST:443', 308],
    ['www.portal.example.test', 200],
    ['welcome.example.test.evil.test', 200],
  ] as const) {
    const response = await new Promise<{ status: number; location?: string }>(
      (resolve, reject) => {
        const request = httpRequest(
          {
            host: '127.0.0.1',
            port: (server.address() as AddressInfo).port,
            path: '/?next=%2Fpath%2F&trailing=/',
            headers: {
              host,
              'x-forwarded-host': 'attacker.test',
              'x-forwarded-proto': 'http',
            },
          },
          (result) => {
            result.resume();
            resolve({
              status: result.statusCode ?? 0,
              location: result.headers.location,
            });
          },
        );
        request.on('error', reject);
        request.end();
      },
    );
    assert.equal(response.status, expectedStatus);
    assert.equal(
      response.location,
      expectedStatus === 308
        ? 'https://portal.example.test/?next=%2Fpath%2F&trailing=/'
        : undefined,
    );
  }
});

void test('SQLite survives a migration-directory move, migrates once, and rolls a failed batch back', async (t) => {
  const directory = await mkdtemp(join(tmpdir(), 'swirl-website-db-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const file = join(directory, 'contact.sqlite');
  const oldMigrations = join(directory, 'old-migrations');
  await mkdir(oldMigrations);
  const migrationName = '0000_abnormal_king_bedlam.sql';
  await writeFile(
    join(oldMigrations, migrationName),
    await readFile(join('db/migrations', migrationName)),
  );
  let db = new SqliteContactDatabase(file, oldMigrations);
  await db
    .prepare('INSERT INTO contact_rate_limits VALUES (?, ?, ?)')
    .bind('durable', 2, 99)
    .run();
  await assert.rejects(
    db.batch([
      db.prepare('UPDATE contact_rate_limits SET count = 3'),
      db.prepare('INSERT INTO missing_table VALUES (1)'),
    ]),
  );
  db.close();
  db = new SqliteContactDatabase(file, 'db/migrations');
  t.after(() => db.close());
  assert.equal(
    (
      await db
        .prepare('SELECT count FROM contact_rate_limits')
        .first<{ count: number }>()
    )?.count,
    2,
  );
  assert.equal(db.healthy(), true);
  assert.equal(
    (
      await db
        .prepare('SELECT count(*) AS n FROM _swirl_website_migrations')
        .first<{ n: number }>()
    )?.n,
    1,
  );
  assert.equal(
    (await db.prepare('PRAGMA journal_mode').first<{ journal_mode: string }>())
      ?.journal_mode,
    'wal',
  );
});

void test('an applied migration cannot silently change', async (t) => {
  const directory = await mkdtemp(join(tmpdir(), 'swirl-website-migrations-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const migrations = join(directory, 'migrations');
  await mkdir(migrations);
  await writeFile(
    join(migrations, '001.sql'),
    'CREATE TABLE example (id INTEGER);',
  );
  const file = join(directory, 'test.sqlite');
  new SqliteContactDatabase(file, migrations).close();
  await writeFile(
    join(migrations, '001.sql'),
    'CREATE TABLE example (id TEXT);',
  );
  assert.throws(
    () => new SqliteContactDatabase(file, migrations),
    /Applied migration changed/,
  );
});

void test('proxy trust extracts the validated visitor from direct and Tunnel ingress chains', () => {
  const trust = trustedProxy('10.42.0.0/16');
  const headers = new Headers({
    'x-real-ip': '198.51.100.7',
    'cf-connecting-ip': '198.51.100.9',
    'x-forwarded-for': '198.51.100.8, 192.0.2.3, 173.245.48.5',
    forwarded: 'for=198.51.100.6',
  });
  assert.equal(clientIp('10.42.1.2', headers, trust), '192.0.2.3');
  assert.equal(clientIp('::ffff:10.42.1.2', headers, trust), '192.0.2.3');
  assert.equal(clientIp('203.0.113.1', headers, trust), '203.0.113.1');
  headers.set('x-forwarded-for', 'untrusted, 192.0.2.3, 127.0.0.1');
  assert.equal(clientIp('10.42.1.2', headers, trust), '192.0.2.3');
  headers.set('x-forwarded-for', '198.51.100.8, 2001:db8::3, ::1');
  assert.equal(clientIp('10.42.1.2', headers, trust), '2001:db8::3');
  headers.set('x-forwarded-for', '::ffff:192.0.2.3');
  assert.equal(clientIp('10.42.1.2', headers, trust), '192.0.2.3');
  assert.throws(() => trustedProxy('0.0.0.0/0'));
});

void test('missing or malformed ingress chain tails do not select spoofed identity headers', () => {
  const trust = trustedProxy('10.42.0.0/16');
  for (const chain of [
    '',
    'invalid',
    '192.0.2.3,',
    ',127.0.0.1',
    '192.0.2.3, invalid',
  ]) {
    assert.equal(
      clientIp(
        '10.42.1.2',
        new Headers({
          'x-forwarded-for': chain,
          'x-real-ip': '198.51.100.7',
          'cf-connecting-ip': '198.51.100.9',
        }),
        trust,
      ),
      '10.42.1.2',
    );
  }
  assert.equal(
    clientIp('10.42.1.2', new Headers({ 'x-real-ip': '192.0.2.3' }), trust),
    '10.42.1.2',
  );
});

void test('Node serves bundled pages, headers, safe assets, durable contact, aliases and health', async (t) => {
  const directory = await mkdtemp(join(tmpdir(), 'swirl-website-http-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  await mkdir(join(directory, 'assets'));
  await writeFile(join(directory, 'assets', 'style.css'), 'body{color:blue}');
  await writeFile(join(directory, 'private.txt'), 'private');
  await symlink(
    join(directory, 'private.txt'),
    join(directory, 'assets', 'escape.txt'),
  );
  const db = new SqliteContactDatabase(
    join(directory, 'contact.sqlite'),
    'db/migrations',
  );
  t.after(() => db.close());
  const server = createNodeServer({
    handler: createRequestHandler({
      '/': '<h1>Home</h1>',
      '/en/': '<h1>English</h1>',
    }),
    env: { DB: db, ASSETS: assetFetcher(join(directory, 'assets')) },
    origin: 'https://swirlit.dev',
    healthy: () => db.healthy(),
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(
    () =>
      new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
        server.closeAllConnections();
      }),
  );
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  const home = await fetch(base);
  assert.equal(await home.text(), '<h1>Home</h1>');
  assert.equal(home.headers.get('x-frame-options'), 'DENY');
  assert.equal(home.headers.get('cache-control'), 'no-cache, no-transform');
  assert.match(
    home.headers.get('content-security-policy') ?? '',
    /frame-ancestors 'none'/,
  );
  assert.equal(
    (await fetch(base + '/en', { redirect: 'manual' })).headers.get('location'),
    '/en/',
  );
  assert.equal((await fetch(base + '/healthz')).status, 200);
  assert.equal((await fetch(base + '/escape.txt')).status, 404);
  assert.equal((await fetch(base + '/_headers')).status, 404);
  const malformed = await new Promise<{
    status: number;
    frame: string | string[] | undefined;
  }>((resolve, reject) => {
    const req = httpRequest(
      {
        host: '127.0.0.1',
        port: (server.address() as AddressInfo).port,
        path: '/\\evil.test/api/contact',
        method: 'POST',
        headers: { origin: 'https://evil.test' },
      },
      (res) => {
        res.resume();
        resolve({
          status: res.statusCode ?? 0,
          frame: res.headers['x-frame-options'],
        });
      },
    );
    req.on('error', reject);
    req.end();
  });
  assert.equal(malformed.status, 400);
  assert.equal(malformed.frame, 'DENY');
  function requestHost(
    path: string,
    host = 'www.swirlit.dev',
    method = 'GET',
    headers: Record<string, string> = {},
  ) {
    return new Promise<{
      status: number;
      location: string | undefined;
      frame: string | string[] | undefined;
    }>((resolve, reject) => {
      const req = httpRequest(
        {
          host: '127.0.0.1',
          port: (server.address() as AddressInfo).port,
          path,
          method,
          headers: { ...headers, host },
        },
        (res) => {
          res.resume();
          resolve({
            status: res.statusCode ?? 0,
            location: res.headers.location,
            frame: res.headers['x-frame-options'],
          });
        },
      );
      req.on('error', reject);
      req.end(method === 'POST' ? 'unprocessed redirect body' : undefined);
    });
  }
  for (const [path, method] of [
    ['/', 'GET'],
    ['/en/', 'GET'],
    ['/en/project%2Fname/?next=%2Fen%2F&value=/', 'GET'],
    ['/en/?next=//other.test/', 'HEAD'],
    ['/api/contact?next=/', 'POST'],
  ]) {
    const redirect = await requestHost(path, 'WWW.SWIRLIT.DEV:443', method, {
      'x-forwarded-host': 'other.test',
      'x-forwarded-proto': 'http',
    });
    assert.equal(redirect.status, 308);
    assert.equal(redirect.location, 'https://swirlit.dev' + path);
    assert.equal(redirect.frame, 'DENY');
  }
  for (const path of [
    '//other.test/',
    '/\\other.test/',
    'https://other.test/',
  ]) {
    const rejected = await requestHost(path);
    assert.equal(rejected.status, 400);
    assert.equal(rejected.location, undefined);
  }
  for (const host of ['swirlit.dev', 'www.swirlit.dev.other.test']) {
    const canonical = await requestHost('/', host, 'GET', {
      'x-forwarded-host': 'www.swirlit.dev',
    });
    assert.equal(canonical.status, 200);
    assert.equal(canonical.location, undefined);
  }
  const asset = await fetch(base + '/style.css');
  assert.equal(asset.headers.get('content-type'), 'text/css; charset=utf-8');
  assert.equal(await asset.text(), 'body{color:blue}');
  assert.equal(
    (
      await fetch(base + '/style.css', {
        headers: { 'if-none-match': asset.headers.get('etag')! },
      })
    ).status,
    304,
  );
  const data = {
    id: crypto.randomUUID(),
    name: 'Runtime Test',
    email: 'runtime@example.test',
    subject: 'Deployment verification',
    message: 'This is an isolated automated test enquiry.',
    lang: 'en',
    consent: true,
    website: '',
    startedAt: Date.now() - 5000,
  };
  const response = await fetch(base + '/api/contact', {
    method: 'POST',
    headers: {
      origin: 'https://swirlit.dev',
      'content-type': 'application/json',
      'cf-connecting-ip': '192.0.2.99',
    },
    body: JSON.stringify(data),
  });
  assert.equal(response.status, 201);
  assert.equal(
    (
      await db
        .prepare('SELECT id FROM contact_messages')
        .first<{ id: string }>()
    )?.id,
    data.id,
  );
  assert.equal(
    (
      await fetch(base + '/api/contact', {
        method: 'POST',
        headers: {
          origin: 'https://evil.test',
          'content-type': 'application/json',
        },
        body: JSON.stringify(data),
      })
    ).status,
    403,
  );
  assert.ok((await readFile(join(directory, 'contact.sqlite'))).length > 0);
});

void test('a stalled Node request gets the contact body timeout response without a socket reset', async (t) => {
  const server = createNodeServer({
    handler: createRequestHandler(),
    env: { ASSETS: assetFetcher('.') },
    origin: 'https://swirlit.dev',
    healthy: () => true,
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(
    () =>
      new Promise<void>((resolve) => {
        server.close(() => resolve());
        server.closeAllConnections();
      }),
  );
  const status = await new Promise<number>((resolve, reject) => {
    const req = httpRequest(
      {
        host: '127.0.0.1',
        port: (server.address() as AddressInfo).port,
        path: '/api/contact',
        method: 'POST',
        headers: {
          origin: 'https://swirlit.dev',
          'content-type': 'application/json',
          'content-length': 100,
        },
      },
      (res) => {
        res.resume();
        resolve(res.statusCode ?? 0);
      },
    );
    req.on('error', reject);
    req.write('{');
  });
  assert.equal(status, 408);
});
