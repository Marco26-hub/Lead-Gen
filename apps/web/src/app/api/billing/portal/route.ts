import { env, getServiceClient } from "@maps/core";
import { getStripe } from "@maps/core/stripe";

export const dynamic = "force-dynamic";

/**
 * Customer Portal Stripe — self-service per il cliente per:
 *   - Cancellare abbonamento
 *   - Aggiornare carta
 *   - Scaricare fatture
 *   - Upgrade/downgrade tier
 *
 * Query: `?lead_id=<uuid>` (oppure `?customer_id=cus_xxx` se conosci già il customer Stripe).
 */
export async function GET(req: Request): Promise<Response> {
  const u = new URL(req.url);
  const leadId = u.searchParams.get("lead_id") ?? "";
  let customerId = u.searchParams.get("customer_id") ?? "";

  if (!customerId) {
    if (!leadId) return Response.json({ ok: false, error: "lead_id o customer_id richiesto" }, { status: 400 });
    const sb = getServiceClient();
    const { data, error } = await sb
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("lead_id", leadId)
      .not("stripe_customer_id", "is", null)
      .limit(1)
      .maybeSingle();
    if (error) return Response.json({ ok: false, error: error.message }, { status: 500 });
    if (!data?.stripe_customer_id) {
      return Response.json({ ok: false, error: "Lead non ha ancora un customer Stripe" }, { status: 404 });
    }
    customerId = data.stripe_customer_id as string;
  }

  const stripe = getStripe();
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: leadId ? `${env.PUBLIC_BASE_URL}/leads/${leadId}` : env.PUBLIC_BASE_URL,
  });
  return Response.redirect(session.url, 303);
}
