import { revalidatePath } from "next/cache";
import Stripe from "stripe";
import { env, getServiceClient, type SubscriptionStatus } from "@maps/core";
import { getStripe } from "@maps/core/stripe";
import { ensureClientForLead } from "@/leadgen/lib/clients";

/** Auto-conversione lead→cliente quando diventa pagante (best-effort, non blocca il webhook). */
async function autoConvertClient(leadId: string): Promise<void> {
  try {
    const r = await ensureClientForLead(leadId);
    if (r.created) revalidatePath("/app/clients");
  } catch (e) {
    console.error("[stripe-webhook] auto-convert client failed", leadId, (e as Error).message);
  }
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs"; // serve raw body → no Edge
export const maxDuration = 30;

/**
 * Stripe webhook handler.
 *
 * Gestisce gli eventi che spostano lo stato lifecycle del lead:
 *   - checkout.session.completed → primo pagamento OK
 *   - customer.subscription.{created,updated,deleted}
 *
 * Idempotency atomica: il claim su `webhook_events.id` (chiave primaria) è
 * fatto via INSERT-first con `ignoreDuplicates:true`. Se `claimed` è null,
 * un altro processo ha già il claim → skip silenzioso. Su errore di handler,
 * la riga viene cancellata per consentire il retry di Stripe.
 *
 * Security: signature verification via `STRIPE_WEBHOOK_SECRET`.
 *
 * Stato lead: `paying` solo se la subscription è davvero `active`/`trialing`.
 * `incomplete`/`past_due`/`canceled` su .updated → downgrade lead se non
 * ha altre sub attive (mirror di .deleted).
 */

const STATUS_MAP: Record<Stripe.Subscription.Status, SubscriptionStatus> = {
  active: "active",
  trialing: "trialing",
  past_due: "past_due",
  canceled: "canceled",
  incomplete: "incomplete",
  incomplete_expired: "canceled",
  unpaid: "past_due",
  paused: "past_due",
};

function mapStatus(s: Stripe.Subscription.Status): SubscriptionStatus {
  return STATUS_MAP[s] ?? "incomplete";
}

/** Una sub Stripe in questi stati = il lead è "paying" (incassiamo o stiamo per). */
function isRevenueGenerating(s: Stripe.Subscription.Status): boolean {
  const m = mapStatus(s);
  return m === "active" || m === "trialing";
}

/**
 * Quando una sub di un lead va in stato non-attivo, ricalcola lo status del lead:
 * se ha ancora ALTRE sub active/trialing → resta 'paying', altrimenti → 'churned'.
 * Mirror della logica di customer.subscription.deleted.
 */
async function recomputeLeadStatusAfterSubDowngrade(
  sb: ReturnType<typeof getServiceClient>,
  leadId: string,
  thisSubStripeId: string | null,
): Promise<void> {
  let q = sb
    .from("subscriptions")
    .select("id")
    .eq("lead_id", leadId)
    .in("status", ["active", "trialing"])
    .limit(1);
  // Escludi la sub corrente — il payload Stripe potrebbe non aver ancora propagato
  // il nuovo status in DB.
  if (thisSubStripeId) q = q.neq("stripe_subscription_id", thisSubStripeId);
  const { data: remaining } = await q;
  if (!remaining || remaining.length === 0) {
    await sb.from("leads").update({ status: "churned" }).eq("id", leadId);
  }
}

export async function POST(req: Request): Promise<Response> {
  const secret = env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return Response.json({ ok: false, error: "STRIPE_WEBHOOK_SECRET non configurato" }, { status: 500 });
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) return Response.json({ ok: false, error: "missing stripe-signature" }, { status: 400 });

  // Raw body per la verifica firma
  const raw = await req.text();
  const stripe = getStripe();
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(raw, sig, secret);
  } catch (err) {
    return Response.json({ ok: false, error: `signature: ${(err as Error).message}` }, { status: 400 });
  }

  const sb = getServiceClient();

  // Idempotency ATOMICA: claim l'event tramite UPSERT con ignoreDuplicates.
  // Se la riga esisteva già, `claimed` è null e ritorniamo subito.
  // Altrimenti la riga è nostra: se l'handler fallisce, la cancelliamo
  // per consentire il retry di Stripe.
  const { data: claimed, error: claimErr } = await sb
    .from("webhook_events")
    .upsert(
      {
        id: event.id,
        provider: "stripe",
        type: event.type,
        payload: event as unknown as Record<string, unknown>,
      },
      { onConflict: "id", ignoreDuplicates: true },
    )
    .select("id")
    .maybeSingle();
  if (claimErr) {
    console.error("[stripe-webhook] claim error", event.type, claimErr.message);
    return Response.json({ ok: false, error: claimErr.message }, { status: 500 });
  }
  if (!claimed) {
    return Response.json({ ok: true, duplicate: true });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const leadId = session.metadata?.lead_id ?? session.client_reference_id;
        const packageId = session.metadata?.package_id ?? null;
        const billing = (session.metadata?.billing_period as "monthly" | "annual") ?? "monthly";
        if (leadId && session.subscription) {
          const sub = await stripe.subscriptions.retrieve(
            typeof session.subscription === "string" ? session.subscription : session.subscription.id,
          );
          await upsertSubscription(sb, leadId, sub, { packageId, billing });
          // Gate: marca lead 'paying' SOLO se la sub è davvero active/trialing.
          // Stripe può chiudere checkout con sub in 'incomplete' (3DS pending,
          // SCA, prima fattura fallita) — non vogliamo dire "paying" su un
          // pagamento ancora non andato a buon fine.
          if (isRevenueGenerating(sub.status)) {
            await sb.from("leads").update({ status: "paying" }).eq("id", leadId);
            await autoConvertClient(leadId);
            // Revalida la demo (banner buyer sparisce)
            const { data: leadRow } = await sb.from("leads").select("slug").eq("id", leadId).maybeSingle();
            if (leadRow?.slug) revalidatePath(`/d/${leadRow.slug as string}`);
          }
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const leadId = sub.metadata?.lead_id;
        const packageId = sub.metadata?.package_id ?? null;
        const billing = (sub.metadata?.billing_period as "monthly" | "annual") ?? "monthly";
        if (leadId) {
          await upsertSubscription(sb, leadId, sub, { packageId, billing });
          if (isRevenueGenerating(sub.status)) {
            await sb.from("leads").update({ status: "paying" }).eq("id", leadId);
            await autoConvertClient(leadId);
          } else {
            // Sub appena passata in past_due/paused/canceled/incomplete:
            // se non ha altre sub attive, downgrade a 'churned'.
            await recomputeLeadStatusAfterSubDowngrade(sb, leadId, sub.id);
          }
        }
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const leadId = sub.metadata?.lead_id;
        if (leadId) {
          await sb
            .from("subscriptions")
            .update({ status: "canceled", canceled_at: new Date().toISOString() })
            .eq("stripe_subscription_id", sub.id);
          await recomputeLeadStatusAfterSubDowngrade(sb, leadId, sub.id);
        }
        break;
      }
      default:
        // ignorati: invoice.*, customer.created, etc.
        break;
    }
  } catch (err) {
    console.error("[stripe-webhook]", event.type, (err as Error).message);
    // Rilascia il claim così Stripe può ritentare. Se la cancellazione
    // fallisce non possiamo fare molto: lo segnaliamo nei log.
    const { error: delErr } = await sb.from("webhook_events").delete().eq("id", event.id);
    if (delErr) console.error("[stripe-webhook] failed to release claim", event.id, delErr.message);
    return Response.json({ ok: false, error: (err as Error).message }, { status: 500 });
  }

  return Response.json({ ok: true });
}

