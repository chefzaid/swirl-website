import { getDb, type ContactDatabase } from '../db/index.ts';
import {
  contactKeys,
  limitAttempts,
  insertWithinLimits,
  quotaRetryAfter,
} from './contact-limits.ts';
export interface ContactEnv {
  DB?: ContactDatabase;
  // Odoo CRM delivery of stored inquiries (runtime/crm.ts), when configured.
  CRM?: { deliver(id: string): Promise<unknown> };
  RESEND_API_KEY?: string;
  MS_TENANT_ID?: string;
  MS_CLIENT_ID?: string;
  MS_CLIENT_SECRET?: string;
  CONTACT_SENDER?: string;
}
export type ContactTopic = 'project' | 'demo';
export interface ContactData {
  id: string;
  // A project inquiry, or a Swirl Cloud demo request naming the company.
  topic: ContactTopic;
  company: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  lang: 'fr' | 'en';
  consent: true;
  startedAt: number;
  website: string;
}
const json = (
  body: Record<string, unknown>,
  status = 200,
  extraHeaders: Record<string, string> = {},
) =>
  Response.json(body, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      ...extraHeaders,
    },
  });
function validEmail(email: string): boolean {
  if (/\s/.test(email)) return false;
  const parts = email.split('@');
  if (parts.length !== 2 || !parts[0]) return false;
  const domain = parts[1];
  // A separate domain check avoids overlapping repetitions and backtracking.
  const dot = domain.lastIndexOf('.');
  return dot > 0 && dot < domain.length - 1;
}

// Demo requests carry no visitor subject; the company names the inquiry, its
// notification and its CRM lead.
export const demoSubject = (company: string) => `Démo Swirl Cloud — ${company}`;

export function validateContact(value: unknown): ContactData | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const v = value as Record<string, unknown>;
  // Forms opened before the topic choice existed send project inquiries.
  const topic = v.topic ?? 'project';
  if (topic !== 'project' && topic !== 'demo') return null;
  const company = v.company ?? '';
  if (typeof company !== 'string') return null;
  // Accept the previous field name while already-open forms finish submitting.
  const subject = topic === 'demo' ? '' : (v.subject ?? v.service);
  if (typeof subject !== 'string') return null;
  if (
    !['id', 'name', 'email', 'message', 'website'].every(
      (k) => typeof v[k] === 'string',
    )
  )
    return null;
  const data = {
    ...v,
    topic,
    company: company.trim(),
    subject: topic === 'demo' ? demoSubject(company.trim()) : subject.trim(),
    name: (v.name as string).trim(),
    email: (v.email as string).trim().toLowerCase(),
    message: (v.message as string).trim(),
  } as unknown as ContactData;
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      data.id,
    ) ||
    data.name.length < 2 ||
    data.name.length > 100 ||
    // oxlint-disable-next-line no-control-regex -- Reject control bytes in single-line input.
    /[\x00-\x1f]/.test(data.name) ||
    data.email.length > 254 ||
    // oxlint-disable-next-line no-control-regex -- Reject address control bytes before storage or mail delivery.
    /[\x00-\x20\x7f<>]/.test(data.email) ||
    !validEmail(data.email) ||
    data.message.length < 20 ||
    data.message.length > 5000 ||
    data.subject.length < 1 ||
    data.subject.length > 160 ||
    // oxlint-disable-next-line no-control-regex -- Subjects must not contain ASCII control bytes.
    /[\x00-\x1f\x7f]/.test(data.subject) ||
    // 140 keeps a demo subject (prefix and company) within the 160 above.
    data.company.length > 140 ||
    (data.topic === 'demo' && data.company.length < 2) ||
    // oxlint-disable-next-line no-control-regex -- Company names are single-line text.
    /[\x00-\x1f\x7f]/.test(data.company) ||
    !['fr', 'en'].includes(data.lang) ||
    data.consent !== true ||
    !Number.isFinite(data.startedAt) ||
    typeof data.startedAt !== 'number' ||
    data.website.length > 200
  )
    return null;
  return data;
}
export const BODY_TIMEOUT_MS = 5000;
async function readLimited(request: Request) {
  const reader = request.body?.getReader();
  if (!reader) return null;
  const bytes = new Uint8Array(18000);
  let size = 0;
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () => reject(new Error('body_timeout')),
      BODY_TIMEOUT_MS,
    );
  });
  try {
    while (true) {
      const part = await Promise.race([reader.read(), timeout]);
      if (part.done) break;
      if (size + part.value.byteLength > bytes.length)
        throw new Error('too_large');
      bytes.set(part.value, size);
      size += part.value.byteLength;
    }
    return JSON.parse(
      new TextDecoder('utf-8', { fatal: true }).decode(bytes.subarray(0, size)),
    );
  } catch (error) {
    // Cancellation may itself never settle for a hostile/unfinished stream.
    void reader.cancel().catch(() => {});
    throw error;
  } finally {
    clearTimeout(timer!);
    reader.releaseLock();
  }
}
type NotificationStatus = 'unconfigured' | 'sent' | 'failed';

