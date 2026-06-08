import { env, requireEnv } from './config';
import type { LeadRow } from './types';

/**
 * WhatsApp sending via Twilio (works with the Twilio WhatsApp Sandbox for testing).
 * Imported as `@maps/core/whatsapp`. OFF unless WHATSAPP_PROVIDER + Twilio creds are set.
 */

export interface WaResult {
  id: string | null;
  error?: string;
}

function waAddr(n: string): string {
  return n.startsWith('whatsapp:') ? n : `whatsapp:${n}`;
}

export interface SendWaOpts {
  /** Public HTTPS URL to an image/media attachment. <5MB JPEG/PNG/MP4. Twilio scarica + reinoltra. */
  mediaUrl?: string;
}

export async function sendWhatsApp(to: string, body: string, opts: SendWaOpts = {}): Promise<WaResult> {
  const sid = requireEnv('TWILIO_ACCOUNT_SID');
  const token = requireEnv('TWILIO_AUTH_TOKEN');
  const from = env.WHATSAPP_FROM;
  if (!from) return { id: null, error: 'WHATSAPP_FROM mancante' };

  const params = new URLSearchParams({ To: waAddr(to), From: waAddr(from), Body: body });
  if (opts.mediaUrl) params.set('MediaUrl', opts.mediaUrl);
  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${btoa(`${sid}:${token}`)}`,
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });
  const data = (await res.json().catch(() => ({}))) as { sid?: string; message?: string };
  if (!res.ok) return { id: null, error: data.message ?? `HTTP ${res.status}` };
  return { id: data.sid ?? null };
}

export interface DemoMessage {
  /** Caption text shown sotto la media (o standalone se mediaUrl assente). */
  body: string;
  /** URL screenshot della hero — endpoint OG /api/og/[slug]. */
  mediaUrl?: string;
}

/**
 * Italian WhatsApp demo-offer message with opt-out.
 * Restituisce `{body, mediaUrl}` per supportare invio ricco (screenshot + caption).
 * Il caller passa `mediaUrl` a `sendWhatsApp`.
 */
export function buildDemoMessage(lead: LeadRow): DemoMessage {
  const gap =
    lead.site_age_class === 'none'
      ? 'la vostra attività non ha ancora un sito web'
      : 'il vostro sito attuale può essere modernizzato';
  const body =
    `Buongiorno ${lead.business_name}! Ho notato che ${gap}. ` +
    `Ho preparato un'anteprima gratuita di come potrebbe apparire un sito moderno per voi: ${lead.demo_url}\n\n` +
    `Se vi interessa, resto a disposizione. (Per non ricevere altri messaggi, rispondete STOP)`;
  // OG screenshot endpoint — popolato solo se abbiamo uno slug.
  const mediaUrl = lead.slug ? `${env.PUBLIC_BASE_URL}/api/og/${lead.slug}` : undefined;
  return { body, mediaUrl };
}
