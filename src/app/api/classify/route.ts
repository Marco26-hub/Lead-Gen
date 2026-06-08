import { classifyBatch } from "@maps/core/classify";

export const dynamic = "force-dynamic";
export const maxDuration = 26;

/** Classify a small batch of `scraped` leads (web has a short function timeout — click repeatedly). */
export async function POST(req: Request): Promise<Response> {
  let body: { limit?: number } = {};
  try {
    body = await req.json();
  } catch {
    // empty body ok
  }
  const limit = Math.min(Math.max(Number(body.limit) || 6, 1), 10);
  try {
    const result = await classifyBatch(limit);
    return Response.json({ ok: true, processed: result.processed, advanced: result.advanced });
  } catch (e) {
    return Response.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
