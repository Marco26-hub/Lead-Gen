import { NextResponse } from "next/server";

/**
 * Contact form endpoint. Validates server-side, persists the lead, and (if
 * Resend is configured) sends TWO emails: an HTML notification to the admin
 * and an HTML confirmation to the person who submitted the form. Env vars:
 *   RESEND_API_KEY     — Resend key (https://resend.com)
 *   CONTACT_TO_EMAIL   — where admin notifications land
 *   CONTACT_FROM_EMAIL — verified sender, e.g. "Social Web Automation <noreply@socialwebautomation.com>"
 * Without RESEND_API_KEY/CONTACT_TO_EMAIL it logs and returns
 * { ok: true, delivered: false } — the form still works, no email is sent.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const BRAND = "Social Web Automation";

/** Escape user input before interpolating into HTML. */
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

interface ContactFields {
  name: string;
  email: string;
  company: string;
  reason: string;
  budget: string;
  message: string;
}

/** HTML notification sent to the admin (CONTACT_TO_EMAIL). */
function adminHtml(f: ContactFields): string {
  const row = (label: string, value: string) => `
    <tr>
      <td style="padding:8px 14px;color:#64748b;font-size:13px;white-space:nowrap;vertical-align:top">${label}</td>
      <td style="padding:8px 14px;color:#0f172a;font-size:14px;font-weight:500">${value || "—"}</td>
    </tr>`;
  return `
  <div style="margin:0;padding:24px;background:#f1f5f9;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden">
      <div style="padding:18px 22px;background:#0f172a;color:#fff">
        <div style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#94a3b8">${esc(BRAND)}</div>
        <div style="font-size:18px;font-weight:600;margin-top:2px">Nuovo contatto dal sito</div>
      </div>
      <table style="width:100%;border-collapse:collapse;border-spacing:0">
        ${row("Nome", esc(f.name))}
        ${row("Email", `<a href="mailto:${esc(f.email)}" style="color:#2563eb;text-decoration:none">${esc(f.email)}</a>`)}
        ${row("Azienda", esc(f.company))}
        ${row("Motivo", esc(f.reason))}
        ${row("Budget", esc(f.budget))}
      </table>
      <div style="padding:14px 22px;border-top:1px solid #e2e8f0">
        <div style="color:#64748b;font-size:13px;margin-bottom:6px">Messaggio</div>
        <div style="color:#0f172a;font-size:14px;line-height:1.5;white-space:pre-wrap">${esc(f.message)}</div>
      </div>
      <div style="padding:12px 22px;background:#f8fafc;color:#94a3b8;font-size:12px">
        Rispondi a questa email per scrivere direttamente a ${esc(f.name)}.
      </div>
    </div>
  </div>`;
}

/** HTML confirmation sent to the person who submitted the form. */
function confirmationHtml(name: string, message: string): string {
  return `
  <div style="margin:0;padding:24px;background:#f1f5f9;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden">
      <div style="padding:20px 22px;background:#0f172a;color:#fff">
        <div style="font-size:18px;font-weight:600">${esc(BRAND)}</div>
      </div>
      <div style="padding:22px">
        <p style="margin:0 0 12px;color:#0f172a;font-size:15px">Ciao ${esc(name)},</p>
        <p style="margin:0 0 12px;color:#334155;font-size:14px;line-height:1.6">
          grazie per averci contattato! Abbiamo ricevuto il tuo messaggio e ti
          risponderemo al più presto.
        </p>
        <div style="margin:16px 0;padding:14px 16px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px">
          <div style="color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px">Il tuo messaggio</div>
          <div style="color:#0f172a;font-size:14px;line-height:1.5;white-space:pre-wrap">${esc(message)}</div>
        </div>
        <p style="margin:12px 0 0;color:#94a3b8;font-size:13px">— Il team di ${esc(BRAND)}</p>
      </div>
    </div>
  </div>`;
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    console.warn("[contact] invalid JSON body");
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim();
  const company = String(body.company ?? "").trim();
  const reason = String(body.reason ?? "").trim();
  const budget = String(body.budget ?? "").trim();
  const message = String(body.message ?? "").trim();

  if (!name || !EMAIL_RE.test(email) || message.length < 10) {
    return NextResponse.json({ ok: false, error: "validation" }, { status: 422 });
  }

  // Persist the lead into the SHARED public.leads table (same store as the
  // Google-Maps lead-gen pipeline) so every lead shows up in one place — the
  // /app dashboard — tagged source='website'. Best-effort: a DB hiccup (or
  // missing Supabase config) must never break the contact UX or the email.
  // status='inbound' keeps these out of the scraping pipeline (no stage
  // selects that status); place_id is left null (only Maps leads have one).
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const { getServiceClient } = await import("@maps/core");
      const notes = [
        `Nome: ${name}`,
        reason ? `Motivo: ${reason}` : null,
        budget ? `Budget: ${budget}` : null,
        "",
        message,
      ]
        .filter((l) => l !== null)
        .join("\n");
      const { error } = await getServiceClient()
        .from("leads")
        .insert({
          business_name: company || name,
          email,
          source: "website",
          status: "inbound",
          notes,
        });
      if (error) throw new Error(error.message);
    } catch (err) {
      console.error("[contact] lead persist failed", err);
    }
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from =
    process.env.CONTACT_FROM_EMAIL ?? `${BRAND} <onboarding@resend.dev>`;

  if (!apiKey || !to) {
    // Not a silent success: log loudly so the owner knows email isn't wired up.
    console.warn(
      "[contact] email not configured (set RESEND_API_KEY + CONTACT_TO_EMAIL); submission logged only:",
      { name, email, company, reason, budget, message },
    );
    return NextResponse.json({ ok: true, delivered: false });
  }

  const { sendEmail } = await import("@maps/core/email");
  const fields: ContactFields = { name, email, company, reason, budget, message };

  // 1) Admin notification (HTML). Reply goes straight to the submitter.
  let delivered = false;
  try {
    const r = await sendEmail({
      to,
      from,
      replyTo: email,
      subject: `Nuovo contatto dal sito — ${name}${company ? ` (${company})` : ""}`,
      html: adminHtml(fields),
    });
    if (r.error) console.error("[contact] admin email failed:", r.error);
    else delivered = true;
  } catch (err) {
    console.error("[contact] admin email exception", err);
  }

  // 2) Confirmation to the submitter (HTML). Best-effort: never fails the request.
  try {
    const r = await sendEmail({
      to: email,
      from,
      replyTo: to,
      subject: `Grazie per averci contattato — ${BRAND}`,
      html: confirmationHtml(name, message),
    });
    if (r.error) console.error("[contact] confirmation email failed:", r.error);
  } catch (err) {
    console.error("[contact] confirmation email exception", err);
  }

  return NextResponse.json({ ok: true, delivered });
}
