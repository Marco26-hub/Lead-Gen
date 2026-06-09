"use client";

import { useCallback, useEffect, useState } from "react";

interface WaMessage {
  id: string;
  direction: "in" | "out";
  body: string | null;
  media_url: string | null;
  created_at: string;
}
interface ThreadResp {
  messages: WaMessage[];
  lastInboundAt: string | null;
  windowOpen: boolean;
  sharedWith?: string[];
}

const WINDOW_MS = 24 * 60 * 60 * 1000;
const POLL_MS = 30_000;

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleString("it-IT", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

/**
 * WhatsApp conversation thread for a lead. Free-form replies are only allowed inside the 24h
 * customer-service window (last inbound from the lead); outside it the box is disabled and the
 * operator is pointed to the approved-template button. The window is evaluated live (client clock
 * + a timer that flips it exactly at expiry), and the thread polls so new inbound replies surface.
 */
export function WhatsAppConversation({ id }: { id: string }) {
  const [messages, setMessages] = useState<WaMessage[]>([]);
  const [lastInboundAt, setLastInboundAt] = useState<string | null>(null);
  const [sharedWith, setSharedWith] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [, tick] = useState(0); // force re-render at window expiry / on the poll clock

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/leads/${id}/whatsapp/thread`, { cache: "no-store" });
      if (!res.ok) return;
      const j = (await res.json()) as ThreadResp;
      setMessages(j.messages ?? []);
      setLastInboundAt(j.lastInboundAt ?? null);
      setSharedWith(j.sharedWith ?? []);
    } catch {
      /* transient — keep last state */
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
    const iv = setInterval(() => void load(), POLL_MS);
    return () => clearInterval(iv);
  }, [load]);

  // Flip the composer closed exactly when the 24h window lapses (no manual refresh needed).
  useEffect(() => {
    if (!lastInboundAt) return;
    const ms = new Date(lastInboundAt).getTime() + WINDOW_MS - Date.now();
    if (ms <= 0) return;
    const t = setTimeout(() => tick((x) => x + 1), ms + 500);
    return () => clearTimeout(t);
  }, [lastInboundAt]);

  const open = lastInboundAt != null && Date.now() - new Date(lastInboundAt).getTime() < WINDOW_MS;
  const hoursLeft = open && lastInboundAt
    ? Math.max(0, Math.ceil((new Date(lastInboundAt).getTime() + WINDOW_MS - Date.now()) / 3_600_000))
    : 0;

  async function send() {
    const t = text.trim();
    if (!t || sending) return;
    setSending(true);
    setErr(null);
    try {
      const res = await fetch(`/api/leads/${id}/whatsapp/thread`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: t }),
      });
      const j = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; warning?: string };
      if (res.ok && j.ok) {
        setText("");
        if (j.warning) setErr(j.warning);
        await load();
      } else {
        setErr(j.error ?? "Errore invio");
      }
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setSending(false);
    }
  }

  return (
    <div>
      {sharedWith.length > 0 && (
        <p className="mb-3 rounded-lg border border-amber-400/40 bg-amber-400/10 px-3 py-2 text-xs text-amber-200">
          ⚠ Numero condiviso con {sharedWith.length} altro/i lead ({sharedWith.join(", ")}). Le risposte in
          arrivo potrebbero essere associate al lead sbagliato.
        </p>
      )}
      <div className="mb-3 flex items-center justify-between gap-3">
        {open ? (
          <span className="text-xs text-emerald-300">● Finestra 24h aperta · ~{hoursLeft}h per rispondere libero</span>
        ) : (
          <span className="text-xs text-zinc-500">○ Finestra 24h chiusa</span>
        )}
        <button onClick={() => void load()} className="text-xs text-indigo-300 hover:underline" disabled={loading}>
          {loading ? "…" : "↻ Aggiorna"}
        </button>
      </div>

      <div className="max-h-80 space-y-2 overflow-y-auto rounded-lg border border-zinc-800 bg-zinc-950/40 p-3">
        {messages.length === 0 ? (
          <p className="py-6 text-center text-sm text-zinc-600">{loading ? "Carico…" : "Nessun messaggio ancora."}</p>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={`flex ${m.direction === "out" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                  m.direction === "out"
                    ? "bg-emerald-600/20 text-emerald-100 ring-1 ring-emerald-600/30"
                    : "bg-zinc-800 text-zinc-200"
                }`}
              >
                {m.body && <div className="whitespace-pre-wrap break-words">{m.body}</div>}
                {m.media_url && m.media_url.startsWith("https://") && (
                  <a href={m.media_url} target="_blank" rel="noreferrer" className="text-xs text-indigo-300 underline">
                    📎 media
                  </a>
                )}
                <div className="mt-1 text-[10px] text-zinc-500">{fmtTime(m.created_at)}</div>
              </div>
            </div>
          ))
        )}
      </div>

      {!open && (
        <p className="mt-3 rounded-lg border border-amber-400/30 bg-amber-400/5 px-3 py-2 text-xs text-amber-200">
          Fuori dalla finestra 24h non puoi scrivere in free-form. Attendi che il cliente risponda, oppure invia un
          template approvato con il bottone <strong>“Invia WhatsApp”</strong> qui sopra.
        </p>
      )}

      <div className="mt-3 flex items-end gap-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) void send();
          }}
          disabled={!open || sending}
          rows={2}
          placeholder={open ? "Scrivi una risposta… (Ctrl/⌘+Invio per inviare)" : "Finestra chiusa"}
          className="min-h-10 flex-1 resize-y rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 disabled:opacity-50"
        />
        <button
          onClick={() => void send()}
          disabled={!open || sending || !text.trim()}
          className="inline-flex h-10 items-center rounded-lg bg-emerald-600 px-4 font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
        >
          {sending ? "Invio…" : "Invia"}
        </button>
      </div>
      {err && <p className="mt-2 text-sm text-rose-300">{err}</p>}
    </div>
  );
}
