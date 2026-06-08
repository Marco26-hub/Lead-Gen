"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ModelOption } from "@/leadgen/lib/models";

export function ModelSelector({ models, current }: { models: ModelOption[]; current: string }) {
  const router = useRouter();
  const [model, setModel] = useState(current);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const known = models.some((m) => m.id === model);

  async function save() {
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch("/api/settings/model", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ model }),
      });
      if (res.ok) {
        setStatus("Salvato ✓");
        router.refresh();
      } else {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        setStatus(j.error ?? "Errore");
      }
    } catch (e) {
      setStatus((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-xl">
      <label className="mb-2 block text-sm font-medium text-zinc-300">Modello OpenRouter (generazione siti demo)</label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="min-w-0 flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 focus:border-indigo-400 focus:outline-none"
        >
          {!known && <option value={model}>{model} (corrente)</option>}
          {models.map((m) => (
            <option key={m.id} value={m.id}>
              {m.label} — {m.id}
            </option>
          ))}
        </select>
        <button
          onClick={save}
          disabled={saving || model === current}
          className="inline-flex h-11 items-center justify-center rounded-lg bg-indigo-500 px-5 font-medium text-white hover:bg-indigo-400 disabled:opacity-50"
        >
          {saving ? "Salvo…" : "Salva"}
        </button>
      </div>
      <p className="mt-2 text-xs text-zinc-500">
        {models.length > 0
          ? `${models.length} modelli con supporto tool-calling. Attuale: `
          : "Elenco modelli non disponibile (offline?). Attuale: "}
        <span className="font-mono text-zinc-400">{current}</span>
        {status && <span className="ml-3 text-emerald-400">{status}</span>}
      </p>
    </div>
  );
}
