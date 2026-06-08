"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ScrapeForm() {
  const router = useRouter();
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");
  const [limit, setLimit] = useState(10);
  const [enrich, setEnrich] = useState(true);
  const [websiteFilter, setWf] = useState("all");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ city, category, limit, enrichContacts: enrich, websiteFilter }),
      });
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      if (res.ok) {
        setMsg({ ok: true, text: "Scraping avviato — i lead compaiono tra ~1-2 min (aggiorna la pagina)." });
        router.refresh();
      } else {
        setMsg({ ok: false, text: j.error ?? "Errore" });
      }
    } catch (err) {
      setMsg({ ok: false, text: (err as Error).message });
    } finally {
      setLoading(false);
    }
  }

  const input = "w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 focus:border-indigo-400 focus:outline-none";

  return (
    <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-zinc-400">Località</span>
        <input className={input} placeholder="es. Bari" value={city} onChange={(e) => setCity(e.target.value)} required />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-zinc-400">Tipo di attività</span>
        <input className={input} placeholder="es. ristoranti, avvocati, palestre" value={category} onChange={(e) => setCategory(e.target.value)} required />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-zinc-400">Max risultati</span>
        <input className={input} type="number" min={1} max={120} value={limit} onChange={(e) => setLimit(Number(e.target.value))} />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-zinc-400">Sito web</span>
        <select className={input} value={websiteFilter} onChange={(e) => setWf(e.target.value)}>
          <option value="all">Tutti</option>
          <option value="without">Solo SENZA sito (lead caldi)</option>
          <option value="with">Solo CON sito</option>
        </select>
      </label>
      <label className="flex items-center gap-2 text-sm text-zinc-300 sm:col-span-2">
        <input type="checkbox" checked={enrich} onChange={(e) => setEnrich(e.target.checked)} />
        Arricchimento contatti (estrai email/social dal sito) — costa un po' di più
      </label>
      <div className="flex items-center gap-3 sm:col-span-2">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-11 items-center rounded-lg bg-indigo-500 px-5 font-medium text-white hover:bg-indigo-400 disabled:opacity-50"
        >
          {loading ? "Avvio…" : "Avvia scraping"}
        </button>
        {msg && <span className={`text-sm ${msg.ok ? "text-emerald-400" : "text-red-400"}`}>{msg.text}</span>}
      </div>
    </form>
  );
}
