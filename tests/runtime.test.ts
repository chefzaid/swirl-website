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
import { createWorker } from '../server/worker.ts';

void test('SQLite survives reopening, migrates once, and rolls a failed batch back', async (t) => {
  const directory = await mkdtemp(join(tmpdir(), 'website-db-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const file = join(directory, 'contact.sqlite');
  let db = new SqliteContactDatabase(file, 'drizzle');
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
  db = new SqliteContactDatabase(file, 'drizzle');
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
    (await db.prepare('PRAGMA journal_mode').first<{ journal_mode: string }>())
      ?.journal_mode,
    'wal',
  );
});

void test('an applied migration cannot silently change', async (t) => {
  const directory = await mkdtemp(join(tmpdir(), 'website-migrations-'));
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

void test('proxy trust uses the socket and ingress X-Real-IP, excluding spoofed forwarding headers', () => {
  const trust = trustedProxy('10.42.0.0/16');
  const headers = new Headers({
    'x-real-ip': '192.0.2.3',
    'cf-connecting-ip': '198.51.100.9',
    'x-forwarded-for': '198.51.100.8',
  });
  assert.equal(clientIp('10.42.1.2', headers, trust), '192.0.2.3');
  assert.equal(clientIp('::ffff:10.42.1.2', headers, trust), '192.0.2.3');
  assert.equal(clientIp('203.0.113.1', headers, trust), '203.0.113.1');
  assert.equal(
    clientIp(
      '10.42.1.2',
      new Headers({ 'x-real-ip': '192.0.2.3, 192.0.2.4' }),
      trust,
    ),
    '10.42.1.2',
  );
  assert.throws(() => trustedProxy('0.0.0.0/0'));
});

void test('Node serves bundled pages, headers, safe assets, durable contact, aliases and health', async (t) => {
  const directory = await mkdtemp(join(tmpdir(), 'website-http-'));
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
    'drizzle',
  );
  t.after(() => db.close());
  const server = createNodeServer({
    worker: createWorker({ '/': '<h1>Home</h1>', '/en/': '<h1>English</h1>' }),
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
    worker: createWorker(),
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
