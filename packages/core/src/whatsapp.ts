import { env, requireEnv } from './config';
import { presetFromCategory } from './templates';
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
  /** Public HTTPS URL to an image/media attachment. <5MB JPEG/PNG/MP4. Twilio scarica + reinoltra. Ignorato se `contentSid` è settato. */
  mediaUrl?: string;
  /** Twilio Content Template SID (HX…). Se settato, invia il template approvato (ContentSid + ContentVariables) invece del Body free-form — richiesto per outreach business-initiated a freddo. */
  contentSid?: string;
  /** Variabili del template: mappa indice→valore, es. `{ "1": nome, "2": gap, "3": slug }`. */
  contentVariables?: Record<string, string>;
}

export async function sendWhatsApp(to: string, body: string, opts: SendWaOpts = {}): Promise<WaResult> {
  const sid = requireEnv('TWILIO_ACCOUNT_SID');
  const token = requireEnv('TWILIO_AUTH_TOKEN');
  const from = env.WHATSAPP_FROM;
  if (!from) return { id: null, error: 'WHATSAPP_FROM mancante' };

  const params = new URLSearchParams({ To: waAddr(to), From: waAddr(from) });
  if (opts.contentSid) {
    // Template approvato Meta: ContentSid + ContentVariables (niente Body/MediaUrl — la struttura è nel template).
    params.set('ContentSid', opts.contentSid);
    if (opts.contentVariables && Object.keys(opts.contentVariables).length > 0) {
      params.set('ContentVariables', JSON.stringify(opts.contentVariables));
    }
  } else {
    params.set('Body', body);
    if (opts.mediaUrl) params.set('MediaUrl', opts.mediaUrl);
  }
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
  /** Caption text shown sotto la media (o standalone se mediaUrl assente). Fallback free-form quando non c'è template approvato. */
  body: string;
  /** URL screenshot della hero — endpoint OG /api/og/[slug]. Usato solo nel path free-form. */
  mediaUrl?: string;
  /** Content Template SID approvato per il vertical del lead (se configurato in env). Quando presente, `sendWhatsApp` invia il template. */
  contentSid?: string;
  /** Variabili del template demo-offer: `{ "1": business_name, "2": gap, "3": slug }`. */
  contentVariables?: Record<string, string>;
}

/**
 * Content Template SID demo-offer per il vertical del lead (mappato dal preset di categoria).
 * Stringa vuota se non configurato in env → il caller fa fallback al free-form.
 */
function demoContentSidFor(lead: LeadRow): string {
  const preset = presetFromCategory(lead.category);
  if (preset === 'restaurant') return env.TWILIO_CONTENT_SID_RISTORANTE;
  if (preset === 'beauty') return env.TWILIO_CONTENT_SID_SALONE;
  return env.TWILIO_CONTENT_SID_ARTIGIANO; // artigiano = generico "servizi" per gli altri preset
}

/**
 * Italian WhatsApp demo-offer message with opt-out.
 * Se per il vertical del lead è configurato un Content Template approvato (e c'è lo slug per il
 * bottone URL), restituisce `{contentSid, contentVariables}` → invio business-initiated a freddo.
 * Altrimenti `{body, mediaUrl}` free-form (consegna solo nella finestra 24h customer-initiated).
 */
export function buildDemoMessage(lead: LeadRow): DemoMessage {
  const gap =
    lead.site_age_class === 'none'
      ? 'la vostra attività non ha ancora un sito web'
      : 'il vostro sito attuale può essere modernizzato';
  // Link informativa privacy (art. 14) nel primo contatto — solo se PRIVACY_URL è configurato.
  // NB: riguarda solo il body free-form; i template approvati Meta vanno aggiornati in Twilio/Meta console.
  const privacyLine = env.PRIVACY_URL ? `\nInformativa privacy: ${env.PRIVACY_URL}` : '';
  const body =
    `Buongiorno ${lead.business_name}! Ho notato che ${gap}. ` +
    `Ho preparato un'anteprima gratuita di come potrebbe apparire un sito moderno per voi: ${lead.demo_url}\n\n` +
    `Se vi interessa, resto a disposizione. (Per non ricevere altri messaggi, rispondete STOP)` +
    privacyLine;
  // OG screenshot endpoint — popolato solo se abbiamo uno slug.
  const mediaUrl = lead.slug ? `${env.PUBLIC_BASE_URL}/api/og/${lead.slug}` : undefined;

  // Template approvato disponibile + slug (serve per il bottone URL https://…/d/{{3}}) → usa ContentSid.
  const contentSid = demoContentSidFor(lead);
  if (contentSid && lead.slug) {
    return {
      body,
      mediaUrl,
      contentSid,
      contentVariables: { '1': lead.business_name, '2': gap, '3': lead.slug },
    };
  }
  return { body, mediaUrl };
}
