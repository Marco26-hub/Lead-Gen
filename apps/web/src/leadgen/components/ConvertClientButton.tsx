"use client";

import { useState, useTransition } from "react";
import { convertLeadToClient } from "@/app/app/actions";

export function ConvertClientButton({
  leadId,
  alreadyClient,
}: {
  leadId: string;
  alreadyClient: boolean;
}) {
  const [pending, start] = useTransition();
  const [done, setDone] = useState(alreadyClient);
  const [err, setErr] = useState<string | null>(null);

  if (done) {
    return (
      <span className="inline-flex h-9 items-center gap-1 rounded-lg bg-emerald-500/15 px-3 text-sm font-medium text-emerald-300 ring-1 ring-emerald-500/30">
        ✓ Cliente
      </span>
    );
  }

  return (
    <button
      disabled={pending}
      onClick={() =>
        start(async () => {
          setErr(null);
          const r = await convertLeadToClient(leadId);
          if (r.ok) setDone(true);
          else setErr(r.error ?? "Errore");
        })
      }
      className="inline-flex h-9 items-center rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 text-sm font-medium text-emerald-200 transition-colors hover:bg-emerald-500/20 disabled:opacity-50"
    >
      {pending ? "Converto…" : "★ Converti in cliente"}
      {err && <span className="ml-2 text-red-400">{err}</span>}
    </button>
  );
}
