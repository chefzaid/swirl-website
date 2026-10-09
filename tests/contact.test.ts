import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  handleContact,
  validateContact,
  BODY_TIMEOUT_MS,
} from '../server/contact.ts';
import { database, request, valid } from './contact-fixtures.ts';
void test('validates required fields, normalises email and rejects invalid types', () => {
  assert.equal(
    validateContact({ ...valid(), email: '  VISITOR@example.test  ' })?.email,
    'visitor@example.test',
  );
  for (const patch of [
    { name: 'x' },
    { email: 'invalid' },
    { email: 'visitor@@example.test' },
    { email: '@example.test' },
    { email: 'visitor@.test' },
    { email: 'visitor@example.' },
    { email: 'visitor@example' },
    { email: 'visitor@exam ple.test' },
    { email: 'visitor@' + '.'.repeat(240) },
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
    DB: DB,
  });
  assert.equal(response.status, 201);
  assert.deepEqual(await response.json(), { ok: true, notified: false });
  assert.equal(
    sqlite.prepare('SELECT count(*) AS count FROM contact_messages').get()
      ?.count,
    1,
  );
  const duplicate = await handleContact(request(data), {
    DB: DB,
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
    { DB: DB },
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
void test('fails honestly when storage is unavailable', async () =>
  assert.equal((await handleContact(request(valid()), {})).status, 503));
void test('accepts arbitrary subjects, stores their exact text and rejects conflicting retries', async () => {
  const { sqlite, DB } = database();
  const subject = "L’évolution d’O'Brien — audit, web & cloud";
  const data = { ...valid(), subject: `  ${subject}  ` };
  assert.equal(validateContact(data)?.subject, subject);
  assert.equal((await handleContact(request(data), { DB: DB })).status, 201);
  assert.equal(
    sqlite
      .prepare('SELECT service FROM contact_messages WHERE id = ?')
      .get(data.id)?.service,
    subject,
  );
  assert.equal(
    (
      await handleContact(request({ ...data, subject }), {
        DB: DB,
      })
    ).status,
    200,
  );
  assert.equal(
    (
      await handleContact(request({ ...data, subject: 'Un autre sujet' }), {
        DB: DB,
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
void test('SQL and HTML payloads remain literal data and are never reflected in API responses', async () => {
  const { sqlite, DB } = database();
  const data = {
    ...valid(),
    subject: "<img src=x onerror=alert(1)>'); DROP TABLE contact_messages;--",
  };
  const response = await handleContact(request(data), {
    DB: DB,
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
