import { leadsForHub } from "@/leadgen/lib/db";
import { sectorMeta, sectorOf, type SectorKey } from "@/leadgen/lib/sectors";

export const dynamic = "force-dynamic";

function tally<T extends string>(items: T[]): { label: T; n: number }[] {
  const m = new Map<T, number>();
  for (const it of items) m.set(it, (m.get(it) ?? 0) + 1);
  return [...m.entries()].map(([label, n]) => ({ label, n })).sort((a, b) => b.n - a.n);
}

function BarList({
  title,
  rows,
  accent = "bg-indigo-500",
}: {
  title: string;
  rows: { label: string; n: number }[];
  accent?: string;
}) {
  const max = Math.max(1, ...rows.map((r) => r.n));
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
      <h2 className="mb-4 text-sm font-medium text-zinc-300">{title}</h2>
      {rows.length === 0 ? (
        <p className="text-sm text-zinc-500">Nessun dato.</p>
      ) : (
        <div className="space-y-2.5">
          {rows.map((r) => (
            <div key={r.label} className="flex items-center gap-3 text-sm">
              <span className="w-40 shrink-0 truncate text-zinc-400">{r.label}</span>
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-zinc-800">
                <div className={`h-full rounded-full ${accent}`} style={{ width: `${(r.n / max) * 100}%` }} />
              </div>
              <span className="w-8 shrink-0 text-right font-medium text-zinc-200">{r.n}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const STATUS_LABELS: Record<string, string> = {
  scraped: "Scraped",
  enriched: "Arricchito",
  classified: "Classificato",
  generated: "Demo pronta",
  deployed: "Pubblicato",
  approved: "Approvato",
  queued_outreach: "In coda",
  contacted: "Contattato",
  replied: "Risposto",
  trialing: "Trial",
  paying: "Pagante",
  churned: "Perso",
};

export default async function AnalyticsPage() {
  let dbError: string | null = null;
  let sectorRows: { label: string; n: number }[] = [];
  let statusRows: { label: string; n: number }[] = [];
  let prioRows: { label: string; n: number }[] = [];
  let cityRows: { label: string; n: number }[] = [];

  try {
    const leads = await leadsForHub();
    const sectorCount = new Map<SectorKey, number>();
    for (const l of leads) {
      const k = sectorOf(l.category);
      if (k) sectorCount.set(k, (sectorCount.get(k) ?? 0) + 1);
    }
    sectorRows = [...sectorCount.entries()]
      .map(([k, n]) => ({ label: sectorMeta(k).label, n }))
      .sort((a, b) => b.n - a.n);

    statusRows = tally(leads.map((l) => l.status)).map((r) => ({
      label: STATUS_LABELS[r.label] ?? r.label,
      n: r.n,
    }));

    prioRows = tally(leads.map((l) => l.priority ?? "n/d")).map((r) => ({
      label: r.label === "high" ? "Alta" : r.label === "medium" ? "Media" : r.label === "low" ? "Bassa" : "Non classificato",
      n: r.n,
    }));

    cityRows = tally(leads.map((l) => l.city ?? "Senza città")).slice(0, 10);
  } catch (e) {
    dbError = (e as Error).message;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="mt-1 text-sm text-zinc-400">Distribuzione dei lead da scraping.</p>
      </div>
      {dbError ? (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">{dbError}</div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <BarList title="Lead per settore" rows={sectorRows} accent="bg-indigo-500" />
          <BarList title="Lead per stato (pipeline)" rows={statusRows} accent="bg-emerald-500" />
          <BarList title="Priorità" rows={prioRows} accent="bg-amber-500" />
          <BarList title="Top 10 città" rows={cityRows} accent="bg-sky-500" />
        </div>
      )}
    </div>
  );
}
