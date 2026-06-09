import { getHubStats, leadsForHub } from "@/leadgen/lib/db";
import { SECTORS, sectorOf, type SectorKey } from "@/leadgen/lib/sectors";
import { SectorCard, type CityCount } from "@/leadgen/components/SectorCard";
import { WebsiteLeadsCard } from "@/leadgen/components/WebsiteLeadsCard";
import { KpiStat } from "@/leadgen/components/KpiStat";

export const dynamic = "force-dynamic";

export default async function Panoramica() {
  let stats = { leadsTotal: 0, daLavorare: 0, inTrattativa: 0, website: 0, activeClients: 0, upcomingAppointments: 0 };
  let cards: { meta: (typeof SECTORS)[number]; total: number; cities: CityCount[] }[] = [];
  let dbError: string | null = null;

  try {
    const [s, hubLeads] = await Promise.all([getHubStats(), leadsForHub()]);
    stats = s;
    const bySector = new Map<SectorKey, { total: number; cities: Map<string, number> }>();
    for (const l of hubLeads) {
      const k = sectorOf(l.category);
      if (!k) continue;
      const e = bySector.get(k) ?? { total: 0, cities: new Map<string, number>() };
      e.total++;
      const city = l.city ?? "__none__";
      e.cities.set(city, (e.cities.get(city) ?? 0) + 1);
      bySector.set(k, e);
    }
    cards = SECTORS.flatMap((meta) => {
      const e = bySector.get(meta.key);
      if (!e) return [];
      const cities = [...e.cities.entries()]
        .map(([city, n]) => ({ city, n }))
        .sort((a, b) => b.n - a.n);
      return [{ meta, total: e.total, cities }];
    });
  } catch (e) {
    dbError = (e as Error).message;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Panoramica</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Lead, clienti e appuntamenti in un unico posto.
        </p>
      </div>

      {dbError ? (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
          Database non raggiungibile. <span className="font-mono text-amber-300/80">{dbError}</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
            <KpiStat label="Lead totali" value={stats.leadsTotal} />
            <KpiStat label="Da lavorare" value={stats.daLavorare} accent="text-amber-300" />
            <KpiStat label="In trattativa" value={stats.inTrattativa} accent="text-emerald-300" />
            <KpiStat label="Clienti attivi" value={stats.activeClients} />
            <KpiStat label="Appuntamenti" value={stats.upcomingAppointments} hint="prossimi" />
          </div>

          <div>
            <h2 className="mb-3 text-sm font-medium text-zinc-400">Lead per settore</h2>
            {cards.length === 0 ? (
              <p className="text-sm text-zinc-500">
                Nessun lead da scraping ancora. Avvia una ricerca da <span className="text-indigo-300">Scraping</span>.
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {cards.map((c) => (
                  <SectorCard key={c.meta.key} meta={c.meta} total={c.total} cities={c.cities} />
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="mb-3 text-sm font-medium text-zinc-400">Contatti dal sito</h2>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <WebsiteLeadsCard count={stats.website} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
