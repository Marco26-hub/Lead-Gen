import { getServiceClient, env } from "@maps/core";
import { fetchDatasetItems, mapApifyItem, upsertLeads } from "@maps/core/scrape";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Apify run-completion webhook: fetch the dataset, upsert leads, finalize the job. */
export async function POST(req: Request): Promise<Response> {
  const url = new URL(req.url);
  if (env.APIFY_WEBHOOK_SECRET && url.searchParams.get("secret") !== env.APIFY_WEBHOOK_SECRET) {
    return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const jobId = url.searchParams.get("job");

  let payload: { resource?: { defaultDatasetId?: string; status?: string }; eventType?: string };
  try {
    payload = await req.json();
  } catch {
    payload = {};
  }

  const sb = getServiceClient();
  const job = jobId ? (await sb.from("scrape_jobs").select("*").eq("id", jobId).maybeSingle()).data : null;

  const datasetId = payload.resource?.defaultDatasetId ?? (job?.dataset_id as string | undefined) ?? null;
  const statusText = `${payload.resource?.status ?? ""} ${payload.eventType ?? ""}`;
  const failed = /FAIL|ABORT|TIMED/i.test(statusText);

  if (failed || !datasetId) {
    if (jobId) await sb.from("scrape_jobs").update({ status: "error", error: `run: ${statusText.trim() || "no dataset"}` }).eq("id", jobId);
    return Response.json({ ok: true });
  }

  try {
    const items = await fetchDatasetItems(datasetId);
    const places = items.map((it) => mapApifyItem(it as Record<string, unknown>)).filter((p) => p.placeId && p.title);
    const result = await upsertLeads(places, (job?.category as string) ?? "", (job?.city as string) ?? "");
    if (jobId)
      await sb.from("scrape_jobs").update({ status: "done", lead_count: result.advanced, dataset_id: datasetId }).eq("id", jobId);
    return Response.json({ ok: true, advanced: result.advanced });
  } catch (e) {
    if (jobId) await sb.from("scrape_jobs").update({ status: "error", error: (e as Error).message }).eq("id", jobId);
    return Response.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
