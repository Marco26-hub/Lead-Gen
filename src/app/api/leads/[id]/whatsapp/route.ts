import { getServiceClient, env, type LeadRow } from "@maps/core";
import { sendWhatsApp, buildDemoMessage } from "@maps/core/whatsapp";

export const dynamic = "force-dynamic";

/** Send the demo-offer over WhatsApp to one lead (or the test inbox in preview mode). */
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  const { id } = await params;
  if (!env.WHATSAPP_PROVIDER) {
    return Response.json({ ok: false, error: "WhatsApp non configurato (WHATSAPP_PROVIDER)." }, { status: 400 });
  }
  const sb = getServiceClient();
  const { data } = await sb.from("leads").select("*").eq("id", id).maybeSingle();
  if (!data) return Response.json({ ok: false, error: "Lead non trovato." }, { status: 404 });
  const lead = data as LeadRow;
  if (!lead.demo_url) return Response.json({ ok: false, error: "Genera prima la demo." }, { status: 400 });

  const testTo = env.OUTREACH_TEST_WHATSAPP;
  const to = testTo || lead.phone_e164;
  if (!to) return Response.json({ ok: false, error: "Nessun numero mobile." }, { status: 400 });

  const msg = buildDemoMessage(lead);
  const r = await sendWhatsApp(to, msg.body, { mediaUrl: msg.mediaUrl });
  if (r.error) {
    await sb.from("outreach_events").insert({ lead_id: id, channel: "whatsapp", template: "demo_offer", status: "failed", error: r.error });
    return Response.json({ ok: false, error: r.error }, { status: 500 });
  }
  await sb.from("outreach_events").insert({
    lead_id: id, channel: "whatsapp", template: "demo_offer", status: testTo ? "test" : "sent", provider_message_id: r.id,
  });
  if (!testTo) {
    await sb.from("leads").update({ status: "contacted", outreach_channel: "whatsapp", sent_at: new Date().toISOString() }).eq("id", id);
  }
  return Response.json({ ok: true, test: Boolean(testTo) });
}
