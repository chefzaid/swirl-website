import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, readdirSync } from 'node:fs';
import {
  handleContact,
  notifyExchange,
  validateContact,
  type ContactData,
  BODY_TIMEOUT_MS,
} from '../server/contact.ts';
const valid = (): ContactData => ({
  id: crypto.randomUUID(),
  name: 'Test visitor',
  email: 'visitor@example.test',
  subject: 'Refonte de notre portail client',
  message: 'I would like to discuss a software architecture project.',
  lang: 'en',
  consent: true,
  startedAt: Date.now() - 5000,
  website: '',
});
function database() {
  const sqlite = new DatabaseSync(':memory:');
  for (const file of readdirSync('drizzle').filter((f) => f.endsWith('.sql')))
    sqlite.exec(readFileSync(`drizzle/${file}`, 'utf8'));
  const wrap = (sql: string, bindings: unknown[] = []) => ({
    bind(...values: unknown[]) {
      return wrap(sql, values);
    },
    async first() {
      return sqlite.prepare(sql).get(...(bindings as never[])) || null;
    },
    run() {
      const stmt = sqlite.prepare(sql);
      if (/RETURNING/.test(sql))
        return {
          results: stmt.all(...(bindings as never[])),
          meta: { changes: 1 },
        };
      const r = stmt.run(...(bindings as never[]));
      return { results: [], meta: { changes: Number(r.changes) } };
    },
  });
  return {
    sqlite,
    DB: {
      prepare: wrap,
      async batch(statements: Array<{ run: () => unknown }>) {
        sqlite.exec('BEGIN');
        try {
          const results = statements.map((statement) => statement.run());
          sqlite.exec('COMMIT');
          return results;
        } catch (error) {
          sqlite.exec('ROLLBACK');
          throw error;
        }
      },
    },
  };
}
const request = (data: unknown, headers: Record<string, string> = {}) =>
  new Request('https://portfolio.test/api/contact', {
    method: 'POST',
    headers: {
      Origin: 'https://portfolio.test',
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify(data),
  });
void test('validates required fields, normalises email and rejects invalid types', () => {
  assert.equal(
    validateContact({ ...valid(), email: '  VISITOR@example.test  ' })?.email,
    'visitor@example.test',
  );
  for (const patch of [
    { name: 'x' },
    { email: 'invalid' },
    { message: 'short' },
    { consent: false },
    { subject: '   ' },
    { subject: 'x'.repeat(161) },
    { subject: 'Bad\r\nHeader' },
    { subject: 123 },
    { startedAt: 'yesterday' },
    { id: 'bad-id' },
    { name: 'Bad\r\nHeader' },
    { message: 'x'.repeat(5001) },
  ])
    assert.equal(validateContact({ ...valid(), ...patch }), null);
});
void test('stores an enquiry, keeps notification unconfigured and avoids duplicate records', async () => {
  const { sqlite, DB } = database();
  const data = valid();
  const response = await handleContact(request(data), {
    DB: DB as unknown as D1Database,
  });
  assert.equal(response.status, 201);
  assert.deepEqual(await response.json(), { ok: true, notified: false });
  assert.equal(
    sqlite.prepare('SELECT count(*) AS count FROM contact_messages').get()
      ?.count,
    1,
  );
  const duplicate = await handleContact(request(data), {
    DB: DB as unknown as D1Database,
  });
  assert.equal(duplicate.status, 200);
  assert.equal(
    sqlite.prepare('SELECT count(*) AS count FROM contact_messages').get()
      ?.count,
    1,
  );
  const conflict = await handleContact(
    request({
      ...data,
      message: 'A different message with the same request identifier.',
    }),
    { DB: DB as unknown as D1Database },
  );
  assert.equal(conflict.status, 409);
  sqlite.close();
});
void test('rejects cross-origin, bots, oversized messages, unsafe methods and too-fast submissions', async () => {
  for (const [req, status] of [
    [request(valid(), { Origin: 'https://evil.test' }), 403],
    [request({ ...valid(), website: 'spam' }), 400],
    [request({ ...valid(), startedAt: Date.now() }), 400],
    [request({ ...valid(), message: 'x'.repeat(19000) }), 413],
    [new Request('https://portfolio.test/api/contact'), 405],
  ] as const)
    assert.equal((await handleContact(req, {})).status, status);
});
void test('rate limits submissions against persisted counters', async () => {
  const { sqlite, DB } = database();
  let last = valid();
  for (let i = 0; i < 5; i++) {
    last = valid();
    assert.equal(
      (await handleContact(request(last), { DB: DB as unknown as D1Database }))
        .status,
      201,
    );
  }
  assert.equal(
    (await handleContact(request(last), { DB: DB as unknown as D1Database }))
      .status,
    200,
  );
  assert.equal(
    (await handleContact(request(valid()), { DB: DB as unknown as D1Database }))
      .status,
    429,
  );
  assert.equal(
    sqlite.prepare('SELECT count(*) AS count FROM contact_messages').get()
      ?.count,
    5,
  );
  sqlite.close();
});
void test('fails honestly when storage is unavailable', async () =>
  assert.equal((await handleContact(request(valid()), {})).status, 503));
void test('Exchange adapter uses the fixed recipient, visitor reply-to, and only reports accepted requests', async () => {
  const env = {
    MS_TENANT_ID: 'test-tenant',
    MS_CLIENT_ID: 'test-client',
    MS_CLIENT_SECRET: 'test-secret',
    CONTACT_SENDER: 'sender@example.test',
  };
  const calls: Array<{ url: string; options?: RequestInit }> = [];
  const send = (async (url: string | URL | Request, options?: RequestInit) => {
    calls.push({
      url:
        typeof url === 'string' ? url : url instanceof URL ? url.href : url.url,
      options,
    });
    return calls.length === 1
      ? Response.json({ access_token: 'test-token' })
      : new Response(null, { status: 202 });
  }) as typeof fetch;
  const data = valid();
  assert.equal(await notifyExchange(env, data, send), 'sent');
  assert.equal(calls.length, 2);
  const payload = calls[1].options?.body;
  assert.ok(typeof payload === 'string');
  const body = JSON.parse(payload);
  assert.equal(
    body.message.toRecipients[0].emailAddress.address,
    'contact@swirlit.dev',
  );
  assert.equal(body.message.replyTo[0].emailAddress.address, data.email);
  assert.equal(
    body.message.subject,
    `Swirl IT — ${data.subject} — ${data.name}`,
  );
  assert.equal(await notifyExchange({}, data, send), 'unconfigured');
  assert.equal(
    await notifyExchange(
      env,
      data,
      (async () => new Response(null, { status: 401 })) as typeof fetch,
    ),
    'failed',
  );
});

void test('accepts arbitrary subjects, stores their exact text and rejects conflicting retries', async () => {
  const { sqlite, DB } = database();
  const subject = "L’évolution d’O'Brien — audit, web & cloud";
  const data = { ...valid(), subject: `  ${subject}  ` };
  assert.equal(validateContact(data)?.subject, subject);
  assert.equal(
    (await handleContact(request(data), { DB: DB as unknown as D1Database }))
      .status,
    201,
  );
  assert.equal(
    sqlite
      .prepare('SELECT service FROM contact_messages WHERE id = ?')
      .get(data.id)?.service,
    subject,
  );
  assert.equal(
    (
      await handleContact(request({ ...data, subject }), {
        DB: DB as unknown as D1Database,
      })
    ).status,
    200,
  );
  assert.equal(
    (
      await handleContact(request({ ...data, subject: 'Un autre sujet' }), {
        DB: DB as unknown as D1Database,
      })
    ).status,
    409,
  );
  const { subject: _subject, ...previousForm } = valid();
  assert.equal(
    validateContact({ ...previousForm, service: 'architecture' })?.subject,
    'architecture',
  );
  sqlite.close();
});

void test('rejects control characters in email addresses before storage', async () => {
  for (const control of ['\u0000', '\u0001', '\u007f', '\r\n']) {
    const data = { ...valid(), email: `user${control}@example.test` };
    assert.equal(validateContact(data), null);
    assert.equal((await handleContact(request(data), {})).status, 400);
  }
});

void test('IPv6 aliases and addresses in one /64 share the submission limit', async () => {
  const { sqlite, DB } = database();
  for (let index = 1; index <= 12; index++) {
    const data = { ...valid(), email: `person${index}@example.test` };
    const response = await handleContact(
      request(data, { 'cf-connecting-ip': `2001:db8:1234:5678::${index}` }),
      { DB: DB as unknown as D1Database },
    );
    assert.equal(response.status, index <= 5 ? 201 : 429);
    if (response.status === 429)
      assert.ok(Number(response.headers.get('Retry-After')) > 0);
  }
  assert.equal(
    sqlite.prepare('SELECT count(*) AS n FROM contact_messages').get()?.n,
    5,
  );
  sqlite.close();
});

void test('concurrent identical retries store and charge one enquiry', async () => {
  const { sqlite, DB } = database();
  const data = valid();
  const responses = await Promise.all(
    Array.from({ length: 20 }, () =>
      handleContact(request(data), { DB: DB as unknown as D1Database }),
    ),
  );
  assert.equal(
    responses.filter((response) => response.status === 201).length,
    1,
  );
  assert.equal(
    responses.filter((response) => response.status === 200).length,
    19,
  );
  const counters = sqlite
    .prepare(
      "SELECT count FROM contact_rate_limits WHERE key LIKE 'v2:submission:%'",
    )
    .all();
  assert.equal(counters.length, 4);
  assert.ok(counters.every((counter) => counter.count === 1));
  sqlite.close();
});

void test('request ceiling bounds replay attempts without duplicating messages', async () => {
  const { sqlite, DB } = database();
  const data = valid();
  for (let index = 0; index < 35; index++) {
    const response = await handleContact(request(data), {
      DB: DB as unknown as D1Database,
    });
    assert.equal(response.status, index === 0 ? 201 : index < 30 ? 200 : 429);
  }
  assert.equal(
    sqlite.prepare('SELECT count(*) AS n FROM contact_messages').get()?.n,
    1,
  );
  sqlite.close();
});

void test('global quota caps concurrent distributed submissions with changing IPs and emails', async () => {
  const { sqlite, DB } = database();
  const responses = await Promise.all(
    Array.from({ length: 45 }, (_, index) =>
      handleContact(
        request(
          { ...valid(), email: `person${index}@example.test` },
          { 'cf-connecting-ip': `192.0.2.${index + 1}` },
        ),
        { DB: DB as unknown as D1Database },
      ),
    ),
  );
  assert.equal(
    responses.filter((response) => response.status === 201).length,
    30,
  );
  assert.equal(
    responses.filter((response) => response.status === 429).length,
    15,
  );
  assert.equal(
    sqlite.prepare('SELECT count(*) AS n FROM contact_messages').get()?.n,
    30,
  );
  sqlite.close();
});

void test('quota windows do not reset at the clock-hour boundary or extend on rejection', async () => {
  const { sqlite, DB } = database();
  const originalNow = Date.now;
  let now = Date.UTC(2026, 8, 6, 10, 59, 50);
  Date.now = () => now;
  try {
    for (let index = 0; index < 5; index++)
      assert.equal(
        (
          await handleContact(request(valid()), {
            DB: DB as unknown as D1Database,
          })
        ).status,
        201,
      );
    const expiry = sqlite
      .prepare(
        "SELECT expires_at FROM contact_rate_limits WHERE key LIKE 'v2:submission:ip:%'",
      )
      .get()?.expires_at;
    now += 20_000;
    assert.equal(
      (
        await handleContact(request(valid()), {
          DB: DB as unknown as D1Database,
        })
      ).status,
      429,
    );
    assert.equal(
      sqlite
        .prepare(
          "SELECT expires_at FROM contact_rate_limits WHERE key LIKE 'v2:submission:ip:%'",
        )
        .get()?.expires_at,
      expiry,
    );
    now += 3_600_000;
    assert.equal(
      (
        await handleContact(request(valid()), {
          DB: DB as unknown as D1Database,
        })
      ).status,
      201,
    );
  } finally {
    Date.now = originalNow;
    sqlite.close();
  }
});

void test('SQL and HTML payloads remain literal data and are never reflected in API responses', async () => {
  const { sqlite, DB } = database();
  const data = {
    ...valid(),
    subject: "<img src=x onerror=alert(1)>'); DROP TABLE contact_messages;--",
  };
  const response = await handleContact(request(data), {
    DB: DB as unknown as D1Database,
  });
  assert.equal(response.status, 201);
  assert.deepEqual(await response.json(), { ok: true, notified: false });
  assert.equal(
    sqlite
      .prepare('SELECT service FROM contact_messages WHERE id = ?')
      .get(data.id)?.service,
    data.subject,
  );
  sqlite.close();
});

void test('stream byte limits reject chunked bodies even when cancellation stalls', async () => {
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(new Uint8Array(18_001));
    },
    cancel() {
      return new Promise(() => {});
    },
  });
  const req = new Request('https://portfolio.test/api/contact', {
    method: 'POST',
    headers: {
      Origin: 'https://portfolio.test',
      'Content-Type': 'application/json',
    },
    body: stream,
    duplex: 'half',
  } as RequestInit);
  assert.equal((await handleContact(req, {})).status, 413);
});

