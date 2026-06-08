"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Attiva un trial 14gg senza carta per il lead corrente. Bottone visibile
 * nel CRM lead detail quando lo stato è `generated`/`approved`. Una volta
 * attivato passa il lead a `trialing` (refresh automatico → bottone Stripe
 * Checkout appare per il closing al giorno 14).
 *
 * Default package: ristorante-growth (il più frequente). Operatore può
 * selezionare un pacchetto diverso dal menu.
 */
const PACKAGES = [
  { id: "ristorante-growth", label: "Ristorante Growth €399/m" },
  { id: "ristorante-starter", label: "Ristorante Starter €99/m" },
  { id: "ristorante-premium", label: "Ristorante Premium €799/m" },
  { id: "salone-growth", label: "Salone Growth €349/m" },
  { id: "salone-starter", label: "Salone Starter €89/m" },
  { id: "salone-premium", label: "Salone Premium €699/m" },
  { id: "idraulico-growth", label: "Idraulico Growth €299/m" },
  { id: "idraulico-starter", label: "Idraulico Starter €79/m" },
  { id: "idraulico-premium", label: "Idraulico Premium €549/m" },
  { id: "sito-premium", label: "Sito Premium (solo landing) €99/m" },
  { id: "sito-smart", label: "Sito Smart (solo landing) €59/m" },
  { id: "solo-sito", label: "Solo Sito €29.90/m" },
];

export function TrialButton({ id, defaultPackage = "ristorante-growth" }: { id: string; defaultPackage?: string }) {
  const router = useRouter();
  const [pkg, setPkg] = useState(defaultPackage);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  async function go() {
    setLoading(true);
    setErr(null);
    setOk(null);
    try {
      const res = await fetch(`/api/leads/${id}/trial`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ package_id: pkg }),
      });
      const j = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; trial_ends_at?: string };
      if (res.ok && j.ok) {
        const end = j.trial_ends_at ? new Date(j.trial_ends_at).toLocaleDateString("it-IT", { day: "numeric", month: "short" }) : "";
        setOk(`Trial attivo fino al ${end}`);
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
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={pkg}
        disabled={loading}
        onChange={(e) => setPkg(e.target.value)}
        className="h-10 rounded-lg border border-zinc-700 bg-zinc-900 px-2 text-sm text-zinc-100 disabled:opacity-50"
      >
        {PACKAGES.map((p) => (
          <option key={p.id} value={p.id}>{p.label}</option>
        ))}
      </select>
      <button
        onClick={go}
        disabled={loading}
        className="inline-flex h-10 items-center rounded-lg bg-amber-400/20 px-4 font-medium text-amber-200 ring-1 ring-amber-400/40 hover:bg-amber-400/30 disabled:opacity-50"
      >
        {loading ? "Attivo trial…" : "▶ Avvia trial 14gg"}
      </button>
      {ok && <span className="text-sm text-emerald-400">{ok}</span>}
      {err && <span className="text-sm text-red-400">{err}</span>}
    </div>
  );
}
