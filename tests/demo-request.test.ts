import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { SqliteContactDatabase } from '../runtime/sqlite.ts';
import { CrmDispatcher } from '../runtime/crm.ts';
import {
  handleContact,
  notifyResend,
  validateContact,
} from '../server/contact.ts';
import { database, request, valid } from './contact-fixtures.ts';

// A Swirl Cloud demo request as the form sends it: no subject, a company.
const demo = () => {
  const { subject: _subject, ...form } = valid();
  return { ...form, topic: 'demo', company: '  Acme Industrie  ' };
};

void test('a demo request needs a company and is named after it', () => {
  const data = validateContact(demo());
  assert.equal(data?.topic, 'demo');
  assert.equal(data?.company, 'Acme Industrie');
  assert.equal(data?.subject, 'Démo Swirl Cloud — Acme Industrie');
  assert.equal(
    validateContact({ ...demo(), subject: 'Ignored' })?.subject,
    'Démo Swirl Cloud — Acme Industrie',
  );
  for (const patch of [
    { company: undefined },
    { company: ' A ' },
    { company: 'x'.repeat(141) },
    { company: 'Acme\r\nBcc: x' },
    { company: 42 },
    { topic: 'quote' },
  ])
    assert.equal(validateContact({ ...demo(), ...patch }), null);
  const longest = validateContact({ ...demo(), company: 'x'.repeat(140) });
  assert.equal(longest?.subject.length, 159);
});

void test('demo requests are stored with their topic and company, and retries must match', async () => {
  const { sqlite, DB } = database();
  const form = demo();
  assert.equal((await handleContact(request(form), { DB })).status, 201);
  assert.deepEqual(
    {
      ...sqlite
        .prepare(
          'SELECT topic,company,service FROM contact_messages WHERE id = ?',
        )
        .get(form.id),
    },
    {
      topic: 'demo',
      company: 'Acme Industrie',
      service: 'Démo Swirl Cloud — Acme Industrie',
    },
  );
  assert.equal((await handleContact(request(form), { DB })).status, 200);
  for (const changed of [
    { ...form, company: 'Another company' },
    { ...form, topic: 'project', subject: 'Démo Swirl Cloud — Acme Industrie' },
  ])
    assert.equal((await handleContact(request(changed), { DB })).status, 409);
  const project = valid();
  assert.equal((await handleContact(request(project), { DB })).status, 201);
  assert.deepEqual(
    {
      ...sqlite
        .prepare('SELECT topic,company FROM contact_messages WHERE id = ?')
        .get(project.id),
    },
    { topic: 'project', company: null },
  );
  sqlite.close();
});

void test('the notification email names the company of a demo request', async () => {
  const data = validateContact(demo())!;
  let text = '';
  const send = (async (_url: string, init: RequestInit) => {
    text = JSON.parse(init.body as string).text;
    return Response.json({ id: 'provider-message-id' });
  }) as unknown as typeof fetch;
  const env = { RESEND_API_KEY: 'key', CONTACT_SENDER: 'noreply@swirlit.dev' };
  assert.equal(await notifyResend(env, data, send), 'sent');
  assert.equal(
    text,
    `Nom : ${data.name}\nE-mail : ${data.email}\nEntreprise : Acme Industrie\nSujet : Démo Swirl Cloud — Acme Industrie\n\n${data.message}\n\nRéférence : ${data.id}`,
  );
});

void test('a demo request becomes an Odoo lead with the company as partner', async () => {
  const { sqlite, DB } = database();
  const form = demo();
  let values: Record<string, string> = {};
  const send = (async (_url: URL, init: RequestInit) => {
    values = JSON.parse(init.body as string).values;
    return Response.json({ id: 9, created: true });
  }) as unknown as typeof fetch;
  const crm = new CrmDispatcher(
    DB,
    { ODOO_URL: 'http://odoo.test:8069', ODOO_API_KEY: 'k'.repeat(40) },
    send,
  );
  assert.equal((await handleContact(request(form), { DB })).status, 201);
  assert.equal(await crm.deliver(form.id), true);
  assert.deepEqual(values, {
    name: 'Démo Swirl Cloud — Acme Industrie',
    contact_name: form.name,
    partner_name: 'Acme Industrie',
    email_from: form.email,
    description: form.message,
    lang: 'en_US',
  });
  sqlite.close();
});

void test('the topic migration keeps earlier inquiries as projects', async (t) => {
  const directory = await mkdtemp(join(tmpdir(), 'swirl-website-topic-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const migrations = join(directory, 'migrations');
  await mkdir(migrations);
  const copy = async (name: string) =>
    writeFile(
      join(migrations, name),
      await readFile(join('db/migrations', name)),
    );
  await copy('0000_abnormal_king_bedlam.sql');
  await copy('0001_odoo_crm_outbox.sql');
  const file = join(directory, 'contact.sqlite');
  const old = new SqliteContactDatabase(file, migrations);
  old.sqlite
    .prepare(
      "INSERT INTO contact_messages (id,name,email,service,message,lang,created_at) VALUES ('old-1','A','a@example.test','S','A long enough message.','fr',123)",
    )
    .run();
  old.close();
  await copy('0002_contact_topic.sql');
  const upgraded = new SqliteContactDatabase(file, migrations);
  t.after(() => upgraded.close());
  assert.deepEqual(
    {
      ...upgraded.sqlite
        .prepare('SELECT topic,company FROM contact_messages')
        .get(),
    },
    { topic: 'project', company: null },
  );
  assert.throws(() =>
    upgraded.sqlite
      .prepare("UPDATE contact_messages SET topic = 'other'")
      .run(),
  );
});