void test('unfinished request bodies time out instead of keeping the handler pending', async () => {
  const start = Date.now();
  const stream = new ReadableStream({
    cancel() {
      return new Promise(() => {});
    },
  });
  const req = new Request('https://portfolio.test/api/contact', {
    method: 'POST',
    headers: {
      Origin: 'https://portfolio.test',
      'Content-Type': 'application/json',
    },
    body: stream,
    duplex: 'half',
  } as RequestInit);
  assert.equal((await handleContact(req, {})).status, 408);
  assert.ok(Date.now() - start < BODY_TIMEOUT_MS + 2000);
});

void test('a full daily quota cannot consume hourly or personal allowances', async () => {
  const { sqlite, DB } = database();
  const now = Date.now();
  sqlite
    .prepare(
      'INSERT INTO contact_rate_limits (key,count,expires_at) VALUES (?,100,?)',
    )
    .run('v2:submission:global:day', now + 86_400_000);
  for (let index = 0; index < 35; index++) {
    const response = await handleContact(
      request(
        { ...valid(), email: `person${index}@example.test` },
        { 'cf-connecting-ip': `198.51.100.${index + 1}` },
      ),
      { DB: DB as unknown as D1Database },
    );
    assert.equal(response.status, 429);
    assert.ok(Number(response.headers.get('Retry-After')) >= 86_399);
  }
  assert.equal(
    sqlite
      .prepare(
        "SELECT count(*) AS n FROM contact_rate_limits WHERE key LIKE 'v2:submission:%'",
      )
      .get()?.n,
    1,
  );
  assert.equal(
    sqlite
      .prepare(
        "SELECT count(*) AS n FROM contact_rate_limits WHERE key LIKE 'v2:reservation:%'",
      )
      .get()?.n,
    0,
  );
  sqlite
    .prepare(
      "UPDATE contact_rate_limits SET expires_at = ? WHERE key = 'v2:submission:global:day'",
    )
    .run(now - 1);
  assert.equal(
    (
      await handleContact(
        request(valid(), { 'cf-connecting-ip': '203.0.113.1' }),
        { DB: DB as unknown as D1Database },
      )
    ).status,
    201,
  );
  sqlite.close();
});

