import { env } from '@maps/core';

export interface DemoOfferInput {
  businessName: string;
  siteGap: string;
  demoUrl: string;
  unsubscribeUrl: string;
}

/** Compliant Italian demo-offer email: references the site gap, links the demo, real unsubscribe + legal footer. */
export function emailDemoOffer(i: DemoOfferInput): { subject: string; html: string } {
  const subject = `Una proposta per il sito di ${i.businessName}`;
  const body = `
    <p style="margin:0 0 16px">Buongiorno,</p>
    <p style="margin:0 0 16px">
      ho dato un'occhiata alla presenza online di <strong>${escapeHtml(i.businessName)}</strong> e ho notato che
      ${escapeHtml(i.siteGap)}.
    </p>
    <p style="margin:0 0 16px">
      Ho preparato una <strong>bozza gratuita</strong> di come potrebbe apparire un sito moderno, ottimizzato per
      smartphone e per i motori di ricerca. Puoi vederla qui:
    </p>
    <p style="margin:0 0 24px">
      <a href="${i.demoUrl}" style="display:inline-block;background:#5b6cff;color:#fff;text-decoration:none;
        padding:12px 22px;border-radius:9999px;font-weight:600">Guarda l'anteprima →</a>
    </p>
    <p style="margin:0 0 8px">Se è di suo interesse, rispondo volentieri a qualsiasi domanda.</p>
  `;
  return { subject, html: shell(body, i.unsubscribeUrl) };
}

function shell(inner: string, unsubscribeUrl: string): string {
  const sender = env.SENDER_NAME || 'Mittente';
  const addr = env.SENDER_ADDRESS ? `${escapeHtml(env.SENDER_ADDRESS)} · ` : '';
  const vat = env.SENDER_VAT ? `P.IVA ${escapeHtml(env.SENDER_VAT)}` : '';
  // Link informativa privacy (art. 14) — mostrato solo se PRIVACY_URL è configurato.
  const privacy = env.PRIVACY_URL
    ? `<div style="margin-top:6px"><a href="${escapeHtml(env.PRIVACY_URL)}" style="color:#71717a">Informativa privacy</a></div>`
    : '';
  return `<!doctype html>
<html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;color:#18181b">
  <div style="max-width:560px;margin:0 auto;padding:24px">
    <div style="background:#fff;border-radius:16px;padding:28px;font-size:15px;line-height:1.55">
      ${inner}
    </div>
    <div style="text-align:center;color:#71717a;font-size:12px;line-height:1.6;padding:16px 8px">
      <div>${escapeHtml(sender)} · ${addr}${vat}</div>
      <div style="margin-top:6px">
        Ricevi questa email come comunicazione commerciale B2B a un indirizzo aziendale.
        <a href="${unsubscribeUrl}" style="color:#71717a">Annulla l'iscrizione</a>.
      </div>
      ${privacy}
    </div>
  </div>
</body></html>`;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}
