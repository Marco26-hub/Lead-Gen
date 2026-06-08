import { revalidatePath } from "next/cache";
import { defaultTemplateFor, getServiceClient, getLlmModel, env, slugify, type LeadRow } from "@maps/core";
import { generatePageModel } from "@maps/core/llm";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Regenerate a lead's demo PageModel with the currently selected OpenRouter model. */
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  const { id } = await params;
  const sb = getServiceClient();
  const { data, error } = await sb.from("leads").select("*").eq("id", id).maybeSingle();
  if (error) return Response.json({ ok: false, error: error.message }, { status: 500 });
  if (!data) return Response.json({ ok: false, error: "Lead non trovato." }, { status: 404 });
  const lead = data as LeadRow;

  const model = (await getLlmModel().catch(() => null)) ?? env.OPENROUTER_MODEL;
  try {
    const pageModel = await generatePageModel(lead, model);
    const slug = lead.slug ?? slugify(lead.business_name, lead.place_id);
    const demoUrl = `${env.PUBLIC_BASE_URL}/d/${slug}`;
    const template = lead.template ?? defaultTemplateFor(lead.category, pageModel.theme.preset, pageModel.restaurantStyle, pageModel.salonStyle);
    const { error: e } = await sb
      .from("leads")
      .update({ page_model: pageModel, demo_url: demoUrl, slug, template, status: "generated" })
      .eq("id", id);
    if (e) return Response.json({ ok: false, error: e.message }, { status: 500 });
    revalidatePath(`/d/${slug}`);
    return Response.json({ ok: true, slug, model });
  } catch (err) {
    return Response.json({ ok: false, error: (err as Error).message }, { status: 500 });
  }
}