void test('a failed D1 transaction rolls back quota changes and temporary reservations', async () => {
  const { sqlite, DB } = database();
  sqlite.exec(
    "CREATE TRIGGER reject_test_insert BEFORE INSERT ON contact_messages BEGIN SELECT RAISE(ABORT, 'simulated failure'); END",
  );
  assert.equal(
    (await handleContact(request(valid()), { DB: DB as unknown as D1Database }))
      .status,
    503,
  );
  assert.equal(
    sqlite
      .prepare(
        "SELECT count(*) AS n FROM contact_rate_limits WHERE key LIKE 'v2:submission:%' OR key LIKE 'v2:reservation:%'",
      )
      .get()?.n,
    0,
  );
  assert.equal(
    sqlite.prepare('SELECT count(*) AS n FROM contact_messages').get()?.n,
    0,
  );
  sqlite.close();
});

void test('a warm blocked-source cache avoids repeated D1 work', async () => {
  const { sqlite, DB } = database();
  const data = valid();
  for (let index = 0; index <= 30; index++)
    await handleContact(request(data), { DB: DB as unknown as D1Database });
  const changes = sqlite.prepare('SELECT total_changes() AS n').get()?.n;
  for (let index = 0; index < 10; index++)
    assert.equal(
      (await handleContact(request(data), { DB: DB as unknown as D1Database }))
        .status,
      429,
    );
  assert.equal(sqlite.prepare('SELECT total_changes() AS n').get()?.n, changes);
  sqlite.close();
});
