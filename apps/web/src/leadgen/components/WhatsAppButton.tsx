"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function WhatsAppButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function go() {
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/leads/${id}/whatsapp`, { method: "POST" });
      const j = (await res.json().catch(() => ({}))) as { test?: boolean; error?: string };
      if (res.ok) {
        setMsg(j.test ? "Inviato (test) ✓" : "Inviato ✓");
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
        disabled={loading}
        className="inline-flex h-10 items-center rounded-lg bg-emerald-600 px-4 font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
      >
        {loading ? "Invio…" : "Invia WhatsApp"}
      </button>
      {msg && <span className="text-sm text-zinc-400">{msg}</span>}
    </div>
  );
}