interface UpsertOpts {
  packageId: string | null;
  billing: "monthly" | "annual";
}

async function upsertSubscription(
  sb: ReturnType<typeof getServiceClient>,
  leadId: string,
  sub: Stripe.Subscription,
  { packageId, billing }: UpsertOpts,
) {
  const item = sub.items.data[0];
  const priceId = item?.price?.id ?? null;
  // In acacia API la subscription ha current_period_end al top-level.
  // Cast: il typing di Stripe 17.7 lo espone su sub direttamente.
  const periodEnd = (sub as unknown as { current_period_end?: number }).current_period_end ?? null;
  const customer = typeof sub.customer === "string" ? sub.customer : sub.customer.id;

  // Cerca sub esistente con stesso stripe_subscription_id
  const { data: existing } = await sb
    .from("subscriptions")
    .select("id")
    .eq("stripe_subscription_id", sub.id)
    .maybeSingle();

  const payload = {
    lead_id: leadId,
    package_id: packageId ?? "unknown",
    billing_period: billing,
    stripe_customer_id: customer,
    stripe_subscription_id: sub.id,
    stripe_price_id: priceId,
    status: mapStatus(sub.status),
    trial_ends_at: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
    current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
    cancel_at_period_end: sub.cancel_at_period_end ?? false,
    canceled_at: sub.canceled_at ? new Date(sub.canceled_at * 1000).toISOString() : null,
  };

  if (existing) {
    await sb.from("subscriptions").update(payload).eq("id", existing.id);
  } else {
    // Se ha già una sub trial manuale per lo stesso package, sostituiscila (no duplicati)
    if (packageId) {
      await sb
        .from("subscriptions")
        .delete()
        .eq("lead_id", leadId)
        .eq("package_id", packageId)
        .eq("status", "trialing")
        .is("stripe_subscription_id", null);
    }
    await sb.from("subscriptions").insert(payload);
  }
}
