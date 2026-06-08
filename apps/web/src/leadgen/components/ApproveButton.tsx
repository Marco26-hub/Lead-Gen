"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ApproveButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function approve() {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch(`/api/leads/${id}/approve`, { method: "POST" });
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
        onClick={approve}
        disabled={loading}
        className="inline-flex h-10 items-center rounded-lg bg-emerald-500 px-4 font-medium text-white hover:bg-emerald-400 disabled:opacity-50"
      >
        {loading ? "Invio…" : "Approva → coda invio"}
      </button>
      {err && <span className="text-sm text-red-400">{err}</span>}
    </div>
  );
}
