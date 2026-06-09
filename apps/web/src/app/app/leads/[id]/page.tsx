import Link from "next/link";
import { notFound } from "next/navigation";
import { getLead, listBookings, listSubscriptions } from "@/leadgen/lib/db";
import { PriorityBadge, SiteBadge, StatusPill } from "@/leadgen/components/badges";
import { ApproveButton } from "@/leadgen/components/ApproveButton";
import { RegenerateButton } from "@/leadgen/components/RegenerateButton";
import { EnrichInstagramButton } from "@/leadgen/components/EnrichInstagramButton";
import { PhotoManager } from "@/leadgen/components/PhotoManager";
import { LeadEditor } from "@/leadgen/components/LeadEditor";
import { WhatsAppButton } from "@/leadgen/components/WhatsAppButton";
import { WhatsAppConversation } from "@/leadgen/components/WhatsAppConversation";
import { TemplateSelector } from "@/leadgen/components/TemplateSelector";
import { TrialButton } from "@/leadgen/components/TrialButton";
import { BillingButtons } from "@/leadgen/components/BillingButtons";
import { ConvertClientButton } from "@/leadgen/components/ConvertClientButton";
import { presetFromCategory, type ReviewItem, type TechStack, type ThemePreset } from "@maps/core";

export const dynamic = "force-dynamic";

