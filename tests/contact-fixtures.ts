// Shared fixtures for the contact API tests.
import { SqliteContactDatabase } from '../runtime/sqlite.ts';
import type { ContactData } from '../server/contact.ts';
export const valid = (): ContactData => ({
  id: crypto.randomUUID(),
  topic: 'project',
  company: '',
  name: 'Test visitor',
  email: 'visitor@example.test',
  subject: 'Refonte de notre portail client',
  message: 'I would like to discuss a software architecture project.',
  lang: 'en',
  consent: true,
  startedAt: Date.now() - 5000,
  website: '',
});
export function database() {
  const DB = new SqliteContactDatabase(':memory:', 'db/migrations');
  return { sqlite: DB.sqlite, DB };
}
export const request = (data: unknown, headers: Record<string, string> = {}) =>
  new Request('https://portfolio.test/api/contact', {
    method: 'POST',
    headers: {
      Origin: 'https://portfolio.test',
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify(data),
  });
