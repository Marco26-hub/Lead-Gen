import { revalidatePath } from "next/cache";
import { env, getServiceClient, type LeadRow } from "@maps/core";
import { sendEmail } from "@maps/core/email";

export const dynamic = "force-dynamic";

/**
 * Attiva un trial 14gg per il pacchetto scelto, **senza carta**.
 *
 * Crea una `subscriptions` row con status='trialing' e setta
 * `leads.status='trialing'`. Manda welcome email al lead.email se presente.
 *
 * Quando il prospect deciderà di pagare al giorno 14, il flusso passerà
 * dal nostro `/api/billing/checkout` di Stripe (link mandato in chat).
 * Stripe webhook poi sostituirà questa subscription con quella vera.
 *
 * Guards:
 *  - Non si attiva trial su lead già `paying` o `churned` (no demote dello stato).
 *  - Non si rolla in avanti un trial esistente con `trial_ends_at` ancora futuro
 *    (cap implicito: una sola finestra trial per pacchetto, no extension infinita).
 */
const TRIAL_DAYS = 14;

/** Stati lead da cui NON si può (re)attivare un trial: il cliente è in una fase commerciale già avanzata. */
const TRIAL_BLOCKED_LEAD_STATES = new Set(["paying", "churned"]);

const ALLOWED_PACKAGES = new Set([
  // Pacchetti per verticale
  "ristorante-starter", "ristorante-growth", "ristorante-premium",
  "salone-starter", "salone-growth", "salone-premium",
  "idraulico-starter", "idraulico-growth", "idraulico-premium",
  // Tier landing puri (per chi compra solo sito)
  "solo-sito", "sito-smart", "sito-premium",
]);

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  const { id } = await params;
  const body = (await req.json().catch(() => ({}))) as { package_id?: string };
  const pkg = String(body.package_id ?? "ristorante-growth");
  if (!ALLOWED_PACKAGES.has(pkg)) {
    return Response.json({ ok: false, error: `Pacchetto non valido: ${pkg}` }, { status: 400 });
  }

  const sb = getServiceClient();
  const { data: leadRow, error: leadErr } = await sb
    .from("leads")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (leadErr) return Response.json({ ok: false, error: leadErr.message }, { status: 500 });
  if (!leadRow) return Response.json({ ok: false, error: "Lead non trovato" }, { status: 404 });
  const lead = leadRow as LeadRow;

  // Guard: non si attiva un trial su lead già pagante/churned. Difensivo: la UI
  // già nasconde il bottone in quegli stati, ma un POST diretto bypassa.
  if (TRIAL_BLOCKED_LEAD_STATES.has(lead.status)) {
    return Response.json(
      { ok: false, error: `Lead in stato '${lead.status}' — il trial non si può attivare qui.` },
      { status: 409 },
    );
  }

  const now = new Date();
  const trialEndsAt = new Date(now.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000);

  // Una sub trial alla volta per (lead, pacchetto). Se esiste già con scadenza
  // futura → 409 (no roll-forward indefinito). Se è scaduta o riconvertita → rinnovo.
  const { data: existing } = await sb
    .from("subscriptions")
    .select("id, trial_ends_at, status")
    .eq("lead_id", id)
    .eq("package_id", pkg)
    .eq("status", "trialing")
    .maybeSingle();

  let subId: string | null = null;
  if (existing) {
    const existingEndsAt = existing.trial_ends_at ? new Date(existing.trial_ends_at as string) : null;
    if (existingEndsAt && existingEndsAt.getTime() > now.getTime()) {
      return Response.json(
        {
          ok: false,
          error: `Trial già attivo per questo pacchetto (scade il ${existingEndsAt.toLocaleDateString("it-IT")}).`,
          trial_ends_at: existingEndsAt.toISOString(),
        },
        { status: 409 },
      );
    }
    // Scaduto → rinnovo (nuova finestra 14gg)
    const { error: upErr } = await sb
      .from("subscriptions")
      .update({ trial_ends_at: trialEndsAt.toISOString() })
      .eq("id", existing.id);
    if (upErr) return Response.json({ ok: false, error: upErr.message }, { status: 500 });
    subId = existing.id as string;
  } else {
    const { data: inserted, error: insErr } = await sb
      .from("subscriptions")
      .insert({
        lead_id: id,
        package_id: pkg,
        billing_period: "monthly",
        status: "trialing",
        trial_ends_at: trialEndsAt.toISOString(),
      })
      .select("id")
      .maybeSingle();
    if (insErr) return Response.json({ ok: false, error: insErr.message }, { status: 500 });
    subId = inserted?.id ?? null;
  }

  // Aggiorna lead.status solo se è una fase "pre-trial" — non sovrascrivere
  // 'trialing' (no-op) o stati commerciali successivi (già bloccati sopra).
  if (lead.status !== "trialing") {
    await sb.from("leads").update({ status: "trialing" }).eq("id", id);
  }
  if (lead.slug) revalidatePath(`/d/${lead.slug}`);

  // Welcome email (fire-and-forget)
  if (lead.email) {
    void (async () => {
      try {
        const trialEnd = trialEndsAt.toLocaleDateString("it-IT", { day: "numeric", month: "long" });
        const dashboardUrl = lead.slug ? `${env.PUBLIC_BASE_URL}/d/${lead.slug}` : env.PUBLIC_BASE_URL;
        await sendEmail({
          to: lead.email!,
          subject: `Il trial gratuito di ${lead.business_name} è attivo`,
          html: `<!doctype html><html lang="it"><body style="font-family:Arial,sans-serif;background:#f4f4f5;margin:0">
            <div style="max-width:560px;margin:0 auto;padding:24px">
              <div style="background:#fff;border-radius:16px;padding:28px">
                <h1 style="margin:0 0 16px;font-size:22px;color:#18181b">Benvenuti!</h1>
                <p style="margin:0 0 16px;font-size:15px;line-height:1.55">
                  Il vostro <strong>${pkg.replaceAll("-", " ").replace(/\b\w/g, (c) => c.toUpperCase())}</strong>
                  è attivo in prova gratuita fino al <strong>${trialEnd}</strong>.
                </p>
                <p style="margin:0 0 16px;font-size:15px;line-height:1.55">
                  Potete vedere l'anteprima del vostro sito qui:
                </p>
                <p style="margin:0 0 24px">
                  <a href="${dashboardUrl}" style="display:inline-block;background:#5b6cff;color:#fff;text-decoration:none;
                    padding:12px 22px;border-radius:9999px;font-weight:600">Apri l'anteprima →</a>
                </p>
                <p style="margin:0 0 8px;font-size:13px;color:#71717a">
                  Vi ricontatteremo qualche giorno prima della scadenza per capire come è andata.
                </p>
              </div>
            </div>
          </body></html>`,
        });
      } catch (e) {
        console.error("[trial] welcome email failed", (e as Error).message);
      }
    })();
  }

  return Response.json({
    ok: true,
    subscription_id: subId,
    trial_ends_at: trialEndsAt.toISOString(),
    package_id: pkg,
  });
}
