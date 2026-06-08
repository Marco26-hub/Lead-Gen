import type { Channel } from '@maps/core';
import { db } from '../lib/db';

/** Impersonal local-parts considered B2B-safe under legitimate interest (lower GDPR risk). */
const IMPERSONAL = [
  'info',
  'commerciale',
  'amministrazione',
  'contatti',
  'segreteria',
  'ufficio',
  'sales',
  'vendite',
  'direzione',
  'prenotazioni',
  'staff',
  'hello',
  'ciao',
];

/** True only for impersonal addresses (info@, commerciale@, …). Rejects personal nome.cognome@. */
export function emailEligible(email?: string | null): boolean {
  if (!email) return false;
  const at = email.toLowerCase().trim().indexOf('@');
  if (at <= 0) return false;
  const local = email.toLowerCase().trim().slice(0, at);
  return IMPERSONAL.some(
    (p) => local === p || local.startsWith(`${p}.`) || local.startsWith(`${p}-`) || local.startsWith(`${p}_`),
  );
}

export async function isSuppressed(email?: string | null, phone?: string | null): Promise<boolean> {
  if (!email && !phone) return true;
  const sb = db();
  if (email) {
    const { data } = await sb.from('unsubscribes').select('id').ilike('email', email).limit(1);
    if (data && data.length > 0) return true;
  }
  if (phone) {
    const { data } = await sb.from('unsubscribes').select('id').eq('phone', phone).limit(1);
    if (data && data.length > 0) return true;
  }
  return false;
}

export interface EventPartial {
  template?: string;
  status?: string;
  provider_message_id?: string | null;
  spam_complaint?: boolean;
  error?: string;
}

export async function recordEvent(leadId: string, channel: Channel, partial: EventPartial): Promise<void> {
  const { error } = await db()
    .from('outreach_events')
    .insert({ lead_id: leadId, channel, ...partial });
  if (error) throw new Error(`recordEvent: ${error.message}`);
}
