import Link from "next/link";
import type { SectorMeta } from "@/leadgen/lib/sectors";

const ACCENT: Record<string, string> = {
  amber: "text-amber-300",
  pink: "text-pink-300",
  emerald: "text-emerald-300",
  sky: "text-sky-300",
  violet: "text-violet-300",
  zinc: "text-zinc-200",
};

export interface CityCount {
  city: string;
  n: number;
}

export function SectorCard({
  meta,
  total,
  cities,
}: {
  meta: SectorMeta;
  total: number;
  cities: CityCount[];
}) {
  return (
    <div className="flex flex-col rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 transition-colors hover:border-zinc-700">
      <Link href={`/app/leads?sector=${meta.key}`} className="group flex items-center gap-3">
        <span className="text-2xl">{meta.icon}</span>
        <div className="min-w-0">
          <div className="truncate font-semibold text-zinc-100 group-hover:text-indigo-200">
            {meta.label}
          </div>
          <div className="text-xs text-zinc-500">{total} lead · apri →</div>
        </div>
        <span className={`ml-auto text-2xl font-bold ${ACCENT[meta.accent] ?? "text-zinc-200"}`}>
          {total}
        </span>
      </Link>

      {cities.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {cities.slice(0, 8).map((c) => (
            <Link
              key={c.city}
              href={`/app/leads?sector=${meta.key}&city=${encodeURIComponent(c.city)}`}
              className="inline-flex items-center gap-1 rounded-full border border-zinc-700/70 bg-zinc-800/60 px-2 py-0.5 text-xs text-zinc-300 transition-colors hover:border-indigo-500/50 hover:text-indigo-200"
            >
              {c.city === "__none__" ? "Senza città" : c.city}
              <span className="text-zinc-500">{c.n}</span>
            </Link>
          ))}
          {cities.length > 8 && (
            <span className="px-1 text-xs text-zinc-500">+{cities.length - 8}</span>
          )}
        </div>
      )}
    </div>
  );
}
