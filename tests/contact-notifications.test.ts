import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  handleContact,
  notifyContact,
  notifyExchange,
  notifyResend,
} from '../server/contact.ts';
import { database, request, valid } from './contact-fixtures.ts';
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
  assert.equal(await notifyContact(env, data, send), 'sent');
  assert.equal(calls.length, 2);
  const payload = calls[1].options?.body;
  assert.ok(typeof payload === 'string');
  const body = JSON.parse(payload);
  assert.equal(
    body.message.toRecipients[0].emailAddress.address,
    'contact@swirlit.dev',
  );
  assert.equal(body.message.replyTo[0].emailAddress.address, data.email);
  assert.equal(body.message.subject, `Swirl — ${data.subject} — ${data.name}`);
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
void test('Resend sends one plain-text notification with a fixed recipient and visitor reply-to', async () => {
  const data = valid();
  const calls: Array<{ url: unknown; options?: RequestInit }> = [];
  const send: typeof fetch = async (url, options) => {
    calls.push({ url, options });
    return Response.json({ id: 'provider-message-id' });
  };
  assert.equal(
    await notifyContact(
      {
        RESEND_API_KEY: 'test-resend-key',
        CONTACT_SENDER: 'noreply@swirlit.dev',
        MS_TENANT_ID: 'unused-tenant',
        MS_CLIENT_ID: 'unused-client',
        MS_CLIENT_SECRET: 'unused-secret',
      },
      data,
      send,
    ),
    'sent',
  );
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'https://api.resend.com/emails');
  const options = calls[0].options;
  assert.equal(options?.method, 'POST');
  assert.equal(options.redirect, 'error');
  assert.ok(options.signal instanceof AbortSignal);
  const headers = new Headers(options.headers);
  assert.equal(headers.get('Authorization'), 'Bearer test-resend-key');
  assert.equal(headers.get('Idempotency-Key'), `contact/${data.id}`);
  assert.equal(headers.get('Content-Type'), 'application/json');
  assert.equal(typeof options.body, 'string');
  assert.deepEqual(JSON.parse(options.body as string), {
    from: 'Swirl <noreply@swirlit.dev>',
    to: ['contact@swirlit.dev'],
    reply_to: data.email,
    subject: `Swirl — ${data.subject} — ${data.name}`,
    text: `Nom : ${data.name}\nE-mail : ${data.email}\nSujet : ${data.subject}\n\n${data.message}\n\nRéférence : ${data.id}`,
  });
});
void test('Resend requires credentials and a sender without making a request', async () => {
  let calls = 0;
  const send: typeof fetch = async () => {
    calls++;
    throw new Error('Unexpected request');
  };
  for (const env of [
    {},
    { RESEND_API_KEY: 'test-resend-key' },
    { CONTACT_SENDER: 'noreply@swirlit.dev' },
  ])
    assert.equal(await notifyResend(env, valid(), send), 'unconfigured');
  assert.equal(calls, 0);
});
void test('Resend failures and invalid responses do not report success or fall back to Exchange', async () => {
  const env = {
    RESEND_API_KEY: 'test-resend-key',
    CONTACT_SENDER: 'noreply@swirlit.dev',
    MS_TENANT_ID: 'unused-tenant',
    MS_CLIENT_ID: 'unused-client',
    MS_CLIENT_SECRET: 'unused-secret',
  };
  const responses = [
    ...[400, 401, 403, 429, 500].map(
      (status) => new Response(null, { status }),
    ),
    Response.json({}),
    Response.json(null),
    Response.json({ id: '' }),
    Response.json({ id: 123 }),
    new Response('invalid JSON'),
  ];
  for (const response of responses) {
    let calls = 0;
    assert.equal(
      await notifyContact(env, valid(), async () => {
        calls++;
        return response;
      }),
      'failed',
    );
    assert.equal(calls, 1);
  }
  for (const error of [
    new Error('Network unavailable'),
    new DOMException('Request timed out', 'TimeoutError'),
  ])
    assert.equal(
      await notifyContact(env, valid(), async () => {
        throw error;
      }),
      'failed',
    );
});
void test('contact persists before Resend, retains failed notifications and never sends again on a retry', async (t) => {
  for (const accepted of [true, false])
    await t.test(accepted ? 'accepted' : 'failed', async (t) => {
      const { sqlite, DB } = database();
      t.after(() => sqlite.close());
      const data = valid();
      const env = {
        DB,
        RESEND_API_KEY: 'test-resend-key',
        CONTACT_SENDER: 'noreply@swirlit.dev',
      };
      const send = t.mock.method(globalThis, 'fetch', async () => {
        assert.equal(
          sqlite
            .prepare('SELECT message FROM contact_messages WHERE id = ?')
            .get(data.id)?.message,
          data.message,
        );
        return accepted
          ? Response.json({ id: 'provider-message-id' })
          : new Response(null, { status: 503 });
      });
      const response = await handleContact(request(data), env);
      assert.equal(response.status, 201);
      assert.deepEqual(await response.json(), { ok: true, notified: accepted });
      assert.equal(
        sqlite
          .prepare(
            'SELECT notification_status FROM contact_messages WHERE id = ?',
          )
          .get(data.id)?.notification_status,
        accepted ? 'sent' : 'failed',
      );
      const duplicate = await handleContact(request(data), env);
      assert.equal(duplicate.status, 200);
      assert.deepEqual(await duplicate.json(), {
        ok: true,
        notified: accepted,
      });
      assert.equal(send.mock.callCount(), 1);
      assert.equal(
        sqlite.prepare('SELECT count(*) AS n FROM contact_messages').get()?.n,
        1,
      );
    });
});
