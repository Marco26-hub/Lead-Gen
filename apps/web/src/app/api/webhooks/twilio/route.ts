import { getServiceClient } from "@maps/core";

export const dynamic = "force-dynamic";

/** Twilio inbound WhatsApp webhook: handle STOP → suppress the number. */
export async function POST(req: Request): Promise<Response> {
  const form = await req.formData().catch(() => null);
  const from = String(form?.get("From") ?? "").replace("whatsapp:", "").trim();
  const body = String(form?.get("Body") ?? "").trim().toLowerCase();

  if (from && /\b(stop|cancella|disiscrivi|unsubscribe)\b/.test(body)) {
    const sb = getServiceClient();
    await sb.from("unsubscribes").insert({ phone: from, source: "whatsapp_stop" });
    await sb.from("leads").update({ status: "unsubscribed" }).eq("phone_e164", from);
  }

  return new Response('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
    headers: { "content-type": "text/xml" },
  });
}
