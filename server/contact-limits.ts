import { isIP } from 'node:net';
import type { ContactDatabase, DatabaseStatement } from '../db/index.ts';

const HOUR = 3_600_000;
export const MAX_ATTEMPTS_PER_MINUTE = 30;
const deniedWindows = new WeakMap<ContactDatabase, Map<string, number>>();
const MAX_CACHED_BLOCKS = 1000;
export function sourceBucket(request: Request): string {
  // Only the hosting edge's header is used, never X-Forwarded-For or form data.
  const ip = request.headers.get('cf-connecting-ip') || '';
  if (isIP(ip) === 4) return `v4:${ip}`;
  if (isIP(ip) !== 6) return 'unknown';
  const canonical = new URL(`http://[${ip}]/`).hostname.slice(1, -1);
  const halves = canonical.split('::');
  const left = halves[0] ? halves[0].split(':') : [];
  const right = halves[1] ? halves[1].split(':') : [];
  const words =
    halves.length === 1
      ? left
      : [...left, ...Array(8 - left.length - right.length).fill('0'), ...right];
  const values = words.map((word) => parseInt(word, 16));
  if (values.slice(0, 5).every((value) => value === 0) && values[5] === 65535) {
    return `v4:${values[6] >> 8}.${values[6] & 255}.${values[7] >> 8}.${values[7] & 255}`;
  }
  return `v6:${values
    .slice(0, 4)
    .map((value) => value.toString(16))
    .join(':')}/64`;
}
async function digest(value: string): Promise<string> {
  const bytes = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(value),
  );
  return Array.from(new Uint8Array(bytes), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('');
}
export async function contactKeys(request: Request, email: string) {
  const [ip, address] = await Promise.all([
    digest(sourceBucket(request)),
    digest(email),
  ]);
  return { ip, email: address };
}
export async function limitAttempts(
  db: ContactDatabase,
  ip: string,
  now: number,
): Promise<number> {
  let blocked = deniedWindows.get(db);
  if (!blocked) {
    blocked = new Map();
    deniedWindows.set(db, blocked);
  }
  const scopes = [
    [`v2:attempt:${ip}`, MAX_ATTEMPTS_PER_MINUTE],
    ['v2:attempt:global', 120],
  ] as const;
  for (const [key] of scopes) {
    const until = blocked.get(key);
    if (until && until > now)
      return Math.max(1, Math.ceil((until - now) / 1000));
    blocked.delete(key);
  }
  // Bound retries/conflicts as well as new enquiries. Counters saturate, and a
  // blocked request doesn't extend the window. This is not an edge DDoS filter.
  for (const [key, maximum] of scopes) {
    const result = await db
      .prepare(`
      INSERT INTO contact_rate_limits (key,count,expires_at) VALUES (?,1,?)
      ON CONFLICT(key) DO UPDATE SET
        count = CASE WHEN expires_at <= ? THEN 1 ELSE MIN(count+1,?) END,
        expires_at = CASE WHEN expires_at <= ? THEN excluded.expires_at ELSE expires_at END
      RETURNING count,expires_at
    `)
      .bind(key, now + 60_000, now, maximum + 1, now)
      .first<{ count: number; expires_at: number }>();
    if (!result) throw new Error('Rate counter unavailable');
    if (result.count > maximum) {
      if (blocked.size >= MAX_CACHED_BLOCKS)
        blocked.delete(blocked.keys().next().value!);
      blocked.set(key, result.expires_at);
      return Math.max(1, Math.ceil((result.expires_at - now) / 1000));
    }
  }
  return 0;
}
export async function insertWithinLimits(
  db: ContactDatabase,
  row: {
    id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    lang: string;
  },
  keys: { ip: string; email: string },
  now: number,
): Promise<boolean> {
  const limits = [
    { key: `v2:submission:ip:${keys.ip}`, max: 5, window: HOUR },
    { key: `v2:submission:email:${keys.email}`, max: 5, window: HOUR },
    { key: 'v2:submission:global:hour', max: 30, window: HOUR },
    { key: 'v2:submission:global:day', max: 100, window: 24 * HOUR },
  ];
  const reservation = `v2:reservation:${row.id}`;
  const eligible = limits
    .map(
      () =>
        'COALESCE((SELECT count < ? OR expires_at <= ? FROM contact_rate_limits WHERE key = ?),1)',
    )
    .join(' AND ');
  const statements: DatabaseStatement[] = [
    db
      .prepare(`
    INSERT INTO contact_rate_limits (key,count,expires_at)
    SELECT ?,1,? WHERE NOT EXISTS (SELECT 1 FROM contact_messages WHERE id = ?)
      AND ${eligible}
    ON CONFLICT(key) DO NOTHING
  `)
      .bind(
        reservation,
        now + 60_000,
        row.id,
        ...limits.flatMap((limit) => [limit.max, now, limit.key]),
      ),
  ];
  for (const limit of limits) {
    statements.push(
      db
        .prepare(`
      INSERT INTO contact_rate_limits (key,count,expires_at)
      SELECT ?,1,? WHERE EXISTS (SELECT 1 FROM contact_rate_limits WHERE key = ?)
      ON CONFLICT(key) DO UPDATE SET
        count = CASE WHEN expires_at <= ? THEN 1 ELSE count+1 END,
        expires_at = CASE WHEN expires_at <= ? THEN excluded.expires_at ELSE expires_at END
    `)
        .bind(limit.key, now + limit.window, reservation, now, now),
    );
  }
  statements.push(
    db
      .prepare(`
    INSERT INTO contact_messages (id,name,email,service,message,lang,created_at,notification_status)
    SELECT ?,?,?,?,?,?,?,? WHERE EXISTS (SELECT 1 FROM contact_rate_limits WHERE key = ?)
    ON CONFLICT(id) DO NOTHING
  `)
      .bind(
        row.id,
        row.name,
        row.email,
        row.subject,
        row.message,
        row.lang,
        now,
        'unconfigured',
        reservation,
      ),
  );
  statements.push(
    db
      .prepare('DELETE FROM contact_rate_limits WHERE key = ?')
      .bind(reservation),
  );
  // D1 batch is transactional. Eligibility is evaluated before any allowance
  // changes, and the temporary reservation never survives the transaction.
  // A failed quota therefore consumes no other new-submission allowance.
  const results = await db.batch(statements);
  return results.at(-2)?.meta.changes === 1;
}

export async function quotaRetryAfter(
  db: ContactDatabase,
  keys: { ip: string; email: string },
  now: number,
): Promise<number> {
  const row = await db
    .prepare(`SELECT MAX(expires_at) AS expiry FROM contact_rate_limits
    WHERE expires_at > ? AND (
      (key = ? AND count >= 5) OR (key = ? AND count >= 5)
      OR (key = 'v2:submission:global:hour' AND count >= 30)
      OR (key = 'v2:submission:global:day' AND count >= 100)
    )`)
    .bind(
      now,
      `v2:submission:ip:${keys.ip}`,
      `v2:submission:email:${keys.email}`,
    )
    .first<{ expiry: number | null }>();
  return Math.max(1, Math.ceil(((row?.expiry || now + 60_000) - now) / 1000));
}
