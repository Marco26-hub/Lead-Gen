import { getServiceClient, env } from "@maps/core";
import { startScrapeRun, type ScrapeParams } from "@maps/core/scrape";

export const dynamic = "force-dynamic";
export const maxDuration = 26;

export async function POST(req: Request): Promise<Response> {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: "JSON non valido" }, { status: 400 });
  }

  const city = String(body.city ?? "").trim();
  const category = String(body.category ?? "").trim();
  if (!city || !category) return Response.json({ ok: false, error: "Città e categoria richieste." }, { status: 400 });

  const limit = Math.min(Math.max(Number(body.limit) || 10, 1), 120);
  const enrichContacts = Boolean(body.enrichContacts);
  const wf = String(body.websiteFilter ?? "all");
  const websiteFilter = (["all", "with", "without"].includes(wf) ? wf : "all") as ScrapeParams["websiteFilter"];
  const params: ScrapeParams = { city, category, limit, enrichContacts, websiteFilter };

  const sb = getServiceClient();
  const { data: job, error: jErr } = await sb
    .from("scrape_jobs")
    .insert({ city, category, params, status: "pending" })
    .select("id")
    .single();
  if (jErr || !job) return Response.json({ ok: false, error: jErr?.message ?? "job" }, { status: 500 });

  const secret = env.APIFY_WEBHOOK_SECRET;
  const webhookUrl =
    `${env.PUBLIC_BASE_URL}/api/webhooks/apify?job=${job.id}` + (secret ? `&secret=${encodeURIComponent(secret)}` : "");

  try {
    const { runId, datasetId } = await startScrapeRun(params, webhookUrl);
    await sb.from("scrape_jobs").update({ apify_run_id: runId, dataset_id: datasetId, status: "running" }).eq("id", job.id);
    return Response.json({ ok: true, jobId: job.id, runId });
  } catch (e) {
    await sb.from("scrape_jobs").update({ status: "error", error: (e as Error).message }).eq("id", job.id);
    return Response.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
