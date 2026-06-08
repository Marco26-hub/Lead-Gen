import Link from "next/link";
import { listScrapeJobs, pendingScrapedCount } from "@/leadgen/lib/db";
import { ScrapeForm } from "@/leadgen/components/ScrapeForm";
import { ClassifyButton } from "@/leadgen/components/ClassifyButton";

export const dynamic = "force-dynamic";

const JOB_BADGE: Record<string, string> = {
  pending: "bg-zinc-700/40 text-zinc-300",
  running: "bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30",
  done: "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30",
  error: "bg-red-500/15 text-red-300 ring-1 ring-red-500/30",
};

export default async function ScrapePage() {
  let jobs: Awaited<ReturnType<typeof listScrapeJobs>> = [];
  let pending = 0;
  let dbError: string | null = null;
  try {
    [jobs, pending] = await Promise.all([listScrapeJobs(), pendingScrapedCount()]);
  } catch (e) {
    dbError = (e as Error).message;
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/app" className="text-sm text-zinc-500 hover:text-zinc-300">← Dashboard</Link>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Scraping</h1>
        </div>
        <Link href="/app/leads" className="text-sm text-indigo-300 hover:underline">Vai ai lead →</Link>
      </div>

      <section className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-400">Nuova ricerca</h2>
        <ScrapeForm />
      </section>

      <section className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
        <span className="text-sm text-zinc-400">
          Dopo lo scraping, classifica i nuovi lead (sito vecchio / nessun sito → priorità).
        </span>
        <ClassifyButton pending={pending} />
      </section>

      <section className="mt-6">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-400">Lavori recenti</h2>
        {dbError ? (
          <p className="text-sm text-amber-300">{dbError}</p>
        ) : jobs.length === 0 ? (
          <p className="text-sm text-zinc-500">Nessun lavoro ancora.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-zinc-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-900/70 text-xs uppercase tracking-wide text-zinc-400">
                <tr>
                  <th className="px-4 py-3">Quando</th>
                  <th className="px-4 py-3">Località</th>
                  <th className="px-4 py-3">Categoria</th>
                  <th className="px-4 py-3">Stato</th>
                  <th className="px-4 py-3">Lead</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {jobs.map((j) => (
                  <tr key={j.id} className="hover:bg-zinc-900/40">
                    <td className="px-4 py-3 text-zinc-400">{new Date(j.created_at).toLocaleString("it-IT")}</td>
                    <td className="px-4 py-3 text-zinc-200">{j.city ?? "—"}</td>
                    <td className="px-4 py-3 text-zinc-200">{j.category ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${JOB_BADGE[j.status] ?? ""}`}>
                        {j.status}
                      </span>
                      {j.error && <span className="ml-2 text-xs text-red-400" title={j.error}>⚠</span>}
                    </td>
                    <td className="px-4 py-3 text-zinc-300">{j.lead_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
