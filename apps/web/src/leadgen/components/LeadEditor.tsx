"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STATUSES = [
  "scraped", "classified", "generated", "approved", "contacted", "replied",
  "unsubscribed", "bounced", "suppressed",
];

export function LeadEditor({
  id,
  status,
  notes,
  email,
  phone,
  phoneType,
}: {
  id: string;
  status: string;
  notes: string | null;
  email: string | null;
  phone?: string | null;
  phoneType?: string | null;
}) {
  const router = useRouter();
  const [s, setS] = useState(status);
  const [n, setN] = useState(notes ?? "");
  const [e, setE] = useState(email ?? "");
  const [ph, setPh] = useState(phone ?? "");
  const [pt, setPt] = useState(phoneType ?? "");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/leads/${id}/update`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: s, notes: n, email: e, phone_e164: ph, phone_type: pt }),
      });
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      if (res.ok) {
        setMsg("Salvato ✓");
        router.refresh();
      } else {
        setMsg(j.error ?? "Errore");
      }
    } catch (err) {
      setMsg((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  const ctl = "w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-indigo-400 focus:outline-none";

  return (
    <div className="grid gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs text-zinc-500">Stato (pipeline)</span>
          <select className={ctl} value={s} onChange={(ev) => setS(ev.target.value)}>
            {STATUSES.map((st) => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs text-zinc-500">Email</span>
          <input className={ctl} value={e} onChange={(ev) => setE(ev.target.value)} placeholder="info@…" />
        </label>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs text-zinc-500">Telefono (E.164)</span>
          <input className={ctl} value={ph} onChange={(ev) => setPh(ev.target.value)} placeholder="+393476859658" />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs text-zinc-500">Tipo numero (mobile = abilita WhatsApp)</span>
          <select className={ctl} value={pt} onChange={(ev) => setPt(ev.target.value)}>
            <option value="">—</option>
            <option value="mobile">mobile</option>
            <option value="fixed">fixed</option>
            <option value="other">other</option>
          </select>
        </label>
      </div>
      <label className="block">
        <span className="mb-1 block text-xs text-zinc-500">Note</span>
        <textarea className={ctl} rows={3} value={n} onChange={(ev) => setN(ev.target.value)} placeholder="Appunti, esito chiamata, follow-up…" />
      </label>
      <div className="flex items-center gap-3">
        <button
          onClick={save}
          disabled={saving}
          className="inline-flex h-10 items-center rounded-lg bg-indigo-500 px-4 font-medium text-white hover:bg-indigo-400 disabled:opacity-50"
        >
          {saving ? "Salvo…" : "Salva"}
        </button>
        {msg && <span className="text-sm text-emerald-400">{msg}</span>}
      </div>
    </div>
  );
}