const notificationSubject = (data: ContactData) =>
  `Swirl IT — ${data.subject} — ${data.name}`;
const notificationText = (data: ContactData) =>
  [
    `Nom : ${data.name}`,
    `E-mail : ${data.email}`,
    ...(data.company ? [`Entreprise : ${data.company}`] : []),
    `Sujet : ${data.subject}`,
    '',
    data.message,
    '',
    `Référence : ${data.id}`,
  ].join('\n');

export async function notifyContact(
  env: ContactEnv,
  data: ContactData,
  send: typeof fetch = fetch,
): Promise<NotificationStatus> {
  // Select one provider; falling back after a timeout could send two emails.
  return env.RESEND_API_KEY
    ? notifyResend(env, data, send)
    : notifyExchange(env, data, send);
}
export async function notifyResend(
  env: ContactEnv,
  data: ContactData,
  send: typeof fetch = fetch,
): Promise<NotificationStatus> {
  if (!env.RESEND_API_KEY || !env.CONTACT_SENDER) return 'unconfigured';
  try {
    const response = await send('https://api.resend.com/emails', {
      method: 'POST',
      redirect: 'error',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': `contact/${data.id}`,
      },
      body: JSON.stringify({
        from: `Swirl IT <${env.CONTACT_SENDER}>`,
        to: ['contact@swirlit.dev'],
        reply_to: data.email,
        subject: notificationSubject(data),
        text: notificationText(data),
      }),
      signal: AbortSignal.timeout(6000),
    });
    if (!response.ok) return 'failed';
    const result: unknown = await response.json();
    // "sent" means accepted by the provider, not confirmed inbox delivery.
    return result !== null &&
      typeof result === 'object' &&
      'id' in result &&
      typeof result.id === 'string' &&
      result.id.length > 0
      ? 'sent'
      : 'failed';
  } catch {
    return 'failed';
  }
}
export async function notifyExchange(
  env: ContactEnv,
  data: ContactData,
  send: typeof fetch = fetch,
): Promise<NotificationStatus> {
  if (
    !env.MS_TENANT_ID ||
    !env.MS_CLIENT_ID ||
    !env.MS_CLIENT_SECRET ||
    !env.CONTACT_SENDER
  )
    return 'unconfigured';
  try {
    const tokenResponse = await send(
      `https://login.microsoftonline.com/${encodeURIComponent(env.MS_TENANT_ID)}/oauth2/v2.0/token`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: env.MS_CLIENT_ID,
          client_secret: env.MS_CLIENT_SECRET,
          scope: 'https://graph.microsoft.com/.default',
          grant_type: 'client_credentials',
        }),
        signal: AbortSignal.timeout(6000),
      },
    );
    if (!tokenResponse.ok) return 'failed';
    const token = (await tokenResponse.json()) as { access_token?: string };
    if (!token.access_token) return 'failed';
    const response = await send(
      `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(env.CONTACT_SENDER)}/sendMail`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: {
            subject: notificationSubject(data),
            body: { contentType: 'Text', content: notificationText(data) },
            toRecipients: [
              { emailAddress: { address: 'contact@swirlit.dev' } },
            ],
            replyTo: [
              { emailAddress: { address: data.email, name: data.name } },
            ],
          },
          saveToSentItems: true,
        }),
        signal: AbortSignal.timeout(6000),
      },
    );
    return response.ok ? 'sent' : 'failed';
  } catch {
    return 'failed';
  }
}
function validateRequestHeaders(request: Request): Response | null {
  if (request.method !== 'POST')
    return new Response(null, {
      status: 405,
      headers: { Allow: 'POST', 'Cache-Control': 'no-store' },
    });
  if (request.headers.get('sec-fetch-site') === 'cross-site')
    return json({ error: 'origin' }, 403);
  const origin = request.headers.get('origin');
  if (!origin || origin !== new URL(request.url).origin)
    return json({ error: 'origin' }, 403);
  if (
    request.headers.get('content-type')?.split(';')[0].trim() !==
    'application/json'
  )
    return json({ error: 'content_type' }, 415);
  const length = request.headers.get('content-length');
  if (length && !/^\d+$/.test(length))
    return json({ error: 'content_length' }, 400);
  if (
    request.headers.has('content-encoding') &&
    request.headers.get('content-encoding') !== 'identity'
  )
    return json({ error: 'content_encoding' }, 415);
  if (Number(length || 0) > 18000) return json({ error: 'too_large' }, 413);
  return null;
}

