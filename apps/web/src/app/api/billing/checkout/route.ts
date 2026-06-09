import { env, getServiceClient, type LeadRow } from "@maps/core";
import { getStripe, lookupStripePrice } from "@maps/core/stripe";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * Crea una Stripe Checkout session per il lead+pacchetto richiesto.
 * URL chiamato dal closing della call (link in chat) o dal banner trial-ending.
 *
 * Query:
 *   ?lead_id=<uuid>&package_id=<pkg>&billing=<monthly|annual>
 *
 * Comportamento:
 *  - Recupera lead da DB (deve esistere)
 *  - Trova `price_id` Stripe via `lookupStripePrice` (env-mapped)
 *  - Crea/riusa customer Stripe (usa `subscriptions.stripe_customer_id` se già esistente per altro pacchetto del lead)
 *  - Apre Checkout session in modalità subscription
 *  - Redirect 303 al checkout
 */
export async function GET(req: Request): Promise<Response> {
  const u = new URL(req.url);
  const leadId = u.searchParams.get("lead_id") ?? "";
  const packageId = u.searchParams.get("package_id") ?? "";
  const billing = (u.searchParams.get("billing") ?? "monthly") as "monthly" | "annual";

  if (!leadId || !packageId) {
    return Response.json({ ok: false, error: "lead_id e package_id obbligatori" }, { status: 400 });
  }
  if (billing !== "monthly" && billing !== "annual") {
    return Response.json({ ok: false, error: "billing deve essere monthly|annual" }, { status: 400 });
  }

  const priceId = lookupStripePrice(packageId, billing);
  if (!priceId) {
    return Response.json(
      {
        ok: false,
        error: `Pacchetto ${packageId} (${billing}) non configurato. Impostare env STRIPE_PRICE_${packageId.toUpperCase().replace(/-/g, "_")}_${billing.toUpperCase()}.`,
      },
      { status: 500 },
    );
  }

  const sb = getServiceClient();
  const { data: leadRow, error: leadErr } = await sb.from("leads").select("*").eq("id", leadId).maybeSingle();
  if (leadErr) return Response.json({ ok: false, error: leadErr.message }, { status: 500 });
  if (!leadRow) return Response.json({ ok: false, error: "Lead non trovato" }, { status: 404 });
  const lead = leadRow as LeadRow;

  // Riusa stripe_customer_id se il lead ne ha già uno
  const { data: existingSub } = await sb
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("lead_id", leadId)
    .not("stripe_customer_id", "is", null)
    .limit(1)
    .maybeSingle();
  const existingCustomerId = (existingSub?.stripe_customer_id as string | null) ?? null;

  const stripe = getStripe();
  // Success/cancel sono pagine PUBBLICHE (vedi middleware.ts) — il buyer
  // arriva qui dopo Stripe e non ha credenziali Basic Auth. Lo status del
  // lead viene aggiornato lato server dal webhook, queste pagine sono solo
  // conferma UX.
  const successUrl = `${env.PUBLIC_BASE_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${env.PUBLIC_BASE_URL}/billing/cancel`;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    customer: existingCustomerId ?? undefined,
    customer_email: existingCustomerId ? undefined : lead.email ?? undefined,
    client_reference_id: leadId,
    // Stripe Tax: calcola e aggiunge l'IVA automaticamente (richiede Stripe Tax
    // attivo in dashboard + registrazione IT + default tax behavior). Raccoglie
    // l'indirizzo di fatturazione (necessario al calcolo) e la P.IVA del cliente B2B.
    automatic_tax: { enabled: true },
    billing_address_collection: "required",
    tax_id_collection: { enabled: true },
    customer_update: existingCustomerId ? { address: "auto", name: "auto" } : undefined,
    subscription_data: {
      metadata: {
        lead_id: leadId,
        package_id: packageId,
        billing_period: billing,
      },
    },
    metadata: {
      lead_id: leadId,
      package_id: packageId,
      billing_period: billing,
    },
    allow_promotion_codes: true,
    locale: "it",
  });

  if (!session.url) {
    return Response.json({ ok: false, error: "Stripe non ha restituito URL checkout" }, { status: 500 });
  }
  return Response.redirect(session.url, 303);
}
