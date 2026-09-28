import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { once } from 'node:events';
import type { AddressInfo } from 'node:net';
import {
  PostgresContactDatabase,
  initializePostgres,
} from '../runtime/postgres.ts';
import { SqliteContactDatabase } from '../runtime/sqlite.ts';
import { importSqliteSnapshot } from '../runtime/migrate-postgres.ts';
import { NotificationDispatcher } from '../runtime/notifications.ts';
import { insertWithinLimits } from '../server/contact-limits.ts';
import { handleContact, type ContactData } from '../server/contact.ts';
import { createNodeServer } from '../runtime/server.ts';

const url = process.env.SWIRL_WEBSITE_PG_TEST_URL;
if (
  !url ||
  !['127.0.0.1', 'localhost'].includes(new URL(url).hostname) ||
  new URL(url).pathname !== '/swirl_website_ha_test'
)
  throw new Error(
    'Use the disposable local swirl_website_ha_test database via infra/scripts/test-postgres.sh',
  );
const fixture = (): ContactData => ({
  id: crypto.randomUUID(),
  name: 'Test visitor',
  email: 'visitor@example.test',
  subject: 'Architecture',
  message: 'I would like to discuss a software architecture project.',
  lang: 'en',
  consent: true,
  startedAt: Date.now() - 5000,
  website: '',
});

