import { getServiceClient } from "@maps/core";

export const dynamic = "force-dynamic";

function page(msg: string, status: number): Response {
  return new Response(
    `<!doctype html><html lang="it"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>Iscrizione</title></head>
<body style="font-family:system-ui;background:#0a0a0a;color:#e5e5e5;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0">
<div style="max-width:420px;text-align:center;padding:24px">
<h1 style="font-size:20px">${msg}</h1></div></body></html>`,
    { status, headers: { "content-type": "text/html; charset=utf-8" } },
  );
}

export async function GET(req: Request): Promise<Response> {
  const token = new URL(req.url).searchParams.get("token");
  if (!token) return page("Token mancante.", 400);

  const sb = getServiceClient();
  const { data } = await sb
    .from("leads")
    .select("id, email, phone_e164")
    .eq("unsubscribe_token", token)
    .maybeSingle();
  if (!data) return page("Link non valido o scaduto.", 404);

  await sb.from("leads").update({ status: "unsubscribed" }).eq("id", data.id);
  // idempotent: a duplicate row trips the unique index — ignore that error.
  await sb.from("unsubscribes").insert({ email: data.email, phone: data.phone_e164, source: "link" });

  return page("Iscrizione annullata. Non riceverai più comunicazioni. ✓", 200);
}
