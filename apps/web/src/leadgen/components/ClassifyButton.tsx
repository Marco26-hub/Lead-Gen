"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ClassifyButton({ pending }: { pending: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function go() {
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/classify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ limit: 6 }),
      });
      const j = (await res.json().catch(() => ({}))) as { advanced?: number; processed?: number; error?: string };
      if (res.ok) {
        setMsg(`Classificati ${j.advanced ?? 0}/${j.processed ?? 0}`);
        router.refresh();
      } else {
        setMsg(j.error ?? "Errore");
      }
    } catch (e) {
      setMsg((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={go}
        disabled={loading || pending === 0}
        className="inline-flex h-10 items-center rounded-lg border border-zinc-700 px-4 text-sm font-medium text-zinc-100 hover:bg-zinc-800 disabled:opacity-40"
      >
        {loading ? "Classifico…" : `Classifica pendenti (${pending})`}
      </button>
      {msg && <span className="text-sm text-zinc-400">{msg}</span>}
    </div>
  );
}
