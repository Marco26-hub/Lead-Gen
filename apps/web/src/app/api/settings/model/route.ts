import { setFlag, LLM_MODEL_KEY } from "@maps/core";

export const dynamic = "force-dynamic";

export async function POST(req: Request): Promise<Response> {
  let body: { model?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: "JSON non valido" }, { status: 400 });
  }
  const model = body.model;
  if (typeof model !== "string" || model.trim().length === 0) {
    return Response.json({ ok: false, error: "model mancante" }, { status: 400 });
  }
  await setFlag(LLM_MODEL_KEY, { model: model.trim() });
  return Response.json({ ok: true });
}
