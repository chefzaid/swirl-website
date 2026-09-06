import { getDb, type ContactDatabase } from '../db/index.ts';
import {
  contactKeys,
  limitAttempts,
  insertWithinLimits,
  quotaRetryAfter,
} from './contact-limits.ts';
export interface ContactEnv {
  DB?: ContactDatabase;
  RESEND_API_KEY?: string;
  MS_TENANT_ID?: string;
  MS_CLIENT_ID?: string;
  MS_CLIENT_SECRET?: string;
  CONTACT_SENDER?: string;
}
export interface ContactData {
  id: string;
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
export function validateContact(value: unknown): ContactData | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const v = value as Record<string, unknown>;
  // Accept the previous field name while already-open forms finish submitting.
  const subject = v.subject ?? v.service;
  if (typeof subject !== 'string') return null;
  if (
    !['id', 'name', 'email', 'message', 'website'].every(
      (k) => typeof v[k] === 'string',
    )
  )
    return null;
  const data = {
    ...v,
    subject: subject.trim(),
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
    /[\r\n\x00-\x1f]/.test(data.name) ||
    data.email.length > 254 ||
    // oxlint-disable-next-line no-control-regex -- Reject address control bytes before storage or mail delivery.
    /[\x00-\x20\x7f<>]/.test(data.email) ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) ||
    data.message.length < 20 ||
    data.message.length > 5000 ||
    data.subject.length < 1 ||
    data.subject.length > 160 ||
    // oxlint-disable-next-line no-control-regex -- Subjects must not contain ASCII control bytes.
    /[\x00-\x1f\x7f]/.test(data.subject) ||
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
export async function notifyContact(
  env: ContactEnv,
  data: ContactData,
  send: typeof fetch = fetch,
): Promise<'unconfigured' | 'sent' | 'failed'> {
  // Select one provider; falling back after a timeout could send two emails.
  return env.RESEND_API_KEY
    ? notifyResend(env, data, send)
    : notifyExchange(env, data, send);
}
export async function notifyResend(
  env: ContactEnv,
  data: ContactData,
  send: typeof fetch = fetch,
): Promise<'unconfigured' | 'sent' | 'failed'> {
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
        subject: `Swirl IT — ${data.subject} — ${data.name}`,
        text: `Nom : ${data.name}\nE-mail : ${data.email}\nSujet : ${data.subject}\n\n${data.message}\n\nRéférence : ${data.id}`,
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
): Promise<'unconfigured' | 'sent' | 'failed'> {
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
            subject: `Swirl IT — ${data.subject} — ${data.name}`,
            body: {
              contentType: 'Text',
              content: `Nom : ${data.name}\nE-mail : ${data.email}\nSujet : ${data.subject}\n\n${data.message}\n\nRéférence : ${data.id}`,
            },
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
export async function handleContact(
  request: Request,
  env: ContactEnv,
): Promise<Response> {
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
    const keys = await contactKeys(request, data.email);
    const retryAfter = await limitAttempts(db, keys.ip, now);
    if (retryAfter)
      return json({ error: 'rate_limit' }, 429, {
        'Retry-After': String(retryAfter),
      });
    const existing = await db
      .prepare(
        'SELECT id,email,name,message,service,notification_status FROM contact_messages WHERE id = ?',
      )
      .bind(data.id)
      .first<{
        id: string;
        email: string;
        name: string;
        message: string;
        service: string;
        notification_status: string;
      }>();
    if (existing) {
      if (
        existing.email !== data.email ||
        existing.name !== data.name ||
        existing.message !== data.message ||
        existing.service !== data.subject
      )
        return json({ error: 'conflict' }, 409);
      return json({
        ok: true,
        notified: existing.notification_status === 'sent',
      });
    }
    await db
      .prepare('DELETE FROM contact_rate_limits WHERE expires_at <= ?')
      .bind(now)
      .run();
    const inserted = await insertWithinLimits(db, data, keys, now);
    if (!inserted) {
      const raced = await db
        .prepare(
          'SELECT email,name,message,service,notification_status FROM contact_messages WHERE id = ?',
        )
        .bind(data.id)
        .first<{
          email: string;
          name: string;
          message: string;
          service: string;
          notification_status: string;
        }>();
      if (!raced)
        return json({ error: 'rate_limit' }, 429, {
          'Retry-After': String(await quotaRetryAfter(db, keys, now)),
        });
      if (
        raced.email !== data.email ||
        raced.name !== data.name ||
        raced.message !== data.message ||
        raced.service !== data.subject
      )
        return json({ error: 'conflict' }, 409);
      return json({ ok: true, notified: raced.notification_status === 'sent' });
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
  } catch {
    console.error('Contact storage unavailable');
    return json({ error: 'unavailable' }, 503);
  }
}
