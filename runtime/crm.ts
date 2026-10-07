import type { ContactDatabase } from '../db/index.ts';
import { submitLead, type OdooEnv } from '../server/odoo.ts';

// The stored inquiry is the source of truth; Odoo receives a copy. Delivery is
// retried until Odoo accepts it, so an Odoo outage delays leads but never loses
// them. Odoo deduplicates by reference, so a claim that expires mid-request or
// two replicas delivering the same inquiry still produce one lead.
const LEASE_MS = 60_000;
const MAX_BACKOFF_MS = 3_600_000;
const POLL_MS = 15_000;

interface Due {
  contact_id: string;
  attempts: number;
}
interface Inquiry {
  id: string;
  name: string;
  email: string;
  service: string;
  message: string;
  lang: string;
}

export class CrmDispatcher {
  readonly database: ContactDatabase;
  readonly env: OdooEnv;
  readonly send: typeof fetch;
  constructor(
    database: ContactDatabase,
    env: OdooEnv,
    send: typeof fetch = fetch,
  ) {
    this.database = database;
    this.env = env;
    this.send = send;
  }

  async claim(id?: string, now = Date.now()): Promise<Due | null> {
    const due = await this.database
      .prepare(
        `SELECT contact_id,attempts FROM contact_crm_queue
        WHERE status = 'queued' AND run_at <= ? AND (locked_until IS NULL OR locked_until <= ?)
        ${id ? 'AND contact_id = ?' : ''} ORDER BY run_at LIMIT 1`,
      )
      .bind(now, now, ...(id ? [id] : []))
      .first<Due>();
    if (!due) return null;
    const claimed = await this.database
      .prepare(
        `UPDATE contact_crm_queue SET locked_until = ?, attempts = attempts + 1
        WHERE contact_id = ? AND status = 'queued' AND attempts = ?
        AND (locked_until IS NULL OR locked_until <= ?)`,
      )
      .bind(now + LEASE_MS, due.contact_id, due.attempts, now)
      .run();
    return claimed.meta.changes === 1
      ? { contact_id: due.contact_id, attempts: Number(due.attempts) + 1 }
      : null;
  }

  // Delivers one due inquiry (the given one, or the oldest); false when none was due.
  async deliver(id?: string): Promise<boolean> {
    const claim = await this.claim(id);
    if (!claim) return false;
    const inquiry = await this.database
      .prepare(
        'SELECT id,name,email,service,message,lang FROM contact_messages WHERE id = ?',
      )
      .bind(claim.contact_id)
      .first<Inquiry>();
    if (!inquiry) throw new Error('CRM queue contact is missing');
    const outcome = await submitLead(
      this.env,
      { ...inquiry, subject: inquiry.service },
      this.send,
    );
    const now = Date.now();
    if (outcome.status === 'sent') {
      await this.database
        .prepare(
          `UPDATE contact_crm_queue SET status = 'sent', lead_id = ?, last_error = NULL, locked_until = NULL
          WHERE contact_id = ?`,
        )
        .bind(outcome.leadId, claim.contact_id)
        .run();
      return true;
    }
    console.error(`Odoo CRM delivery ${outcome.status}: ${outcome.error}`);
    await this.database
      .prepare(
        `UPDATE contact_crm_queue SET status = ?, run_at = ?, last_error = ?, locked_until = NULL
        WHERE contact_id = ?`,
      )
      .bind(
        outcome.status === 'rejected' ? 'manual' : 'queued',
        now +
          Math.min(MAX_BACKOFF_MS, 30_000 * 2 ** Math.min(claim.attempts, 20)),
        outcome.error,
        claim.contact_id,
      )
      .run();
    return false;
  }

  // Drains due inquiries every few seconds; returns a function that stops it.
  start(): () => Promise<void> {
    let active: Promise<unknown> | undefined;
    const drain = async () => {
      while (await this.deliver());
    };
    const tick = () => {
      if (active) return;
      active = drain()
        .catch(() => console.error('Odoo CRM queue unavailable'))
        .finally(() => {
          active = undefined;
        });
    };
    const timer = setInterval(tick, POLL_MS);
    timer.unref();
    tick();
    return async () => {
      clearInterval(timer);
      await active;
    };
  }
}
