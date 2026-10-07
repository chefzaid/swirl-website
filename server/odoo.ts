// Creates one Odoo CRM lead per stored inquiry through the platform's intake
// API. The reference is derived from the inquiry ID, so every retry, from any
// replica, returns the same lead instead of creating another one.
export interface OdooEnv {
  ODOO_URL?: string;
  ODOO_DATABASE?: string;
  ODOO_API_KEY?: string;
}
export interface LeadInquiry {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  lang: string;
}
export type LeadOutcome =
  | { status: 'sent'; leadId: number }
  // Retry later with the same reference: Odoo is unreachable or busy.
  | { status: 'retry'; error: string }
  // A credential or contract problem an operator must fix; retrying cannot help.
  | { status: 'rejected'; error: string };

export function odooConfigured(env: OdooEnv): boolean {
  return !!(env.ODOO_URL && env.ODOO_API_KEY);
}

export async function submitLead(
  env: OdooEnv,
  inquiry: LeadInquiry,
  send: typeof fetch = fetch,
): Promise<LeadOutcome> {
  if (!odooConfigured(env)) return { status: 'retry', error: 'unconfigured' };
  let response: Response;
  try {
    response = await send(
      new URL('/json/2/crm.lead/platform_intake_submit', env.ODOO_URL),
      {
        method: 'POST',
        redirect: 'error',
        headers: {
          Authorization: `bearer ${env.ODOO_API_KEY}`,
          'X-Odoo-Database': env.ODOO_DATABASE || 'odoo',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reference: `contact:${inquiry.id}`,
          values: {
            name: inquiry.subject,
            contact_name: inquiry.name,
            email_from: inquiry.email,
            description: inquiry.message,
            lang: inquiry.lang === 'en' ? 'en_US' : 'fr_FR',
          },
        }),
        signal: AbortSignal.timeout(10_000),
      },
    );
  } catch {
    return { status: 'retry', error: 'network' };
  }
  if ([401, 403, 422].includes(response.status))
    return { status: 'rejected', error: `http_${response.status}` };
  if (!response.ok)
    return { status: 'retry', error: `http_${response.status}` };
  try {
    const result: unknown = await response.json();
    if (
      result !== null &&
      typeof result === 'object' &&
      'id' in result &&
      Number.isSafeInteger(result.id) &&
      (result.id as number) > 0
    )
      return { status: 'sent', leadId: result.id as number };
  } catch {
    // Fall through: an unreadable success is retried with the same reference.
  }
  return { status: 'retry', error: 'invalid_response' };
}
