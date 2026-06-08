import Link from "next/link";
import { getDashboardStats } from "@/lib/admin/queries";
import { StatCard } from "@/components/admin/StatCard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
        <p className="mt-1 text-sm text-muted">
          Clienti e appuntamenti in sintesi. I lead (scraping + sito) vivono nel
          gestionale lead-gen.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Clienti attivi" value={stats.activeClients} />
        <StatCard
          label="In arrivo"
          value={stats.upcomingAppointments}
          hint="Appuntamenti futuri"
        />
        <Link
          href="/app/leads"
          className="flex flex-col justify-center rounded-lg border border-line bg-surface/40 p-4 text-sm transition-colors hover:border-line-bright hover:bg-elevated"
        >
          <span className="font-medium text-ink">Gestione lead →</span>
          <span className="mt-1 text-muted">
            Tutti i lead: scraping Google Maps + form del sito
          </span>
        </Link>
      </div>
    </div>
  );
}
