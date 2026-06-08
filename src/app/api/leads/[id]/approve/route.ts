import { getServiceClient } from "@maps/core";

export const dynamic = "force-dynamic";

/** Human approval gate: generated → approved. Only approved leads are eligible for outreach. */
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  const { id } = await params;
  const sb = getServiceClient();
  const { data, error } = await sb
    .from("leads")
    .update({ status: "approved" })
    .eq("id", id)
    .eq("status", "generated")
    .select("id")
    .maybeSingle();
  if (error) return Response.json({ ok: false, error: error.message }, { status: 500 });
  if (!data) return Response.json({ ok: false, error: "Lead non in stato 'generated'." }, { status: 409 });
  return Response.json({ ok: true });
}
