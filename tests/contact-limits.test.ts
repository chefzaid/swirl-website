import { test } from 'node:test';
import assert from 'node:assert/strict';
import { handleContact } from '../server/contact.ts';
import { database, request, valid } from './contact-fixtures.ts';
void test('rate limits submissions against persisted counters', async () => {
  const { sqlite, DB } = database();
  let last = valid();
  for (let i = 0; i < 5; i++) {
    last = valid();
    assert.equal((await handleContact(request(last), { DB: DB })).status, 201);
  }
  assert.equal((await handleContact(request(last), { DB: DB })).status, 200);
  assert.equal((await handleContact(request(valid()), { DB: DB })).status, 429);
  assert.equal(
    sqlite.prepare('SELECT count(*) AS count FROM contact_messages').get()
      ?.count,
    5,
  );
  sqlite.close();
});
void test('IPv6 aliases and addresses in one /64 share the submission limit', async () => {
  const { sqlite, DB } = database();
  for (let index = 1; index <= 12; index++) {
    const data = { ...valid(), email: `person${index}@example.test` };
    const response = await handleContact(
      request(data, { 'cf-connecting-ip': `2001:db8:1234:5678::${index}` }),
      { DB: DB },
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
    Array.from({ length: 20 }, () => handleContact(request(data), { DB: DB })),
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
      DB: DB,
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
        { DB: DB },
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
            DB: DB,
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
          DB: DB,
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
          DB: DB,
        })
      ).status,
      201,
    );
  } finally {
    Date.now = originalNow;
    sqlite.close();
  }
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
      { DB: DB },
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
        { DB: DB },
      )
    ).status,
    201,
  );
  sqlite.close();
});
void test('a failed database transaction rolls back quota changes and temporary reservations', async () => {
  const { sqlite, DB } = database();
  sqlite.exec(
    "CREATE TRIGGER reject_test_insert BEFORE INSERT ON contact_messages BEGIN SELECT RAISE(ABORT, 'simulated failure'); END",
  );
  assert.equal((await handleContact(request(valid()), { DB: DB })).status, 503);
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
void test('a warm blocked-source cache avoids repeated database work', async () => {
  const { sqlite, DB } = database();
  const data = valid();
  for (let index = 0; index <= 30; index++)
    await handleContact(request(data), { DB: DB });
  const changes = sqlite.prepare('SELECT total_changes() AS n').get()?.n;
  for (let index = 0; index < 10; index++)
    assert.equal((await handleContact(request(data), { DB: DB })).status, 429);
  assert.equal(sqlite.prepare('SELECT total_changes() AS n').get()?.n, changes);
  sqlite.close();
});
