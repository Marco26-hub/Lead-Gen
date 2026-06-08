import Link from "next/link";
import { leadCounts, type LeadCounts } from "@/leadgen/lib/db";
import { getLlmModel, env } from "@maps/core";

export const dynamic = "force-dynamic";

export default async function Home() {
  let counts: LeadCounts = { total: 0, high: 0, medium: 0, low: 0 };
  let dbError: string | null = null;
  try {
    counts = await leadCounts();
  } catch (e) {
    dbError = (e as Error).message;
  }

  const model = (await getLlmModel().catch(() => null)) ?? env.OPENROUTER_MODEL;

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Maps LeadGen</h1>
      <p className="mt-2 max-w-xl text-zinc-400">
        Estrazione lead da Google Maps, classificazione tecnografica del sito, demo AI e
        outreach conforme al GDPR.
      </p>

      {dbError ? (
        <div className="mt-8 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
          Database non ancora configurato.{" "}
          <span className="font-mono text-amber-300/80">{dbError}</span>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Totale lead" value={counts.total} />
          <Stat label="Priorità alta" value={counts.high} accent="text-red-300" />
          <Stat label="Priorità media" value={counts.medium} accent="text-amber-300" />
          <Stat label="Priorità bassa" value={counts.low} accent="text-emerald-300" />
        </div>
      )}

      <div className="mt-10 flex flex-wrap items-center gap-4">
        <Link
          href="/app/leads"
          className="inline-flex h-11 items-center rounded-lg bg-indigo-500 px-5 font-medium text-white transition-colors hover:bg-indigo-400"
        >
          Apri elenco lead →
        </Link>
        <Link
          href="/app/scrape"
          className="inline-flex h-11 items-center rounded-lg border border-zinc-700 px-5 font-medium text-zinc-200 transition-colors hover:bg-zinc-900"
        >
          Scraping
        </Link>
        <Link
          href="/app/settings"
          className="inline-flex h-11 items-center rounded-lg border border-zinc-700 px-5 font-medium text-zinc-200 transition-colors hover:bg-zinc-900"
        >
          Impostazioni
        </Link>
      </div>
      <p className="mt-4 text-sm text-zinc-400">
        Modello generazione: <span className="font-mono text-zinc-200">{model}</span>
      </p>
    </main>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <div className="rounded-xl border border-zinc-700 bg-zinc-900 p-4">
      <div className={`text-3xl font-semibold ${accent ?? "text-zinc-50"}`}>{value}</div>
      <div className="mt-1 text-xs font-medium text-zinc-300">{label}</div>
    </div>
  );
}