export default async function LeadDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lead = await getLead(id);
  if (!lead) notFound();

  const tech = (lead.tech_stack ?? {}) as TechStack;
  const reviews = (lead.reviews ?? []) as ReviewItem[];
  const bookings = await listBookings(lead.id, 20);
  const subscriptions = await listSubscriptions(lead.id);
  const activeSub = subscriptions.find((s) => s.status === "trialing" || s.status === "active");
  // Post-generation: real preset from page_model. Pre-generation: guess from the
  // Maps category so the template selector (and its preselection) work before generating.
  const preset = (lead.page_model as { theme?: { preset?: ThemePreset } } | null)?.theme?.preset ?? presetFromCategory(lead.category);
  // Default tier suggerito basato sul preset
  const defaultPkg = preset === "restaurant" ? "ristorante-growth"
    : preset === "beauty" ? "salone-growth"
    : preset === "artisan" ? "idraulico-growth"
    : "sito-smart";
  const canStartTrial = !activeSub && (lead.status === "generated" || lead.status === "approved");
  const hasStripeCustomer = subscriptions.some((s) => Boolean(s.stripe_customer_id));
  // Billing buttons visibili a partire dal trial (per chiudere a piacere) e fino a paying
  const canShowBilling = lead.status === "trialing" || lead.status === "paying" || lead.status === "approved";

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-10">
      <Link href="/app/leads" className="text-sm text-zinc-500 hover:text-zinc-300">
        ← Elenco lead
      </Link>

      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">{lead.business_name}</h1>
        <PriorityBadge p={lead.priority} />
        <SiteBadge s={lead.site_age_class} />
        <StatusPill status={lead.status} />
        <div className="ml-auto">
          <ConvertClientButton leadId={lead.id} alreadyClient={Boolean(lead.client_id)} />
        </div>
      </div>
      <p className="mt-1 text-zinc-400">
        {lead.category ?? "—"}
        {lead.city ? ` · ${lead.city}` : ""}
      </p>

      <section className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-400">Gestione (CRM)</h2>
        <LeadEditor id={lead.id} status={lead.status} notes={lead.notes} email={lead.email} phone={lead.phone_e164} phoneType={lead.phone_type} />
        {activeSub && (
          <div className="mt-3 rounded-lg border border-amber-400/30 bg-amber-400/5 px-3 py-2 text-xs text-amber-200">
            <strong className="uppercase tracking-wide">{activeSub.status}</strong> · pacchetto{" "}
            <code>{activeSub.package_id}</code>
            {activeSub.trial_ends_at && (
              <span> · trial fino al {new Date(activeSub.trial_ends_at).toLocaleDateString("it-IT", { day: "numeric", month: "long" })}</span>
            )}
            {activeSub.current_period_end && (
              <span> · rinnovo {new Date(activeSub.current_period_end).toLocaleDateString("it-IT", { day: "numeric", month: "short" })}</span>
            )}
          </div>
        )}
        {canShowBilling && (
          <div className="mt-3">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">Billing Stripe</h3>
            <BillingButtons leadId={lead.id} defaultPackage={activeSub?.package_id ?? defaultPkg} hasCustomer={hasStripeCustomer} />
          </div>
        )}
      </section>

      {lead.phone_type === "mobile" && (
        <Section title="Conversazione WhatsApp" className="mt-6">
          <WhatsAppConversation id={lead.id} />
        </Section>
      )}

      {lead.slug && (
        <section className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">Demo</h2>
            <div className="flex flex-wrap items-center gap-3">
              {lead.demo_url && (
                <a href={lead.demo_url} target="_blank" rel="noreferrer" className="text-sm text-indigo-300 hover:underline">
                  {lead.demo_url}
                </a>
              )}
              {preset && <TemplateSelector id={lead.id} current={lead.template} preset={preset} category={lead.category} />}
              <RegenerateButton id={lead.id} />
              {lead.instagram_handle && <EnrichInstagramButton id={lead.id} handle={lead.instagram_handle} />}
              {lead.status === "generated" && <ApproveButton id={lead.id} />}
              {canStartTrial && <TrialButton id={lead.id} defaultPackage={defaultPkg} />}
              {lead.demo_url && lead.phone_type === "mobile" && <WhatsAppButton id={lead.id} />}
            </div>
          </div>
          {lead.demo_url ? (
            <iframe
              src={lead.demo_url}
              title="Anteprima demo"
              className="mt-3 h-[480px] w-full rounded-lg border border-zinc-800 bg-white"
            />
          ) : (
            <p className="mt-3 text-sm text-zinc-500">
              Nessuna demo ancora. Premi “Rigenera” per crearla con il modello selezionato.
            </p>
          )}
        </section>
      )}

      {lead.slug && (
        <Section title={`Foto (${(lead.photos ?? []).length})`} className="mt-6">
          <PhotoManager id={lead.id} photos={(lead.photos ?? []) as string[]} />
        </Section>
      )}

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <Section title="Contatti">
          <Row k="Indirizzo" v={lead.address} />
          <Row
            k="Telefono"
            v={
              lead.phone_e164 ? (
                <span className="inline-flex items-center gap-2">
                  {lead.phone_e164}
                  {lead.phone_type === "mobile" ? (
                    <a
                      href={`https://wa.me/${lead.phone_e164.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-xs text-emerald-300 ring-1 ring-emerald-500/30 hover:bg-emerald-500/25"
                    >
                      WhatsApp
                    </a>
                  ) : (
                    <span className="text-xs text-zinc-500">(fisso)</span>
                  )}
                </span>
              ) : (
                "—"
              )
            }
          />
          <Row k="Email" v={lead.email} />
          <Row
            k="Sito"
            v={
              lead.website_url ? (
                <a className="text-indigo-300 hover:underline" href={lead.website_url} target="_blank" rel="noreferrer">
                  {lead.website_url}
                </a>
              ) : (
                "—"
              )
            }
          />
          <Row k="Rating" v={lead.rating != null ? `${lead.rating}★ (${lead.review_count ?? 0})` : "—"} />
          <Row
            k="Instagram"
            v={
              lead.instagram_handle ? (
                <a
                  className="text-fuchsia-300 hover:underline"
                  href={`https://instagram.com/${lead.instagram_handle}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  @{lead.instagram_handle}
                </a>
              ) : (
                "—"
              )
            }
          />
        </Section>

        <Section title="Tecnografica">
          <Row k="Raggiungibile" v={lead.reachable == null ? "—" : lead.reachable ? "sì" : "no"} />
          <Row k="HTTP" v={lead.http_status ?? "—"} />
          <Row k="SSL" v={flag(tech.ssl)} />
          <Row k="Responsive (viewport)" v={flag(tech.viewport)} />
          <Row k="Google Tag Manager" v={flag(tech.gtm)} />
          <Row k="Meta Pixel" v={flag(tech.metaPixel)} />
          <Row k="gtag" v={flag(tech.gtag)} />
          <Row k="CMS" v={tech.cms ? `${tech.cms}${tech.cmsVersion ? " " + tech.cmsVersion : ""}` : "—"} />
        </Section>
      </div>

      <Section title={`Prenotazioni dal sito (${bookings.length})`} className="mt-6">
        {bookings.length === 0 ? (
          <p className="text-sm text-zinc-500">Nessuna prenotazione ricevuta dal BookingForm.</p>
        ) : (
          <ul className="space-y-2">
            {bookings.map((b) => {
              const when: string[] = [];
              if (b.date) when.push(new Date(b.date).toLocaleDateString("it-IT", { day: "numeric", month: "short", year: "numeric" }));
              if (b.time) when.push(b.time.slice(0, 5));
              if (b.party_size) when.push(`${b.party_size} pers`);
              return (
                <li key={b.id} className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-zinc-400">
                        {b.kind}
                      </span>
                      <span className="font-medium text-zinc-200">{b.name}</span>
                      {b.phone && <a href={`tel:${b.phone}`} className="text-xs text-indigo-300 hover:underline">{b.phone}</a>}
                      {b.email && <a href={`mailto:${b.email}`} className="text-xs text-indigo-300 hover:underline">{b.email}</a>}
                    </div>
                    <span className="text-xs text-zinc-500">
                      {new Date(b.created_at).toLocaleString("it-IT", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  {when.length > 0 && <div className="mt-1 text-xs text-zinc-400">📅 {when.join(" · ")}</div>}
                  {b.service && <div className="mt-1 text-xs text-zinc-400">🛎 {b.service}</div>}
                  {b.message && <div className="mt-1 text-xs italic text-zinc-300">“{b.message}”</div>}
                </li>
              );
            })}
          </ul>
        )}
      </Section>

      <Section title={`Recensioni (${reviews.length})`} className="mt-6">
        {reviews.length === 0 ? (
          <p className="text-sm text-zinc-500">Nessuna recensione estratta.</p>
        ) : (
          <ul className="space-y-3">
            {reviews.map((r, i) => (
              <li key={i} className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3 text-sm">
                <div className="text-zinc-200">“{r.text}”</div>
                <div className="mt-1 text-xs text-zinc-500">
                  {r.author ?? "Anonimo"}
                  {r.rating ? ` · ${r.rating}★` : ""}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {lead.demo_url ? (
        <div className="mt-6">
          <a
            href={lead.demo_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 items-center rounded-lg bg-indigo-500 px-4 font-medium text-white hover:bg-indigo-400"
          >
            Apri demo →
          </a>
        </div>
      ) : null}
    </main>
  );
}

function Section({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 ${className ?? ""}`}>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-400">{title}</h2>
      {children}
    </section>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-zinc-800/60 py-1.5 text-sm last:border-0">
      <span className="text-zinc-500">{k}</span>
      <span className="text-right text-zinc-200">{v ?? "—"}</span>
    </div>
  );
}

function flag(v: boolean | undefined): string {
  return v === undefined ? "—" : v ? "sì" : "no";
}
