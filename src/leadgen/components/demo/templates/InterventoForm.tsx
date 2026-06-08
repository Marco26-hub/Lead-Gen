"use client";

import { useState } from "react";
import s from "./idraulica.module.css";

const cx = (...names: string[]) => names.map((n) => s[n] ?? n).join(" ");

const TIPI = [
  "Perdita / tubo rotto",
  "Scarico otturato / spurgo",
  "Caldaia o scaldabagno",
  "Sanitari / bagno",
  "Rubinetteria",
  "Altro / non so",
];

const URGENZE = [
  { value: "Programmabile", label: "Programmabile", sub: "Nei prossimi giorni", urgent: false },
  { value: "Entro 24 ore", label: "Entro 24 ore", sub: "Il prima possibile", urgent: false },
  { value: "Urgente ora", label: "Urgente ora", sub: "Emergenza in corso", urgent: true },
];

/** Emergency-intervention request form (demo — no real submit). */
export function InterventoForm({ phone }: { phone?: string | null }) {
  const [nome, setNome] = useState("");
  const [tel, setTel] = useState("");
  const [tipo, setTipo] = useState("");
  const [urgenza, setUrgenza] = useState("Entro 24 ore");
  const [desc, setDesc] = useState("");
  const [sent, setSent] = useState(false);

  const canSubmit = nome.trim().length > 1 && tel.trim().length > 4 && tipo !== "";
  const tel0 = phone ?? "";

  if (sent) {
    const first = nome.trim().split(" ")[0];
    const msg =
      urgenza === "Urgente ora"
        ? `Grazie ${first}! Stiamo già organizzando l'intervento. Per andare ancora più veloce, chiama subito${tel0 ? ` il ${tel0}` : ""}.`
        : urgenza === "Entro 24 ore"
          ? `Grazie ${first}! Ti richiamiamo entro pochi minuti per fissare l'intervento entro le prossime 24 ore.`
          : `Grazie ${first}! Abbiamo ricevuto la richiesta e ti ricontattiamo per concordare data e orario.`;
    return (
      <div className={cx("form-ok")}>
        <div className={cx("ic")}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
        </div>
        <h3>Richiesta inviata!</h3>
        <p>{msg}</p>
        <p className={cx("form-foot")}>Anteprima dimostrativa — nessuna richiesta reale inviata.</p>
      </div>
    );
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); if (canSubmit) setSent(true); }}>
      <h3>Richiedi un intervento</h3>
      <p className={cx("fc-sub")}>Ti ricontattiamo entro pochi minuti negli orari di ufficio.</p>

      <div className={cx("field-row")}>
        <div className={cx("field")}>
          <label>Nome <span className={cx("req")}>*</span></label>
          <input type="text" placeholder="Il tuo nome" value={nome} onChange={(e) => setNome(e.target.value)} />
        </div>
        <div className={cx("field")}>
          <label>Telefono <span className={cx("req")}>*</span></label>
          <input type="tel" inputMode="tel" placeholder="Es. 333 1234567" value={tel} onChange={(e) => setTel(e.target.value)} />
        </div>
      </div>

      <div className={cx("field")}>
        <label>Tipo di intervento <span className={cx("req")}>*</span></label>
        <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
          <option value="" disabled>Seleziona un servizio…</option>
          {TIPI.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div className={cx("field")}>
        <label>Livello di urgenza <span className={cx("req")}>*</span></label>
        <div className={cx("urgency")} role="radiogroup" aria-label="Livello di urgenza">
          {URGENZE.map((u) => (
            <label
              key={u.value}
              className={`${urgenza === u.value ? s["sel"] : ""} ${u.urgent ? s["urgente"] : ""}`}
              onClick={() => setUrgenza(u.value)}
            >
              {u.label}
              <span className={cx("u-sub")}>{u.sub}</span>
            </label>
          ))}
        </div>
      </div>

      {urgenza === "Urgente ora" && (
        <div className={`${s["urgent-note"]} ${s["show"]}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4M12 17h.01" /></svg>
          <span>Per un'emergenza in corso chiama subito{tel0 ? ` il ${tel0}` : ""}: è più veloce del modulo.</span>
        </div>
      )}

      <div className={cx("field")}>
        <label>Descrizione del problema</label>
        <textarea placeholder="Raccontaci cosa succede, da quanto tempo e in che zona di casa…" value={desc} onChange={(e) => setDesc(e.target.value)} />
      </div>

      <button type="submit" className={cx("btn", "btn-primary", "btn-lg", "form-submit")} disabled={!canSubmit}>
        Invia la richiesta
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
      </button>
      <p className={cx("form-foot")}>Nessun impegno · I tuoi dati non vengono condivisi</p>
    </form>
  );
}
