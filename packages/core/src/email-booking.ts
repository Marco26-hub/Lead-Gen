import { env } from './config';

/**
 * Email transazionali per il BookingForm sulle demo pubbliche.
 * Sia il titolare (notifica nuova prenotazione) sia il cliente finale (receipt)
 * ricevono una mail tramite Resend (chiamata dall'API route `/api/d/[slug]/book`).
 *
 * Modulo separato dalle email outreach (demo-offer in
 * `packages/orchestrator/src/outreach/email-templates.ts`) perché:
 *   - sono transazionali (no unsubscribe footer)
 *   - vivono in `core` così sono importabili anche da `apps/web`.
 */

export interface BookingNotificationInput {
  businessName: string;
  /** Human-readable kind: "Prenotazione", "Appuntamento", "Richiesta preventivo", "Contatto". */
  kindLabel: string;
  /** "12 Marzo · 20:30 · 4 coperti" — pre-formatted line. */
  whenLine: string;
  service?: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  customerMessage?: string;
}

/** Email al titolare: "nuova prenotazione/richiesta da Tizio". */
export function emailBookingNotification(i: BookingNotificationInput): { subject: string; html: string } {
  // Subject: rimuovi CR/LF (defense-in-depth vs header injection se mai un
  // mailer downstream non sanitizzasse — Resend lo fa, ma costo zero).
  const subject = stripCrlf(`${i.kindLabel} ricevuta — ${i.customerName}`);
  const rows: string[] = [];
  rows.push(row('Tipo', i.kindLabel));
  if (i.whenLine) rows.push(row('Quando', i.whenLine));
  if (i.service) rows.push(row('Servizio', i.service));
  rows.push(row('Nome', i.customerName));
  if (i.customerPhone)
    rows.push(row('Telefono', `<a href="tel:${escapeAttr(i.customerPhone)}">${escapeHtml(i.customerPhone)}</a>`));
  if (i.customerEmail)
    rows.push(row('Email', `<a href="mailto:${escapeAttr(i.customerEmail)}">${escapeHtml(i.customerEmail)}</a>`));
  if (i.customerMessage) rows.push(row('Messaggio', escapeHtml(i.customerMessage)));

  const body = `
    <p style="margin:0 0 16px;font-size:16px"><strong>Nuova ${escapeHtml(i.kindLabel.toLowerCase())}</strong> dal sito di
      <strong>${escapeHtml(i.businessName)}</strong>.</p>
    <table cellpadding="0" cellspacing="0" style="border-collapse:collapse;width:100%;margin:0 0 8px">
      ${rows.join('')}
    </table>
    <p style="margin:18px 0 0;font-size:12px;color:#71717a">Rispondi direttamente al cliente per confermare.</p>
  `;
  return { subject, html: shellPlain(body) };
}

export interface BookingClientReceiptInput {
  businessName: string;
  customerName: string;
  kindLabel: string;
  whenLine: string;
  service?: string;
  businessPhone?: string;
}

/** Email al cliente finale: "abbiamo ricevuto la tua richiesta". */
export function emailBookingClientReceipt(i: BookingClientReceiptInput): { subject: string; html: string } {
  const subject = stripCrlf(`Abbiamo ricevuto la tua richiesta — ${i.businessName}`);
  const body = `
    <p style="margin:0 0 16px">Ciao ${escapeHtml(i.customerName)},</p>
    <p style="margin:0 0 16px">grazie per averci scritto. Abbiamo ricevuto la tua ${escapeHtml(i.kindLabel.toLowerCase())} per
      <strong>${escapeHtml(i.businessName)}</strong>.</p>
    ${i.whenLine ? `<p style="margin:0 0 16px"><strong>Quando:</strong> ${escapeHtml(i.whenLine)}</p>` : ''}
    ${i.service ? `<p style="margin:0 0 16px"><strong>Servizio:</strong> ${escapeHtml(i.service)}</p>` : ''}
    <p style="margin:0 0 16px">Ti ricontatteremo a breve per confermare.${
      i.businessPhone
        ? ` Per modifiche urgenti chiama il <a href="tel:${escapeAttr(i.businessPhone)}">${escapeHtml(i.businessPhone)}</a>.`
        : ''
    }</p>
    <p style="margin:0">A presto,<br><strong>${escapeHtml(i.businessName)}</strong></p>
  `;
  return { subject, html: shellPlain(body) };
}

function row(label: string, value: string): string {
  return `<tr>
    <td style="padding:6px 12px 6px 0;color:#71717a;font-size:13px;vertical-align:top;width:140px">${escapeHtml(label)}</td>
    <td style="padding:6px 0;font-size:14px;color:#18181b">${value}</td>
  </tr>`;
}

function shellPlain(inner: string): string {
  const sender = env.SENDER_NAME || 'Social Web Automation';
  return `<!doctype html>
<html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;color:#18181b">
  <div style="max-width:560px;margin:0 auto;padding:24px">
    <div style="background:#fff;border-radius:16px;padding:28px;font-size:15px;line-height:1.55">
      ${inner}
    </div>
    <div style="text-align:center;color:#a1a1aa;font-size:11px;line-height:1.6;padding:16px 8px">
      Email transazionale · ${escapeHtml(sender)}
    </div>
  </div>
</body></html>`;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

function escapeAttr(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

/** Collassa CR/LF in singolo spazio — usato sui Subject di email. */
function stripCrlf(s: string): string {
  return s.replace(/[\r\n]+/g, ' ').trim();
}