void test('PostgreSQL shared storage, delivery ownership and snapshot migration', async (t) => {
  const db = new PostgresContactDatabase(url);
  const other = new PostgresContactDatabase(url);
  t.after(async () => {
    await db.close();
    await other.close();
  });
  assert.equal(await db.healthy(), false);
  await Promise.all([initializePostgres(db), initializePostgres(other)]);
  assert.equal(await db.healthy(), true);
  const reset = () =>
    db.sql.unsafe(
      'TRUNCATE contact_notification_queue,contact_messages,contact_rate_limits,swirl_website_imports',
    );

  await t.test(
    'concurrent independent replicas respect a shared global quota',
    async () => {
      const now = Date.now();
      const results = await Promise.all(
        Array.from({ length: 40 }, (_, index) =>
          insertWithinLimits(
            index % 2 ? db : other,
            fixture(),
            { ip: String(index), email: String(index) },
            now,
          ),
        ),
      );
      assert.equal(results.filter(Boolean).length, 30);
      assert.equal(
        (await db.sql.unsafe('SELECT count(*) AS n FROM contact_messages'))[0]
          .n,
        30,
      );
      assert.equal(
        (
          await db.sql.unsafe(
            "SELECT count(*) AS n FROM contact_rate_limits WHERE key LIKE 'v2:reservation:%'",
          )
        )[0].n,
        0,
      );
    },
  );
  await reset();
  await t.test(
    'identical retries store, charge and send once across two adapters',
    async () => {
      let sent = 0;
      const env = {
        RESEND_API_KEY: 'fixture',
        CONTACT_SENDER: 'noreply@example.test',
      };
      const send: typeof fetch = async (_url, init) => {
        sent++;
        assert.equal(
          new Headers(init?.headers).get('Idempotency-Key'),
          `contact/${data.id}`,
        );
        return Response.json({ id: 'accepted' });
      };
      const data = fixture();
      const first = new NotificationDispatcher(db, env, send);
      const second = new NotificationDispatcher(other, env, send);
      db.deliverNotification = (id) => first.deliver(id);
      other.deliverNotification = (id) => second.deliver(id);
      const request = () =>
        new Request('https://example.test/api/contact', {
          method: 'POST',
          headers: {
            Origin: 'https://example.test',
            'Content-Type': 'application/json',
            'cf-connecting-ip': '192.0.2.1',
          },
          body: JSON.stringify(data),
        });
      const responses = await Promise.all(
        Array.from({ length: 12 }, (_, index) =>
          handleContact(request(), { ...env, DB: index % 2 ? db : other }),
        ),
      );
      assert.equal(
        responses.filter((response) => response.status === 201).length,
        1,
      );
      assert.ok(
        responses.every((response) => [200, 201].includes(response.status)),
      );
      assert.equal(sent, 1);
      assert.equal(
        (
          await db.sql.unsafe(
            'SELECT notification_status FROM contact_messages',
          )
        )[0].notification_status,
        'sent',
      );
      assert.equal(
        (
          await db.sql.unsafe(
            "SELECT count FROM contact_rate_limits WHERE key = 'v2:submission:global:hour'",
          )
        )[0].count,
        1,
      );
    },
  );
  await reset();
  await t.test(
    'failed transactions leave neither contact nor quota nor queue',
    async () => {
      await assert.rejects(
        db.batch([
          db
            .prepare('INSERT INTO contact_rate_limits VALUES (?,1,2)')
            .bind('rollback'),
          db.prepare('INSERT INTO missing_table VALUES (1)'),
        ]),
      );
      assert.equal(
        (
          await db.sql.unsafe('SELECT count(*) AS n FROM contact_rate_limits')
        )[0].n,
        0,
      );
    },
  );
  await t.test(
    'expired Resend owners are fenced; Graph and exhausted retries require review',
    async () => {
      const now = Date.now();
      const dispatcher = new NotificationDispatcher(db, {
        RESEND_API_KEY: 'fixture',
        MS_TENANT_ID: 'fixture',
        MS_CLIENT_ID: 'fixture',
        MS_CLIENT_SECRET: 'fixture',
      });
      const row = fixture();
      await insertWithinLimits(db, row, { ip: 'lease', email: 'lease' }, now, {
        provider: 'resend',
        sender: 'original@example.test',
      });
      const old = await dispatcher.claim(row.id, now);
      assert.ok(old);
      const competing = await new NotificationDispatcher(other, {
        RESEND_API_KEY: 'fixture',
      }).claim(row.id, now);
      assert.equal(competing, null);
      const recovered = await dispatcher.claim(row.id, now + 120001);
      assert.ok(recovered);
      assert.notEqual(recovered.locked_by, old.locked_by);
      assert.equal(await dispatcher.complete(old, true, now + 120002), false);
      assert.equal(
        await dispatcher.complete(recovered, true, now + 120002),
        true,
      );
      const graph = fixture();
      await insertWithinLimits(
        db,
        graph,
        { ip: 'graph', email: 'graph' },
        now,
        { provider: 'graph', sender: 'original@example.test' },
      );
      assert.ok(await dispatcher.claim(graph.id, now));
      assert.equal(await dispatcher.claim(graph.id, now + 120001), null);
      assert.equal(
        (
          await db.sql.unsafe(
            'SELECT notification_status FROM contact_messages WHERE id = $1',
            [graph.id],
          )
        )[0].notification_status,
        'manual',
      );
      const late = fixture();
      await insertWithinLimits(db, late, { ip: 'late', email: 'late' }, now, {
        provider: 'resend',
        sender: 'original@example.test',
      });
      const attempt = await dispatcher.claim(late.id, now);
      assert.ok(attempt);
      await dispatcher.complete(attempt, false, now + 1);
      assert.equal(await dispatcher.claim(late.id, now + 21 * 3600000), null);
      assert.equal(
        (
          await db.sql.unsafe(
            'SELECT notification_status FROM contact_messages WHERE id = $1',
            [late.id],
          )
        )[0].notification_status,
        'manual',
      );
    },
  );
  await reset();
  await t.test(
    'snapshot imports preserve statuses and quotas, are repeatable, and reject conflicts atomically',
    async () => {
      const directory = await mkdtemp(
        join(tmpdir(), 'swirl-website-pg-import-'),
      );
      try {
        const path = join(directory, 'contact.sqlite');
        const sqlite = new SqliteContactDatabase(path, 'db/migrations');
        const row = fixture();
        await insertWithinLimits(
          sqlite,
          row,
          { ip: 'snapshot', email: 'snapshot' },
          Date.now(),
        );
        sqlite.sqlite
          .prepare("UPDATE contact_messages SET notification_status = 'failed'")
          .run();
        sqlite.close();
        const result = await importSqliteSnapshot(db, path);
        assert.deepEqual(result, { imported: true, contacts: 1, counters: 4 });
        assert.equal((await importSqliteSnapshot(db, path)).imported, false);
        assert.equal(
          (
            await db.sql.unsafe(
              'SELECT notification_status FROM contact_messages',
            )
          )[0].notification_status,
          'failed',
        );
        assert.equal(
          (
            await db.sql.unsafe(
              'SELECT count(*) AS n FROM contact_notification_queue',
            )
          )[0].n,
          0,
        );
        await db.sql.unsafe('DELETE FROM swirl_website_imports');
        await db.sql.unsafe(
          "UPDATE contact_messages SET message = 'existing newer enquiry'",
        );
        await assert.rejects(importSqliteSnapshot(db, path), /conflicts/);
        assert.equal(
          (
            await db.sql.unsafe(
              'SELECT count(*) AS n FROM swirl_website_imports',
            )
          )[0].n,
          0,
        );
      } finally {
        await rm(directory, { recursive: true, force: true });
      }
    },
  );
  await t.test(
    'database failure withdraws readiness without failing process liveness',
    async () => {
      const server = createNodeServer({
        handler: { fetch: async () => new Response('page') },
        env: {
          ASSETS: { fetch: async () => new Response(null, { status: 404 }) },
        },
        origin: 'https://example.test',
        healthy: () => db.healthy(),
      });
      server.listen(0, '127.0.0.1');
      await once(server, 'listening');
      try {
        const address = server.address() as AddressInfo;
        const origin = `http://127.0.0.1:${address.port}`;
        assert.equal((await fetch(`${origin}/healthz`)).status, 200);
        await db.sql.unsafe('DROP TABLE swirl_website_schema');
        assert.equal((await fetch(`${origin}/healthz`)).status, 503);
        assert.equal((await fetch(`${origin}/livez`)).status, 200);
      } finally {
        server.closeAllConnections();
        await new Promise<void>((resolve) => server.close(() => resolve()));
      }
    },
  );
});
