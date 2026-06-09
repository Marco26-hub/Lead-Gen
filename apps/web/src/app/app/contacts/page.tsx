import Link from "next/link";
import { listWebsiteLeads } from "@/leadgen/lib/db";

export const dynamic = "force-dynamic";

function fmt(d: string): string {
  try {
    return new Date(d).toLocaleString("it-IT", { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return d;
  }
}

export default async function ContactsPage() {
  let leads: Awaited<ReturnType<typeof listWebsiteLeads>> = [];
  let dbError: string | null = null;
  try {
    leads = await listWebsiteLeads();
  } catch (e) {
    dbError = (e as Error).message;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Contatti dal sito</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Richieste arrivate dal form del sito ({leads.length}).
        </p>
      </div>

      {dbError ? (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">{dbError}</div>
      ) : leads.length === 0 ? (
        <p className="text-sm text-zinc-500">Nessun contatto dal sito ancora.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {leads.map((l) => (
            <div key={l.id} className="flex flex-col rounded-2xl border border-sky-500/20 bg-sky-500/5 p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="truncate font-semibold text-zinc-100">{l.business_name}</div>
                  {l.email && (
                    <a href={`mailto:${l.email}`} className="text-sm text-sky-300 hover:underline">
                      {l.email}
                    </a>
                  )}
                </div>
                <span className="shrink-0 rounded-md bg-zinc-800 px-2 py-0.5 font-mono text-[11px] text-zinc-300">
                  {l.status}
                </span>
              </div>
              {l.notes && (
                <p className="mt-3 whitespace-pre-wrap text-sm text-zinc-300">{l.notes}</p>
              )}
              <div className="mt-4 flex items-center justify-between text-xs text-zinc-500">
                <span>{fmt(l.created_at)}</span>
                <Link href={`/app/leads/${l.id}`} className="text-indigo-300 hover:underline">
                  Gestisci →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
