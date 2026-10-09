import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { SqliteContactDatabase } from '../runtime/sqlite.ts';
import { CrmDispatcher } from '../runtime/crm.ts';
import { submitLead } from '../server/odoo.ts';
import { handleContact, type ContactData } from '../server/contact.ts';

const odoo = {
  ODOO_URL: 'http://odoo.test:8069',
  ODOO_DATABASE: 'odoo',
  ODOO_API_KEY: 'k'.repeat(40),
};
const inquiry = {
  id: '11111111-1111-4111-8111-111111111111',
  company: '',
  name: 'Ada Lovelace',
  email: 'ada@example.test',
  subject: 'Audit NIS2',
  message: 'Nous voulons auditer notre conformité NIS2.',
  lang: 'fr',
};
const reply = (status: number, body: unknown = {}) =>
  (async () => Response.json(body, { status })) as unknown as typeof fetch;

void test('a lead request carries a stable reference and only the intake fields', async () => {
  let call: { url: string; init: RequestInit } | undefined;
  const send = (async (url: URL, init: RequestInit) => {
    call = { url: String(url), init };
    return Response.json({ id: 42, created: true });
  }) as unknown as typeof fetch;
  assert.deepEqual(await submitLead(odoo, inquiry, send), {
    status: 'sent',
    leadId: 42,
  });
  assert.equal(
    call?.url,
    'http://odoo.test:8069/json/2/crm.lead/platform_intake_submit',
  );
  assert.equal(call?.init.redirect, 'error');
  const headers = call?.init.headers as Record<string, string>;
  assert.equal(headers.Authorization, `bearer ${odoo.ODOO_API_KEY}`);
  assert.equal(headers['X-Odoo-Database'], 'odoo');
  assert.deepEqual(JSON.parse(call?.init.body as string), {
    reference: `contact:${inquiry.id}`,
    values: {
      name: 'Audit NIS2',
      contact_name: 'Ada Lovelace',
      email_from: 'ada@example.test',
      description: inquiry.message,
      lang: 'fr_FR',
    },
  });
});

void test('credential and contract errors stop; outages and odd replies are retried', async () => {
  for (const status of [401, 403, 422])
    assert.deepEqual(await submitLead(odoo, inquiry, reply(status)), {
      status: 'rejected',
      error: `http_${status}`,
    });
  for (const status of [404, 409, 500, 503])
    assert.equal(
      (await submitLead(odoo, inquiry, reply(status))).status,
      'retry',
    );
  for (const body of [{}, { id: 0 }, { id: '7' }, null])
    assert.deepEqual(await submitLead(odoo, inquiry, reply(200, body)), {
      status: 'retry',
      error: 'invalid_response',
    });
  const offline = (async () => {
    throw new TypeError('fetch failed');
  }) as unknown as typeof fetch;
  assert.deepEqual(await submitLead(odoo, inquiry, offline), {
    status: 'retry',
    error: 'network',
  });
  assert.equal(
    (await submitLead({}, inquiry, reply(200, { id: 1 }))).status,
    'retry',
  );
});

