import Link from "next/link";

export function WebsiteLeadsCard({ count }: { count: number }) {
  return (
    <Link
      href="/app/leads?source=website"
      className="group flex items-center gap-4 rounded-2xl border border-sky-500/30 bg-sky-500/10 p-5 transition-colors hover:bg-sky-500/15"
    >
      <span className="text-2xl">✉️</span>
      <div className="min-w-0">
        <div className="font-semibold text-sky-100">Contatti dal sito</div>
        <div className="text-xs text-sky-300/70">Richieste dal form del sito · apri →</div>
      </div>
      <span className="ml-auto text-2xl font-bold text-sky-200">{count}</span>
    </Link>
  );
}
