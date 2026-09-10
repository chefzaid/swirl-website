import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import type { AddressInfo } from 'node:net';
import { createServer } from 'vite';
import { devContact } from '../server/dev-contact.mjs';

void test('development stores contacts in SQLite across restarts and rejects spoofed origins', async (t) => {
  const directory = await mkdtemp(join(tmpdir(), 'website-dev-contact-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const variables = {
    DATA_DIR: join(directory, 'data'),
    DATABASE_URL: '',
    RESEND_API_KEY: '',
    CONTACT_SENDER: '',
    MS_TENANT_ID: '',
    MS_CLIENT_ID: '',
    MS_CLIENT_SECRET: '',
  };
  const original = { ...process.env };
  // The fixture must never inherit real database or notification credentials.
  for (const key of Object.keys(variables)) delete process.env[key];
  t.after(() => {
    for (const key of Object.keys(variables)) {
      if (original[key] === undefined) delete process.env[key];
      else process.env[key] = original[key];
    }
  });
  await writeFile(
    join(directory, '.env'),
    Object.entries(variables)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n'),
  );
  const data = {
    id: crypto.randomUUID(),
    name: 'Local visitor',
    email: 'visitor@example.test',
    subject: 'Local development',
    message: 'This enquiry tests local storage without sending an email.',
    lang: 'en',
    consent: true,
    startedAt: Date.now() - 5000,
    website: '',
  };
  for (const expectedStatus of [201, 200]) {
    const server = await createServer({
      configFile: false,
      envDir: directory,
      plugins: [devContact()],
      server: { host: '127.0.0.1', port: 0 },
      logLevel: 'error',
    });
    try {
      await server.listen();
      const port = (server.httpServer!.address() as AddressInfo).port;
      const origin = `http://127.0.0.1:${port}`;
      const endpoint = origin + '/api/contact';
      const options = {
        method: 'POST',
        headers: { Origin: origin, 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      };
      const response = await fetch(endpoint, options);
      assert.equal(response.status, expectedStatus, await response.text());
      const rejected = await fetch(endpoint, {
        ...options,
        headers: {
          ...options.headers,
          Origin: 'https://attacker.test',
          'X-Forwarded-Host': 'attacker.test',
          'X-Forwarded-Proto': 'https',
        },
      });
      assert.equal(rejected.status, 403);
      assert.equal((await fetch(endpoint)).status, 405);
    } finally {
      await server.close();
    }
  }
  const db = new DatabaseSync(join(variables.DATA_DIR, 'contact.sqlite'), {
    readOnly: true,
  });
  try {
    const row = db
      .prepare('SELECT id, notification_status FROM contact_messages')
      .all();
    assert.equal(row.length, 1);
    assert.equal(row[0].id, data.id);
    assert.equal(row[0].notification_status, 'unconfigured');
  } finally {
    db.close();
  }
});