function stored() {
  const DB = new SqliteContactDatabase(':memory:', 'db/migrations');
  const contact: ContactData = {
    id: crypto.randomUUID(),
    topic: 'project',
    company: '',
    name: 'Test visitor',
    email: 'visitor@example.test',
    subject: 'Private cloud',
    message: 'We would like to discuss a private cloud installation.',
    lang: 'en',
    consent: true,
    startedAt: Date.now() - 5000,
    website: '',
  };
  return { DB, contact };
}
const post = (contact: ContactData) =>
  new Request('https://portfolio.test/api/contact', {
    method: 'POST',
    headers: {
      Origin: 'https://portfolio.test',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(contact),
  });
const queue = (DB: SqliteContactDatabase, id: string) =>
  DB.sqlite
    .prepare('SELECT * FROM contact_crm_queue WHERE contact_id = ?')
    .get(id);

void test('a stored inquiry is queued in the same transaction and delivered once', async () => {
  const { DB, contact } = stored();
  const requests: string[] = [];
  const send = (async (_url: URL, init: RequestInit) => {
    requests.push(JSON.parse(init.body as string).reference);
    return Response.json({ id: 7, created: requests.length === 1 });
  }) as unknown as typeof fetch;
  const crm = new CrmDispatcher(DB, odoo, send);
  const response = await handleContact(post(contact), { DB, CRM: crm });
  assert.equal(response.status, 201);
  // Delivery runs after the response; wait for it to settle.
  for (let i = 0; i < 50 && queue(DB, contact.id)?.status !== 'sent'; i++)
    await new Promise((resolve) => setTimeout(resolve, 10));
  assert.equal(queue(DB, contact.id)?.status, 'sent');
  assert.equal(queue(DB, contact.id)?.lead_id, 7);
  assert.equal(await crm.deliver(contact.id), false, 'nothing left to deliver');
  assert.deepEqual(requests, [`contact:${contact.id}`]);
});

void test('Odoo outages back off and keep the inquiry; rejected keys stop for review', async () => {
  const { DB, contact } = stored();
  await handleContact(post(contact), { DB });
  assert.equal(queue(DB, contact.id)?.status, 'queued');
  const before = Date.now();
  assert.equal(await new CrmDispatcher(DB, odoo, reply(503)).deliver(), false);
  const waiting = queue(DB, contact.id);
  assert.equal(waiting?.status, 'queued');
  assert.equal(waiting?.attempts, 1);
  assert.equal(waiting?.last_error, 'http_503');
  assert.ok(Number(waiting?.run_at) >= before + 60_000, 'second attempt waits');
  assert.equal(
    await new CrmDispatcher(DB, odoo, reply(200, { id: 1 })).deliver(),
    false,
    'not due yet',
  );
  DB.sqlite.prepare('UPDATE contact_crm_queue SET run_at = 0').run();
  assert.equal(await new CrmDispatcher(DB, odoo, reply(401)).deliver(), false);
  assert.equal(queue(DB, contact.id)?.status, 'manual');
  assert.equal(queue(DB, contact.id)?.last_error, 'http_401');
  assert.ok(
    DB.sqlite
      .prepare('SELECT 1 FROM contact_messages WHERE id = ?')
      .get(contact.id),
  );
});

void test('a claimed inquiry is not delivered twice at the same time', async () => {
  const { DB, contact } = stored();
  await handleContact(post(contact), { DB });
  const crm = new CrmDispatcher(DB, odoo, reply(200, { id: 3 }));
  const claims = await Promise.all([crm.claim(), crm.claim(), crm.claim()]);
  assert.equal(claims.filter(Boolean).length, 1);
});

void test('the outbox migration queues inquiries stored before it existed', async (t) => {
  const directory = await mkdtemp(join(tmpdir(), 'swirl-website-crm-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const migrations = join(directory, 'migrations');
  await mkdir(migrations);
  const first = '0000_abnormal_king_bedlam.sql';
  await writeFile(
    join(migrations, first),
    await readFile(join('db/migrations', first)),
  );
  const file = join(directory, 'contact.sqlite');
  const old = new SqliteContactDatabase(file, migrations);
  old.sqlite
    .prepare(
      "INSERT INTO contact_messages (id,name,email,service,message,lang,created_at) VALUES ('old-1','A','a@example.test','S','A long enough message.','fr',123)",
    )
    .run();
  old.close();
  const outbox = '0001_odoo_crm_outbox.sql';
  await writeFile(
    join(migrations, outbox),
    await readFile(join('db/migrations', outbox)),
  );
  const upgraded = new SqliteContactDatabase(file, migrations);
  t.after(() => upgraded.close());
  assert.deepEqual(
    {
      ...upgraded.sqlite
        .prepare('SELECT contact_id,status,run_at FROM contact_crm_queue')
        .get(),
    },
    { contact_id: 'old-1', status: 'queued', run_at: 123 },
  );
});
