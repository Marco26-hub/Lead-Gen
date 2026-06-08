import { NextResponse } from "next/server";

/**
 * Contact form endpoint. Validates server-side and, if a Resend API key is
 * configured, sends the enquiry by email. Set these env vars on Vercel to
 * actually receive messages:
 *   RESEND_API_KEY     — your Resend key (https://resend.com)
 *   CONTACT_TO_EMAIL   — where enquiries should land
 *   CONTACT_FROM_EMAIL — verified sender, e.g. "Aether <hello@yourdomain.com>"
 * Without a key it logs the submission and returns { ok: true, delivered:
 * false } — the form works, but no email is sent (surfaced in server logs).
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
  const from = process.env.CONTACT_FROM_EMAIL ?? "Aether <onboarding@resend.dev>";

  if (!apiKey || !to) {
    // Not a silent success: log loudly so the owner knows email isn't wired up.
    console.warn(
      "[contact] email not configured (set RESEND_API_KEY + CONTACT_TO_EMAIL); submission logged only:",
      { name, email, company, reason, budget, message },
    );
    return NextResponse.json({ ok: true, delivered: false });
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email,
        subject: `New enquiry — ${name}${company ? ` (${company})` : ""}`,
        text: [
          `Name: ${name}`,
          `Email: ${email}`,
          `Company: ${company || "—"}`,
          `Reason: ${reason || "—"}`,
          `Budget: ${budget || "—"}`,
          "",
          message,
        ].join("\n"),
      }),
    });
    if (!res.ok) {
      console.error("[contact] Resend error", res.status, await res.text());
      return NextResponse.json({ ok: false, error: "send_failed" }, { status: 502 });
    }
  } catch (err) {
    console.error("[contact] Resend exception", err);
    return NextResponse.json({ ok: false, error: "send_failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true, delivered: true });
}
