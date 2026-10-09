import { randomUUID } from 'node:crypto';
import {
  notifyExchange,
  notifyResend,
  type ContactData,
  type ContactEnv,
} from '../server/contact.ts';
import type { PostgresContactDatabase } from './postgres.ts';
import { poll } from './poll.ts';

const LEASE_MS = 120_000;
// Resend retains keys for 24 hours. Stop well before expiry; neither provider
// offers an unlimited exactly-once delivery guarantee after an ambiguous send.
const RETRY_WINDOW_MS = 20 * 3_600_000;
const MAX_ATTEMPTS = 6;
interface Claimed {
  contact_id: string;
  provider: 'resend' | 'graph';
  sender: string;
  attempts: number;
  first_attempt_at: number;
  locked_by: string;
}

export class NotificationDispatcher {
  readonly database: PostgresContactDatabase;
  readonly env: ContactEnv;
  readonly send: typeof fetch;
  constructor(
    database: PostgresContactDatabase,
    env: ContactEnv,
    send: typeof fetch = fetch,
  ) {
    this.database = database;
    this.env = env;
    this.send = send;
  }

  async claim(id?: string, now = Date.now()): Promise<Claimed | null> {
    return this.database.sql.begin(async (sql) => {
      // Recovery and completion are fenced by the claim token. Graph has no
      // provider idempotency key, so an interrupted attempt requires review.
      const expired = await sql.unsafe(
        `UPDATE contact_notification_queue SET
        status = CASE WHEN provider = 'resend' AND attempts < $2 AND first_attempt_at > $3 THEN 'queued' ELSE 'manual' END,
        locked_by = NULL, locked_until = NULL
        WHERE status = 'running' AND locked_until <= $1 RETURNING contact_id,status`,
        [now, MAX_ATTEMPTS, now - RETRY_WINDOW_MS],
      );
      for (const row of expired) {
        await sql.unsafe(
          'UPDATE contact_messages SET notification_status = $1 WHERE id = $2',
          [row.status, row.contact_id],
        );
      }
      const overdue = await sql.unsafe(
        `UPDATE contact_notification_queue SET status = 'manual'
        WHERE status = 'queued' AND first_attempt_at IS NOT NULL AND first_attempt_at <= $1
        RETURNING contact_id`,
        [now - RETRY_WINDOW_MS],
      );
      for (const row of overdue) {
        await sql.unsafe(
          "UPDATE contact_messages SET notification_status = 'manual' WHERE id = $1",
          [row.contact_id],
        );
      }
      const token = randomUUID();
      const rows = await sql.unsafe<Claimed[]>(
        `UPDATE contact_notification_queue SET
        status = 'running', locked_by = $1, locked_until = $2,
        attempts = attempts + 1, first_attempt_at = COALESCE(first_attempt_at, $3)
        WHERE contact_id = (SELECT contact_id FROM contact_notification_queue
          WHERE status = 'queued' AND run_at <= $3 AND ($4::text IS NULL OR contact_id = $4)
          AND ((provider = 'resend' AND $5::boolean) OR (provider = 'graph' AND $6::boolean))
          ORDER BY run_at,contact_id FOR UPDATE SKIP LOCKED LIMIT 1)
        RETURNING contact_id,provider,sender,attempts,first_attempt_at,locked_by`,
        [
          token,
          now + LEASE_MS,
          now,
          id ?? null,
          !!this.env.RESEND_API_KEY,
          !!(
            this.env.MS_TENANT_ID &&
            this.env.MS_CLIENT_ID &&
            this.env.MS_CLIENT_SECRET
          ),
        ],
      );
      return rows[0] ?? null;
    });
  }

  async complete(
    claim: Claimed,
    sent: boolean,
    now = Date.now(),
  ): Promise<boolean> {
    const retry =
      !sent &&
      claim.provider === 'resend' &&
      claim.attempts < MAX_ATTEMPTS &&
      now - claim.first_attempt_at < RETRY_WINDOW_MS;
    const status = sent ? 'sent' : retry ? 'queued' : 'manual';
    return this.database.sql.begin(async (sql) => {
      const rows = await sql.unsafe(
        `UPDATE contact_notification_queue SET
        status = $1, run_at = $2, locked_by = NULL, locked_until = NULL
        WHERE contact_id = $3 AND status = 'running' AND locked_by = $4 AND locked_until > $5
        RETURNING contact_id`,
        [
          status,
          now + Math.min(3_600_000, 30_000 * 2 ** claim.attempts),
          claim.contact_id,
          claim.locked_by,
          now,
        ],
      );
      if (!rows.length) return false;
      await sql.unsafe(
        'UPDATE contact_messages SET notification_status = $1 WHERE id = $2',
        [status, claim.contact_id],
      );
      return sent;
    });
  }

  async deliver(id?: string): Promise<boolean> {
    const claim = await this.claim(id);
    if (!claim) return false;
    const rows = await this.database.sql.unsafe(
      'SELECT * FROM contact_messages WHERE id = $1',
      [claim.contact_id],
    );
    const row = rows[0];
    if (!row) throw new Error('Notification contact is missing');
    const data: ContactData = {
      id: row.id,
      topic: row.topic,
      company: row.company ?? '',
      name: row.name,
      email: row.email,
      subject: row.service,
      message: row.message,
      lang: row.lang,
      consent: true,
      startedAt: row.created_at,
      website: '',
    };
    const env = { ...this.env, CONTACT_SENDER: claim.sender };
    const status = await (
      claim.provider === 'resend' ? notifyResend : notifyExchange
    )(env, data, this.send);
    return this.complete(claim, status === 'sent');
  }

  start(): () => Promise<void> {
    return poll(
      () => this.deliver(),
      5000,
      'Contact notification queue unavailable',
    );
  }
}
