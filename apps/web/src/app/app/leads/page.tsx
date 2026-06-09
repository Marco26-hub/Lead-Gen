import Link from "next/link";
import { listLeads, type LeadFilters } from "@/leadgen/lib/db";
import { LeadsTable } from "@/leadgen/components/LeadsTable";
import { sectorMeta, type SectorKey } from "@/leadgen/lib/sectors";

export const dynamic = "force-dynamic";

const STATUSES = [
  "inbound", "scraped", "classified", "generated", "approved", "contacted",
  "replied", "unsubscribed", "bounced", "suppressed",
];

const COLUMNS: { key: string; label: string }[] = [
  { key: "attivita", label: "Attività" },
  { key: "provenienza", label: "Provenienza" },
  { key: "categoria", label: "Categoria" },
  { key: "rating", label: "Rating" },
  { key: "whatsapp", label: "WhatsApp" },
  { key: "sito", label: "Sito" },
  { key: "priorita", label: "Priorità" },
  { key: "stato", label: "Stato" },
];

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ priority?: string; status?: string; source?: string; sector?: string; city?: string; q?: string; sort?: string; dir?: string }>;
}) {
  const sp = await searchParams;
  const filters: LeadFilters = { priority: sp.priority, status: sp.status, source: sp.source, sector: sp.sector, city: sp.city, q: sp.q, sort: sp.sort, dir: sp.dir };

  let leads: Awaited<ReturnType<typeof listLeads>> = [];
  let dbError: string | null = null;
  try {
    leads = await listLeads(filters);
  } catch (e) {
    dbError = (e as Error).message;
  }

  // Build a header link that toggles asc/desc and preserves the active filters.
  function sortHref(key: string): string {
    const dir = sp.sort === key && sp.dir !== "desc" ? "desc" : "asc";
    const params = new URLSearchParams();
    if (sp.q) params.set("q", sp.q);
    if (sp.priority) params.set("priority", sp.priority);
    if (sp.status) params.set("status", sp.status);
    if (sp.source) params.set("source", sp.source);
    if (sp.sector) params.set("sector", sp.sector);
    if (sp.city) params.set("city", sp.city);
    params.set("sort", key);
    params.set("dir", dir);
    return `/app/leads?${params.toString()}`;
  }

  const sectorMetaActive = sp.sector ? sectorMeta(sp.sector as SectorKey) : null;
  const cityLabel = sp.city === "__none__" ? "Senza città" : sp.city;
  const hasContextFilter = Boolean(sp.sector || sp.city);

  const ctl = "rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-indigo-400 focus:outline-none";

  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/app" className="text-sm text-zinc-500 hover:text-zinc-300">← Dashboard</Link>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Lead ({leads.length})</h1>
        </div>
        <Link href="/app/scrape" className="inline-flex h-10 items-center rounded-lg bg-indigo-500 px-4 text-sm font-medium text-white hover:bg-indigo-400">
          + Scraping
        </Link>
      </div>

      {/* Filtri */}
      <form method="GET" className="mt-5 flex flex-wrap items-end gap-3">
        <label className="block">
          <span className="mb-1 block text-xs text-zinc-400">Cerca</span>
          <input name="q" defaultValue={sp.q ?? ""} placeholder="nome, categoria o luogo" className={`${ctl} w-64`} />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs text-zinc-400">Priorità</span>
          <select name="priority" defaultValue={sp.priority ?? ""} className={ctl}>
            <option value="">tutte</option>
            <option value="high">alta</option>
            <option value="medium">media</option>
            <option value="low">bassa</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs text-zinc-400">Stato</span>
          <select name="status" defaultValue={sp.status ?? ""} className={ctl}>
            <option value="">tutti</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs text-zinc-400">Provenienza</span>
          <select name="source" defaultValue={sp.source ?? ""} className={ctl}>
            <option value="">tutte</option>
            <option value="maps">Maps (scraping)</option>
            <option value="website">Sito (form)</option>
          </select>
        </label>
        {/* preserve sort + card-driven context (settore/città) when filtering */}
        {sp.sort && <input type="hidden" name="sort" value={sp.sort} />}
        {sp.dir && <input type="hidden" name="dir" value={sp.dir} />}
        {sp.sector && <input type="hidden" name="sector" value={sp.sector} />}
        {sp.city && <input type="hidden" name="city" value={sp.city} />}
        <button className="h-10 rounded-lg border border-zinc-600 bg-zinc-800 px-4 text-sm font-medium text-zinc-100 hover:bg-zinc-700">Filtra</button>
        <Link href="/app/leads" className="h-10 rounded-lg px-3 text-sm leading-10 text-zinc-400 hover:text-zinc-200">azzera</Link>
      </form>

      {hasContextFilter && (
        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-zinc-500">Filtri attivi:</span>
          {sectorMetaActive && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/15 px-3 py-1 text-indigo-200 ring-1 ring-indigo-500/30">
              {sectorMetaActive.icon} {sectorMetaActive.label}
            </span>
          )}
          {sp.city && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-800 px-3 py-1 text-zinc-200 ring-1 ring-zinc-700">
              📍 {cityLabel}
            </span>
          )}
          <Link href="/app/leads" className="text-indigo-300 hover:underline">azzera</Link>
        </div>
      )}

      {dbError ? (
        <div className="mt-8 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">{dbError}</div>
      ) : leads.length === 0 ? (
        <p className="mt-8 text-zinc-400">Nessun lead trovato. {sp.q || sp.priority || sp.status || hasContextFilter ? <Link href="/app/leads" className="text-indigo-300 hover:underline">azzera i filtri</Link> : <>Avvia uno <Link href="/app/scrape" className="text-indigo-300 hover:underline">scraping</Link>.</>}</p>
      ) : (
        <LeadsTable
          leads={leads}
          columns={COLUMNS}
          sortHrefs={Object.fromEntries(COLUMNS.map((c) => [c.key, sortHref(c.key)]))}
          activeSort={sp.sort}
          activeDir={sp.dir}
        />
      )}
    </main>
  );
}
