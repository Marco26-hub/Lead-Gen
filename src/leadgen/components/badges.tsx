import type { Priority, SiteAgeClass, LeadStatus } from "@maps/core";

const PRIO: Record<Priority, { label: string; cls: string }> = {
  high: { label: "ALTA", cls: "bg-red-500/15 text-red-300 ring-red-500/30" },
  medium: { label: "MEDIA", cls: "bg-amber-500/15 text-amber-300 ring-amber-500/30" },
  low: { label: "BASSA", cls: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30" },
};

export function PriorityBadge({ p }: { p: Priority | null }) {
  if (!p) return <span className="text-zinc-600">—</span>;
  const s = PRIO[p];
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ${s.cls}`}>
      {s.label}
    </span>
  );
}

const SITE: Record<SiteAgeClass, { label: string; cls: string }> = {
  none: { label: "NESSUN SITO", cls: "bg-red-500/15 text-red-300 ring-red-500/30" },
  old: { label: "SITO VECCHIO", cls: "bg-amber-500/15 text-amber-300 ring-amber-500/30" },
  modern: { label: "MODERNO", cls: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30" },
};

export function SiteBadge({ s }: { s: SiteAgeClass | null }) {
  if (!s) return <span className="text-zinc-600">—</span>;
  const x = SITE[s];
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${x.cls}`}>
      {x.label}
    </span>
  );
}

export function StatusPill({ status }: { status: LeadStatus }) {
  return (
    <span className="inline-flex rounded-md bg-zinc-800 px-2 py-0.5 font-mono text-[11px] text-zinc-300">
      {status}
    </span>
  );
}

/** Provenienza del lead: scraping Google Maps vs form del sito. */
export function SourceBadge({ source }: { source: string }) {
  const web = source === "website";
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${
        web
          ? "bg-sky-500/15 text-sky-300 ring-sky-500/30"
          : "bg-violet-500/15 text-violet-300 ring-violet-500/30"
      }`}
    >
      {web ? "Sito" : "Maps"}
    </span>
  );
}