export async function handleContact(
  request: Request,
  env: ContactEnv,
): Promise<Response> {
  const rejected = validateRequestHeaders(request);
  if (rejected) return rejected;
  let body: unknown;
  try {
    body = await readLimited(request);
  } catch (e) {
    const error = e instanceof Error ? e.message : 'invalid_json';
    if (error === 'too_large') return json({ error }, 413);
    if (error === 'body_timeout') return json({ error }, 408);
    return json({ error: 'invalid_json' }, 400);
  }
  const data = validateContact(body);
  if (!data) return json({ error: 'validation' }, 400);
  if (data.website) return json({ error: 'spam' }, 400);
  const now = Date.now();
  if (now - data.startedAt > 86400000) return json({ error: 'expired' }, 400);
  if (now - data.startedAt < 2000) return json({ error: 'too_fast' }, 400);
  try {
    const db = getDb(env);
    return await storeContact(request, env, db, data, now);
  } catch {
    console.error('Contact storage unavailable');
    return json({ error: 'unavailable' }, 503);
  }
}

interface StoredContact {
  email: string;
  name: string;
  message: string;
  service: string;
  topic: string;
  company: string | null;
  notification_status: string;
}

function findContact(db: ContactDatabase, id: string) {
  return db
    .prepare(
      'SELECT email,name,message,service,topic,company,notification_status FROM contact_messages WHERE id = ?',
    )
    .bind(id)
    .first<StoredContact>();
}

function duplicateResponse(
  existing: StoredContact,
  data: ContactData,
): Response {
  if (
    existing.email !== data.email ||
    existing.name !== data.name ||
    existing.message !== data.message ||
    existing.service !== data.subject ||
    existing.topic !== data.topic ||
    (existing.company ?? '') !== data.company
  )
    return json({ error: 'conflict' }, 409);
  return json({ ok: true, notified: existing.notification_status === 'sent' });
}

async function storeContact(
  request: Request,
  env: ContactEnv,
  db: ContactDatabase,
  data: ContactData,
  now: number,
): Promise<Response> {
  const keys = await contactKeys(request, data.email);
  const retryAfter = await limitAttempts(db, keys.ip, now);
  if (retryAfter)
    return json({ error: 'rate_limit' }, 429, {
      'Retry-After': String(retryAfter),
    });
  const existing = await findContact(db, data.id);
  if (existing) return duplicateResponse(existing, data);
  await db
    .prepare('DELETE FROM contact_rate_limits WHERE expires_at <= ?')
    .bind(now)
    .run();
  const provider = env.RESEND_API_KEY
    ? 'resend'
    : env.MS_TENANT_ID && env.MS_CLIENT_ID && env.MS_CLIENT_SECRET
      ? 'graph'
      : undefined;
  const notification =
    db.durableNotifications && provider && env.CONTACT_SENDER
      ? ({ provider, sender: env.CONTACT_SENDER } as const)
      : undefined;
  const inserted = await insertWithinLimits(db, data, keys, now, notification);
  if (inserted)
    // The visitor's response does not wait for Odoo; the queue retries.
    void env.CRM?.deliver(data.id).catch(() =>
      console.error('Odoo CRM delivery remains queued'),
    );
  if (!inserted) {
    const raced = await findContact(db, data.id);
    if (!raced)
      return json({ error: 'rate_limit' }, 429, {
        'Retry-After': String(await quotaRetryAfter(db, keys, now)),
      });
    return duplicateResponse(raced, data);
  }
  if (db.durableNotifications) {
    let notified = false;
    try {
      notified = notification
        ? ((await db.deliverNotification?.(data.id)) ?? false)
        : false;
    } catch {
      console.error('Contact notification remains queued');
    }
    return json({ ok: true, notified }, 201);
  }
  const status = await notifyContact(env, data);
  // Persist before notifying so an email-service failure never loses the enquiry.
  try {
    await db
      .prepare(
        'UPDATE contact_messages SET notification_status = ? WHERE id = ?',
      )
      .bind(status, data.id)
      .run();
  } catch {
    console.error('Unable to update contact notification status');
  }
  return json({ ok: true, notified: status === 'sent' }, 201);
}
