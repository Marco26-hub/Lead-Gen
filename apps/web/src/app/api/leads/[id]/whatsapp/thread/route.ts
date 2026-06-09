import { getServiceClient, env, type LeadRow } from "@maps/core";
import { sendWhatsApp } from "@maps/core/whatsapp";

export const dynamic = "force-dynamic";

const WINDOW_MS = 24 * 60 * 60 * 1000; // Meta customer-service window for free-form replies.
const MAX_LEN = 4096;

interface WaMessage {
  id: string;
  direction: "in" | "out";
  body: string | null;
  media_url: string | null;
  created_at: string;
}

/** Latest inbound timestamp for the lead (drives the 24h free-form window). */
async function lastInboundAt(sb: ReturnType<typeof getServiceClient>, leadId: string): Promise<string | null> {
  const { data } = await sb
    .from("whatsapp_messages")
    .select("created_at")
    .eq("lead_id", leadId)
    .eq("direction", "in")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data as { created_at: string } | null)?.created_at ?? null;
}

function windowOpen(lastIn: string | null): boolean {
  return lastIn != null && Date.now() - new Date(lastIn).getTime() < WINDOW_MS;
}

/** GET → conversation thread + 24h free-form window state. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  const { id } = await params;
  const sb = getServiceClient();
  const { data, error } = await sb
    .from("whatsapp_messages")
    .select("id, direction, body, media_url, created_at")
    .eq("lead_id", id)
    .order("created_at", { ascending: true })
    .limit(200);
  if (error) {
    console.error("[wa-thread] load failed", error);
    return Response.json({ error: "Errore caricamento conversazione." }, { status: 500 });
  }
  const messages = (data ?? []) as WaMessage[];
  const lastIn = await lastInboundAt(sb, id);
  return Response.json({ messages, lastInboundAt: lastIn, windowOpen: windowOpen(lastIn) });
}

/** POST {text} → send a free-form reply (only inside the 24h window) and record it. */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  const { id } = await params;
  if (!env.WHATSAPP_PROVIDER) {
    return Response.json({ ok: false, error: "WhatsApp non configurato (WHATSAPP_PROVIDER)." }, { status: 400 });
  }

  const payload = (await req.json().catch(() => ({}))) as { text?: unknown };
  const text = typeof payload.text === "string" ? payload.text.trim() : "";
  if (!text) return Response.json({ ok: false, error: "Messaggio vuoto." }, { status: 400 });
  if (text.length > MAX_LEN) return Response.json({ ok: false, error: `Massimo ${MAX_LEN} caratteri.` }, { status: 400 });

  const sb = getServiceClient();
  const { data: leadRow } = await sb.from("leads").select("*").eq("id", id).maybeSingle();
  if (!leadRow) return Response.json({ ok: false, error: "Lead non trovato." }, { status: 404 });
  const lead = leadRow as LeadRow;

  const to = lead.phone_e164;
  if (!to) return Response.json({ ok: false, error: "Nessun numero mobile." }, { status: 400 });

  // Free-form is only deliverable inside the 24h window from the lead's last inbound message.
  // Outside it Meta requires an approved template → block here and let the UI point to the
  // "Invia WhatsApp" (demo template) button instead.
  const lastIn = await lastInboundAt(sb, id);
  if (!windowOpen(lastIn)) {
    return Response.json(
      { ok: false, error: "Finestra 24h chiusa: per scrivere a freddo serve un template approvato (usa 'Invia WhatsApp')." },
      { status: 409 },
    );
  }

  const r = await sendWhatsApp(to, text);
  if (r.error) return Response.json({ ok: false, error: r.error }, { status: 502 });

  // Message is already out over WhatsApp — if recording it fails, still report success (the send
  // happened) but log it so the missing thread row is diagnosable, and flag the UI to refetch.
  const { error: insErr } = await sb.from("whatsapp_messages").insert({
    lead_id: id,
    direction: "out",
    body: text,
    provider_message_id: r.id,
    wa_from: env.WHATSAPP_FROM.replace(/^whatsapp:/, ""),
    wa_to: to,
  });
  if (insErr) console.error("[wa-thread] outbound persist failed after send", insErr);

  return Response.json({ ok: true, id: r.id, ...(insErr ? { warning: "Inviato, ma non registrato nel thread." } : {}) });
}
