"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Fetch the lead's Instagram posts, rehost them, prepend to `leads.photos`.
 * Visible only when the lead carries an `instagram_handle` (the scrape stage
 * filled it from Maps' social field or the GMB website). Fuchsia variant so
 * it's visually distinct from Rigenera (zinc) and Approva (emerald).
 */
export function EnrichInstagramButton({ id, handle }: { id: string; handle: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  async function go() {
    setLoading(true);
    setErr(null);
    setOk(null);
    try {
      const res = await fetch(`/api/leads/${id}/enrich-instagram`, { method: "POST" });
      const j = (await res.json().catch(() => ({}))) as {
        error?: string;
        added?: number;
        total?: number;
      };
      if (res.ok) {
        setOk(`+${j.added ?? 0} foto (totale ${j.total ?? "?"})`);
        router.refresh();
      } else {
        setErr(j.error ?? "Errore");
      }
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={go}
        disabled={loading}
        title={`Recupera foto da @${handle}`}
        className="inline-flex h-10 items-center rounded-lg bg-fuchsia-500/15 px-4 font-medium text-fuchsia-200 ring-1 ring-fuchsia-500/30 hover:bg-fuchsia-500/25 disabled:opacity-50"
      >
        {loading ? "Carico foto IG…" : `↻ Foto IG (@${handle})`}
      </button>
      {ok && <span className="text-sm text-emerald-400">{ok}</span>}
      {err && <span className="text-sm text-red-400">{err}</span>}
    </div>
  );
}
