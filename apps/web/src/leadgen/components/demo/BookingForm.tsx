"use client";

import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import type { CtaConfig } from "@maps/core";
import styles from "./demo.module.css";

/** Maps il CTA kind del template al `booking_kind` enum DB. */
function ctaKindToBookingKind(k: CtaConfig["kind"]): string {
  if (k === "booking") return "booking";
  if (k === "reservation") return "reservation";
  if (k === "appointment") return "appointment";
  if (k === "quote") return "quote";
  return "contact";
}

const WEEKDAYS = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];
const MONTHS = [
  "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
  "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre",
];

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function buildMonth(view: Date): (Date | null)[] {
  const y = view.getFullYear();
  const m = view.getMonth();
  const lead = (new Date(y, m, 1).getDay() + 6) % 7; // Monday-first
  const days = new Date(y, m + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < lead; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push(new Date(y, m, d));
  return cells;
}

export function BookingForm({
  config,
  businessName,
}: {
  config: CtaConfig;
  businessName: string;
}) {
  const today = useMemo(() => startOfDay(new Date()), []);
  const [view, setView] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState("");
  const [party, setParty] = useState(2);
  const [service, setService] = useState(config.serviceOptions?.[0] ?? "");
  const [name, setName] = useState("");
  const [tel, setTel] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Honeypot: campo nascosto visivamente. Solo i bot lo riempiono.
  // Va inviato come parte del JSON: l'API decide cosa farne (200 silenzioso).
  const [website, setWebsite] = useState("");

  // pathname è `/d/<slug>` quando il form è renderizzato sulla demo pubblica.
  // In `/preview/<template>` il form non ha uno slug reale → fallback "demo".
  const pathname = usePathname() ?? "";
  const slug = pathname.startsWith("/d/") ? pathname.slice(3) : null;

  const cells = useMemo(() => buildMonth(view), [view]);
  const monthFloor = new Date(today.getFullYear(), today.getMonth(), 1).getTime();
  const maxMonth = new Date(today.getFullYear(), today.getMonth() + 3, 1).getTime();
  const canPrev = view.getTime() > monthFloor;
  const canNext = view.getTime() < maxMonth;

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const canSubmit =
    name.trim().length > 1 &&
    tel.trim().length > 4 &&
    (!config.withCalendar || date !== null) &&
    (!config.withTime || time !== "") &&
    (!config.requireEmail || emailOk);

  function shiftMonth(delta: number) {
    setView((v) => new Date(v.getFullYear(), v.getMonth() + delta, 1));
  }

  if (sent) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center text-center">
        <div
          className="mb-4 flex h-16 w-16 items-center justify-center rounded-full text-3xl"
          style={{ background: "color-mix(in srgb, var(--accent) 22%, transparent)", color: "var(--accent)" }}
        >
          ✓
        </div>
        <h3 className={`${styles.display} text-2xl font-bold`}>{config.successTitle}</h3>
        <p className="mt-2 max-w-xs text-sm" style={{ color: "var(--muted)" }}>{config.successMsg}</p>
        {(date || time) && (
          <p className="mt-4 text-sm font-medium">
            {date ? `${date.getDate()} ${MONTHS[date.getMonth()]}` : ""}
            {time ? ` · ${time}` : ""}
            {config.withParty ? ` · ${party} coperti` : ""}
          </p>
        )}
        <p className="mt-6 text-[11px]" style={{ color: "var(--muted)" }}>
          Anteprima dimostrativa — nessuna richiesta reale inviata.
        </p>
      </div>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || submitting) return;
    setError(null);

    // Su `/preview/<template>` non c'è uno slug reale → mock immediato (come prima).
    if (!slug) {
      setSent(true);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/d/${slug}/book`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          kind: ctaKindToBookingKind(config.kind),
          date: date ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}` : undefined,
          time: time || undefined,
          partySize: config.withParty ? party : undefined,
          service: service || undefined,
          name: name.trim(),
          phone: tel.trim(),
          email: email.trim() || undefined,
          message: message.trim() || undefined,
          website, // honeypot — bot riempie, gli umani no
        }),
      });
      const j = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (res.ok && j.ok) {
        setSent(true);
      } else {
        setError(j.error ?? "Errore invio. Riprova fra qualche minuto.");
      }
    } catch (err) {
      setError((err as Error).message ?? "Errore di rete");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      <div>
        <h3 className={`${styles.display} text-xl font-bold`}>{config.title}</h3>
        <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>{config.sub}</p>
      </div>

      {config.serviceOptions && config.serviceOptions.length > 0 && (
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted)" }}>
            {config.serviceLabel ?? "Servizio"}
          </span>
          <select className={styles.formCtl} value={service} onChange={(e) => setService(e.target.value)}>
            {config.serviceOptions.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </label>
      )}

      {config.withCalendar && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <button type="button" className={styles.stepBtn} onClick={() => canPrev && shiftMonth(-1)} disabled={!canPrev} aria-label="Mese precedente">‹</button>
            <span className="text-sm font-semibold">{MONTHS[view.getMonth()]} {view.getFullYear()}</span>
            <button type="button" className={styles.stepBtn} onClick={() => canNext && shiftMonth(1)} disabled={!canNext} aria-label="Mese successivo">›</button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-[11px]" style={{ color: "var(--muted)" }}>
            {WEEKDAYS.map((w) => <span key={w} className="py-1">{w}</span>)}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {cells.map((c, i) => {
              if (!c) return <span key={i} />;
              const disabled = startOfDay(c).getTime() < today.getTime();
              const selected = date !== null && startOfDay(c).getTime() === startOfDay(date).getTime();
              return (
                <button
                  type="button"
                  key={i}
                  disabled={disabled}
                  onClick={() => setDate(c)}
                  className={`${styles.dayBtn} ${selected ? styles.daySel : ""}`}
                >
                  {c.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {config.withTime && (
        <div className="flex flex-wrap gap-2">
          {config.timeSlots.map((s) => (
            <button
              type="button"
              key={s}
              onClick={() => setTime(s)}
              className={`${styles.slotBtn} ${time === s ? styles.slotSel : ""}`}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {config.withParty && (
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Coperti</span>
          <div className="flex items-center gap-3">
            <button type="button" className={styles.stepBtn} onClick={() => setParty((p) => Math.max(1, p - 1))} aria-label="Meno">−</button>
            <span className="w-6 text-center font-semibold">{party}</span>
            <button type="button" className={styles.stepBtn} onClick={() => setParty((p) => Math.min(16, p + 1))} aria-label="Più">+</button>
          </div>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <input className={styles.formCtl} placeholder="Nome e cognome" value={name} onChange={(e) => setName(e.target.value)} />
        <input className={styles.formCtl} placeholder={config.phoneLabel ?? "Telefono"} value={tel} onChange={(e) => setTel(e.target.value)} inputMode="tel" />
      </div>
      {config.askEmail && (
        <input
          className={styles.formCtl}
          placeholder={config.requireEmail ? "Email (per la conferma)" : "Email"}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      )}
      {config.withMessage && (
        <textarea className={styles.formCtl} placeholder="Messaggio" rows={3} value={message} onChange={(e) => setMessage(e.target.value)} />
      )}
      {config.confirmNote && (
        <p className="text-[11px] leading-relaxed" style={{ color: "var(--muted)" }}>{config.confirmNote}</p>
      )}

      {/* Honeypot: bot riempie, gli umani non lo vedono. Bound a `website` state
          per essere effettivamente serializzato nel payload (defense funzionante). */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
        aria-hidden="true"
      />

      <button type="submit" className={styles.submitBtn} disabled={!canSubmit || submitting}>
        {submitting ? "Invio…" : config.submitLabel}
      </button>
      {error && (
        <p className="text-center text-xs" style={{ color: "#dc2626" }}>{error}</p>
      )}
      {!slug && (
        <p className="text-center text-[11px]" style={{ color: "var(--muted)" }}>
          Modulo dimostrativo per {businessName} — invio simulato.
        </p>
      )}
    </form>
  );
}
