import { revalidatePath } from "next/cache";
import { getServiceClient, type LeadRow } from "@maps/core";
import { enrichLeadFromInstagram, mergeLeadPhotos } from "@maps/core/instagram";

export const dynamic = "force-dynamic";
// IG actor takes 30-120s per profile, plus N image rehosts. We use .start() +
// polling inside fetchInstagramMedia so the route can return a clean timeout
// error before the function is force-killed. 300s = Vercel Pro Node ceiling
// (Hobby caps at 60 and degrades to a clean error — the user can retry or run
// `pnpm pipeline:enrich-instagram` from the CLI for unbounded runs).
export const maxDuration = 300;
const FETCH_BUDGET_MS = 240_000; // leave ~60s headroom for rehosts + DB + revalidate

/**
 * Pull recent Instagram posts for this lead's known handle, rehost the images
 * into Supabase Storage, and PREPEND the public URLs into `leads.photos`.
 * Requires `instagram_handle` to be set on the lead (the scrape stage fills it
 * when the Maps actor surfaces a social link).
 */
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  const { id } = await params;
  const sb = getServiceClient();
  const { data, error } = await sb.from("leads").select("*").eq("id", id).maybeSingle();
  if (error) return Response.json({ ok: false, error: error.message }, { status: 500 });
  if (!data) return Response.json({ ok: false, error: "Lead non trovato." }, { status: 404 });
  const lead = data as LeadRow;

  if (!lead.instagram_handle) {
    return Response.json(
      { ok: false, error: "Nessun handle Instagram per questo lead." },
      { status: 400 },
    );
  }

  try {
    const r = await enrichLeadFromInstagram(lead.id, lead.instagram_handle, { timeoutMs: FETCH_BUDGET_MS });
    if (r.added === 0) {
      const firstErr = r.errors[0]?.msg ?? "Nessuna foto pubblica trovata.";
      return Response.json(
        { ok: false, error: firstErr, fetched: r.fetched, errors: r.errors },
        { status: 502 },
      );
    }
    const merged = mergeLeadPhotos(lead.photos, r.photos);
    const { error: upErr } = await sb.from("leads").update({ photos: merged }).eq("id", id);
    if (upErr) return Response.json({ ok: false, error: upErr.message }, { status: 500 });
    if (lead.slug) revalidatePath(`/d/${lead.slug}`);
    return Response.json({
      ok: true,
      added: r.added,
      total: merged.length,
      handle: lead.instagram_handle,
      errors: r.errors,
    });
  } catch (err) {
    return Response.json({ ok: false, error: (err as Error).message }, { status: 500 });
  }
}
