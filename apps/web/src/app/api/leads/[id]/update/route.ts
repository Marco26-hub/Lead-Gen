import { revalidatePath } from "next/cache";
import { getServiceClient } from "@maps/core";
import { isSafeImageUrl } from "@maps/core/storage";
import { isTemplateKey } from "@/leadgen/components/demo/templates/catalog";

export const dynamic = "force-dynamic";

const ALLOWED_STATUS = new Set([
  "scraped", "enriched", "classified", "generated", "deployed", "approved",
  "queued_outreach", "contacted", "replied", "unsubscribed", "bounced", "suppressed",
]);

/** Mini-CRM: update a lead's status, notes, email, or demo template. */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  const { id } = await params;
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: "JSON non valido" }, { status: 400 });
  }

  const patch: Record<string, unknown> = {};
  if (typeof body.notes === "string") patch.notes = body.notes;
  if (typeof body.email === "string") patch.email = body.email.trim() || null;
  if (typeof body.status === "string" && ALLOWED_STATUS.has(body.status)) patch.status = body.status;
  if (typeof body.phone_e164 === "string") {
    const v = body.phone_e164.trim().replace(/\s+/g, "");
    if (v === "") patch.phone_e164 = null;
    else if (/^\+\d{6,15}$/.test(v)) patch.phone_e164 = v;
    else return Response.json({ ok: false, error: "Numero non valido — usa il formato E.164, es. +393476859658." }, { status: 400 });
  }
  if (typeof body.phone_type === "string") {
    if (body.phone_type === "") patch.phone_type = null;
    else if (["mobile", "fixed", "other"].includes(body.phone_type)) patch.phone_type = body.phone_type;
  }
  if (typeof body.template === "string" && isTemplateKey(body.template)) patch.template = body.template;
  if (Array.isArray(body.photos)) {
    // Reorder/curate photos — hero is photos[0], gallery is slice(1, 9) in every
    // template. Validazione host: `isSafeImageUrl` accetta solo https + hostname
    // nella allowlist (Google CDN / Meta CDN / nostro bucket Supabase). Anche se
    // questo route è admin-protected, il filtro previene che URL non-public
    // (http://, internal IPs, third-party trackers) finiscano in `leads.photos`,
    // visto che vengono poi server-fetched dall'OG endpoint (next/og) e
    // server-fetched da Twilio come WhatsApp MediaUrl. Dedupe + cap 20.
    const seen = new Set<string>();
    const cleaned: string[] = [];
    for (const u of body.photos) {
      if (typeof u !== "string") continue;
      const url = u.trim();
      if (!url || seen.has(url) || !isSafeImageUrl(url)) continue;
      seen.add(url);
      cleaned.push(url);
      if (cleaned.length >= 20) break;
    }
    patch.photos = cleaned;
  }
  if (Object.keys(patch).length === 0) return Response.json({ ok: false, error: "Niente da aggiornare." }, { status: 400 });

  const sb = getServiceClient();
  const { error } = await sb.from("leads").update(patch).eq("id", id);
  if (error) return Response.json({ ok: false, error: error.message }, { status: 500 });

  // Template/photo edits are layout-level (no LLM): refresh the public demo immediately.
  if (patch.template !== undefined || patch.photos !== undefined) {
    const { data } = await sb.from("leads").select("slug").eq("id", id).maybeSingle();
    if (data?.slug) revalidatePath(`/d/${data.slug as string}`);
  }
  return Response.json({ ok: true });
}
