import { getServiceClient, env } from "@maps/core";

export const dynamic = "force-dynamic";

/**
 * Resend event webhook: bounced → suppress, complained → spam_complaint + suppress,
 * delivered/opened → status update. NOTE: production should verify the Svix signature;
 * here we optionally require a shared secret if RESEND_WEBHOOK_SECRET is set.
 */
export async function POST(req: Request): Promise<Response> {
  if (env.RESEND_WEBHOOK_SECRET) {
    const provided =
      req.headers.get("x-webhook-secret") ?? new URL(req.url).searchParams.get("secret");
    if (provided !== env.RESEND_WEBHOOK_SECRET) {
      return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }
  }

  let evt: { type?: string; data?: Record<string, unknown> };
  try {
    evt = await req.json();
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }

  const type = evt.type;
  const d = (evt.data ?? {}) as Record<string, unknown>;
  const messageId = (d.email_id ?? d.id ?? null) as string | null;
  const toField = d.to;
  const email = (Array.isArray(toField) ? toField[0] : (toField ?? d.email ?? null)) as string | null;
  const sb = getServiceClient();

  if (type === "email.complained") {
    if (messageId)
      await sb
        .from("outreach_events")
        .update({ spam_complaint: true, status: "complained" })
        .eq("provider_message_id", messageId);
    if (email) {
      await sb.from("unsubscribes").insert({ email, source: "complaint" });
      await sb.from("leads").update({ status: "suppressed" }).eq("email", email);
    }
  } else if (type === "email.bounced") {
    if (messageId)
      await sb.from("outreach_events").update({ status: "bounced" }).eq("provider_message_id", messageId);
    if (email) await sb.from("leads").update({ status: "bounced" }).eq("email", email);
  } else if (type === "email.delivered") {
    if (messageId)
      await sb.from("outreach_events").update({ status: "delivered" }).eq("provider_message_id", messageId);
  } else if (type === "email.opened") {
    if (messageId)
      await sb.from("outreach_events").update({ status: "opened" }).eq("provider_message_id", messageId);
  }

  return Response.json({ ok: true });
}
