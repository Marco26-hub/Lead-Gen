import { env, requireEnv } from './config';

/**
 * Minimal Resend client — solo invio email, niente SDK pesante.
 * Usato dal route `/api/d/[slug]/book` (apps/web) per notifiche
 * transazionali. L'outreach batch usa ancora l'SDK Resend nell'orchestrator.
 */

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  /** Optional from override. Default = env.RESEND_FROM. */
  from?: string;
  /** Optional reply-to (es. email cliente). */
  replyTo?: string;
}

export interface SendEmailResult {
  id: string | null;
  error?: string;
}

export async function sendEmail(i: SendEmailInput): Promise<SendEmailResult> {
  const key = requireEnv('RESEND_API_KEY');
  const from = i.from ?? env.RESEND_FROM;
  const payload: Record<string, unknown> = {
    from,
    to: [i.to],
    subject: i.subject,
    html: i.html,
  };
  if (i.replyTo) payload.reply_to = i.replyTo;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  const data = (await res.json().catch(() => ({}))) as { id?: string; message?: string };
  if (!res.ok) return { id: null, error: data.message ?? `HTTP ${res.status}` };
  return { id: data.id ?? null };
}
