"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function RegenerateButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function go() {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch(`/api/leads/${id}/regenerate`, { method: "POST" });
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      if (res.ok) router.refresh();
      else setErr(j.error ?? "Errore");
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
        className="inline-flex h-10 items-center rounded-lg border border-zinc-700 px-4 font-medium text-zinc-100 hover:bg-zinc-800 disabled:opacity-50"
      >
        {loading ? "Rigenero…" : "↻ Rigenera"}
      </button>
      {err && <span className="text-sm text-red-400">{err}</span>}
    </div>
  );
}
