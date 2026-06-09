import { createHmac, timingSafeEqual } from "node:crypto";
import { getServiceClient, env } from "@maps/core";
import { sendEmail } from "@maps/core/email";

export const dynamic = "force-dynamic";

const STOP_RE = /\b(stop|cancella|disiscrivi|unsubscribe|annulla)\b/;
const MAX_BODY = 4096;
const TWIML_OK = '<?xml version="1.0" encoding="UTF-8"?><Response></Response>';

function twiml(): Response {
  return new Response(TWIML_OK, { headers: { "content-type": "text/xml" } });
}

function stripWa(n: string): string {
  return n.replace(/^whatsapp:/, "").trim();
}

/**
 * Validate Twilio's X-Twilio-Signature against the canonical webhook URL + POST params.
 * Twilio signs: url + (params sorted by key, concatenated as key+value), HMAC-SHA1 with the
 * auth token, base64. The URL must match exactly what Twilio called → we use the canonical
 * PUBLIC_BASE_URL form (Step 0 sets the sender's inbound webhook to this exact URL).
 */
function signatureValid(params: Record<string, string>, header: string | null): boolean {
  const token = env.TWILIO_AUTH_TOKEN;
  if (!token || !header) return false;
  const url = `${env.PUBLIC_BASE_URL}/api/webhooks/twilio`;
  const data = url + Object.keys(params).sort().map((k) => k + params[k]).join("");
  const expected = createHmac("sha1", token).update(Buffer.from(data, "utf-8")).digest("base64");
  const a = Buffer.from(expected);
  const b = Buffer.from(header);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Only persist a media URL we trust — Twilio serves WhatsApp media from *.twilio.com over https. */
function safeMediaUrl(raw: string | null): string | null {
  if (!raw) return null;
  try {
    const u = new URL(raw);
    if (u.protocol !== "https:") return null;
    return u.hostname === "api.twilio.com" || u.hostname.endsWith(".twilio.com") ? raw : null;
  } catch {
    return null;
  }
}

/** Twilio inbound WhatsApp webhook: persist the reply, advance the lead, honour STOP. */
export async function POST(req: Request): Promise<Response> {
  const form = await req.formData().catch(() => null);
  if (!form) return twiml();

  const params: Record<string, string> = {};
  for (const [k, v] of form.entries()) if (typeof v === "string") params[k] = v;

  // Signature check. Fail-OPEN only for *recording* the message (we must never drop a real inbound
  // over a URL/proxy mismatch we can't live-test); every STATE mutation below requires a VALID
  // signature so a spoofed request can't unsubscribe or re-status a lead. Set TWILIO_VALIDATE_INBOUND=1
  // to also reject unverified requests outright (403) once the logs confirm signatures validate.
  const sigHeader = req.headers.get("x-twilio-signature");
  const valid = signatureValid(params, sigHeader);
  if (!valid) {
    console.warn("[twilio-webhook] invalid/absent signature");
    if (process.env.TWILIO_VALIDATE_INBOUND === "1") return new Response("forbidden", { status: 403 });
  }

  const from = stripWa(params.From ?? "");
  const to = stripWa(params.To ?? "");
  const body = (params.Body ?? "").trim().slice(0, MAX_BODY);
  const messageSid = params.MessageSid || params.SmsMessageSid || params.SmsSid || null;
  const numMedia = Number.parseInt(params.NumMedia ?? "0", 10) || 0;
  const mediaUrl = numMedia > 0 ? safeMediaUrl(params.MediaUrl0 ?? null) : null;
  const ownNumber = stripWa(env.WHATSAPP_FROM);

  // Ignore status callbacks / our own number / contentless payloads / SID-less payloads (no real
  // customer message; a null SID can't dedupe on the UNIQUE provider_message_id → would duplicate).
  if (!from || !messageSid || (ownNumber && from === ownNumber) || (!body && !mediaUrl)) return twiml();

  const sb = getServiceClient();

  // Match the lead by stored E.164 phone. May be null (unknown sender) — we still record the
  // message so a hot lead on a different number is never silently dropped.
  const { data: leadRow } = await sb
    .from("leads")
    .select("id, business_name, status")
    .eq("phone_e164", from)
    .maybeSingle();
  const lead = leadRow as { id: string; business_name: string; status: string } | null;

  // Record the inbound message (idempotent on Twilio's MessageSid → safe on webhook retries).
  // On a persist failure, return 5xx (no TwiML) so Twilio retries rather than silently losing it.
  const { error: upsertErr } = await sb.from("whatsapp_messages").upsert(
    {
      lead_id: lead?.id ?? null,
      direction: "in",
      body: body || null,
      media_url: mediaUrl,
      provider_message_id: messageSid,
      wa_from: from,
      wa_to: to || null,
    },
    { onConflict: "provider_message_id", ignoreDuplicates: true },
  );
  if (upsertErr) {
    console.error("[twilio-webhook] persist failed", upsertErr);
    return new Response("retry", { status: 500 });
  }

  // From here on we mutate lead/suppression state and notify a human — only on a VERIFIED signature.
  // (The message is already safely recorded above for the operator to see in the CRM thread.)
  if (!valid) return twiml();

  if (STOP_RE.test(body.toLowerCase())) {
    await sb.from("unsubscribes").insert({ phone: from, source: "whatsapp_stop" });
    await sb.from("leads").update({ status: "unsubscribed" }).eq("phone_e164", from);
    return twiml();
  }

  if (lead) {
    // Advance to `replied` ONLY from an active-outreach state — never clobber a
    // paying/trialing/unsubscribed lead. Filtered in the WHERE so it's race-free.
    await sb
      .from("leads")
      .update({ status: "replied" })
      .eq("id", lead.id)
      .in("status", ["contacted", "queued_outreach"]);
  }

  // Optional: ping a human inbox so replies aren't missed. Best-effort, never fails the webhook.
  const notify = process.env.WHATSAPP_NOTIFY_EMAIL?.trim();
  if (notify && env.RESEND_API_KEY) {
    const who = lead?.business_name ?? from;
    const preview = (body || (mediaUrl ? "[media]" : "")).slice(0, 500);
    await sendEmail({
      to: notify,
      subject: `WhatsApp: risposta da ${who}`,
      html:
        `<p><strong>${escapeHtml(who)}</strong> (${escapeHtml(from)}) ha risposto su WhatsApp:</p>` +
        `<blockquote>${escapeHtml(preview)}</blockquote>` +
        (lead ? `<p>Apri il lead nella dashboard per rispondere entro la finestra di 24h.</p>` : `<p>Numero non associato a un lead.</p>`),
    }).catch((e) => console.error("[twilio-webhook] forward email failed", e));
  }

  return twiml();
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));
}
