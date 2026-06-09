/**
 * Informativa privacy pubblica (GDPR artt. 13-14).
 *
 * Pagina PUBBLICA (in `NO_LOCALE` di proxy.ts → niente locale-redirect; nessun
 * gate Better Auth, che protegge solo /app e /admin). È l'URL a cui punta l'env
 * `PRIVACY_URL`, linkato nel footer email e nel WhatsApp free-form al primo
 * contatto. Identità del titolare letta dagli env (SENDER_*) con fallback.
 *
 * ⚠️ Testo da far validare da un legale prima di pubblicizzarlo (l'env
 * `PRIVACY_URL` non va settato finché il testo non è confermato). Finché non è
 * validato la pagina è `noindex` (vedi `metadata`).
 */

import { env } from "@maps/core";

export const dynamic = "force-dynamic";

export const metadata = {
  title: `Informativa privacy — ${env.SENDER_NAME || "Social Web Automation"}`,
  robots: { index: false, follow: false },
};

const C = {
  bg: "#0a0a0a",
  card: "#111113",
  text: "#e4e4e7",
  dim: "#a1a1aa",
  faint: "#71717a",
  border: "rgba(255,255,255,0.08)",
  link: "#8b9bff",
};

function H({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ fontSize: 18, fontWeight: 700, color: "#fff", margin: "32px 0 10px" }}>{children}</h2>
  );
}

function P({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <p style={{ fontSize: 15, lineHeight: 1.65, color: C.dim, margin: "0 0 12px", ...style }}>{children}</p>
  );
}

const SUBPROCESSORS: Array<[string, string, string]> = [
  ["Supabase", "Database / hosting CRM", "UE (Francoforte) · società USA"],
  ["Vercel", "Hosting applicazione", "USA"],
  ["Apify", "Raccolta dati da fonti pubbliche", "UE / USA"],
  ["Twilio + Meta Platforms", "Invio/ricezione messaggi WhatsApp", "USA / UE"],
  ["Resend (Amazon SES)", "Invio email", "UE (Irlanda) · società USA"],
  ["OpenRouter", "Generazione della demo (solo dati pubblici)", "USA"],
];

export default function PrivacyPage() {
  const titolare = env.SENDER_NAME || "Social Web Automation";
  const indirizzo = env.SENDER_ADDRESS;
  const piva = env.SENDER_VAT;
  const contatto = env.SALES_EMAIL || "info@socialwebautomation.com";

  return (
    <main
      style={{
        minHeight: "100dvh",
        background: C.bg,
        color: C.text,
        padding: "48px 24px",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <article style={{ maxWidth: 760, margin: "0 auto" }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#fff", margin: "0 0 6px" }}>
          Informativa sul trattamento dei dati personali
        </h1>
        <p style={{ fontSize: 13, color: C.faint, margin: "0 0 4px" }}>
          Resa ai sensi degli artt. 13-14 del Regolamento (UE) 2016/679 (GDPR)
        </p>
        <p style={{ fontSize: 13, color: C.faint, margin: 0 }}>Ultimo aggiornamento: 9 giugno 2026</p>

        <H>1. Titolare del trattamento</H>
        <P>
          <strong style={{ color: C.text }}>{titolare}</strong>
          {indirizzo ? ` — ${indirizzo}` : ""}
          {piva ? ` — P.IVA ${piva}` : ""}.
          {" "}Per qualsiasi richiesta in materia di protezione dei dati e per l'esercizio dei diritti:{" "}
          <a href={`mailto:${contatto}`} style={{ color: C.link }}>{contatto}</a>.
        </P>

        <H>2. Quali dati trattiamo</H>
        <P>
          Dati raccolti da <strong style={{ color: C.text }}>fonti pubbliche</strong> (Google Maps, profili
          Instagram pubblici, il sito web della tua attività, registri pubblici): denominazione dell'attività,
          categoria, indirizzo, telefono, email (se pubblicata), sito web, valutazioni e recensioni pubbliche,
          foto dell'esercizio, orari, eventuale profilo social.
        </P>
        <P>
          Dati che ci fornisci direttamente se rispondi o prenoti una demo: nome, recapiti, contenuto dei
          messaggi, preferenze sull'appuntamento; in caso di prenotazione dal sito, dati tecnici minimi (es.
          indirizzo IP) per sicurezza e prevenzione abusi. Non trattiamo categorie particolari di dati (art. 9)
          né dati di minori.
        </P>

        <H>3. Da dove provengono i dati (art. 14)</H>
        <P>
          Da fonti accessibili al pubblico: Google Maps, profili Instagram pubblici, il sito web della tua
          attività, registri pubblici. Trattiamo i recapiti che la tua attività ha reso pubblici a fini di
          contattabilità commerciale.
        </P>

        <H>4. Finalità e base giuridica</H>
        <P>
          • Proposta commerciale B2B dei nostri servizi (incl. invio di una demo gratuita) e relativa gestione
          CRM — <em>legittimo interesse</em> del titolare a promuovere i propri servizi verso potenziali clienti
          business (art. 6, par. 1, lett. f; Considerando 47).
          <br />• Riscontro alle tue richieste e gestione dell'eventuale prenotazione — <em>misure
          precontrattuali / esecuzione</em> su tua richiesta (art. 6, par. 1, lett. b).
          <br />• Adempimenti di legge e gestione delle richieste di opt-out — <em>obbligo legale</em> (art. 6,
          par. 1, lett. c).
          <br />• Sicurezza e prevenzione abusi — <em>legittimo interesse</em> (art. 6, par. 1, lett. f).
        </P>
        <P style={{ color: C.faint, fontSize: 14 }}>
          Per le comunicazioni elettroniche di marketing si applica anche l'art. 130 del Codice Privacy:
          rispettiamo le tue scelte e puoi opporti in qualsiasi momento (vedi §9).
        </P>

        <H>5. Il nostro legittimo interesse</H>
        <P>
          Promuovere i nostri servizi verso attività che potrebbero beneficiarne, trattando esclusivamente dati
          di contatto già pubblici e con opt-out immediato. Abbiamo svolto una valutazione di bilanciamento
          (LIA) disponibile su richiesta.
        </P>

        <H>6. Destinatari e responsabili del trattamento</H>
        <P>
          I dati possono essere trattati, per nostro conto e su nostre istruzioni, dai seguenti fornitori
          designati responsabili del trattamento (art. 28). Non vendiamo né cediamo i dati a terzi per loro
          autonome finalità di marketing.
        </P>
        <div style={{ border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden", margin: "0 0 12px" }}>
          {SUBPROCESSORS.map(([name, fn, loc], i) => (
            <div
              key={name}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 4,
                padding: "10px 14px",
                fontSize: 13.5,
                background: i % 2 ? "transparent" : C.card,
                borderTop: i ? `1px solid ${C.border}` : "none",
              }}
            >
              <div style={{ color: C.text, fontWeight: 600 }}>{name}</div>
              <div style={{ color: C.dim }}>{fn}</div>
              <div style={{ gridColumn: "1 / -1", color: C.faint, fontSize: 12.5 }}>{loc}</div>
            </div>
          ))}
        </div>

        <H>7. Trasferimenti extra-UE</H>
        <P>
          Alcuni fornitori hanno sede negli USA. I trasferimenti avvengono con garanzie adeguate ex artt. 44-49
          GDPR, in particolare Clausole Contrattuali Tipo (SCC, Dec. UE 2021/914) e/o adesione al Data Privacy
          Framework, ove applicabile. Puoi richiederci copia delle garanzie.
        </P>

        <H>8. Conservazione dei dati</H>
        <P>
          Lead non convertiti: per il tempo necessario all'iniziativa commerciale e comunque non oltre 24 mesi
          dall'ultimo contatto utile, salvo opposizione. In caso di opposizione/STOP: conserviamo i soli dati
          minimi necessari a non ricontattarti. Clienti: per la durata del rapporto e i termini di legge
          (fiscali/contabili). Dati tecnici (IP prenotazioni): periodo limitato per finalità di sicurezza.
        </P>

        <H>9. I tuoi diritti</H>
        <P>
          Hai diritto di accesso (15), rettifica (16), cancellazione (17), limitazione (18), portabilità (20,
          ove applicabile) e <strong style={{ color: C.text }}>opposizione (21)</strong>. Per il marketing
          diretto l'opposizione è un diritto incondizionato: se ti opponi, cessiamo immediatamente.
        </P>
        <P>
          <strong style={{ color: C.text }}>Come opporti o cancellarti, gratis e subito:</strong>
          <br />• WhatsApp: rispondi <strong style={{ color: C.text }}>STOP</strong>.
          <br />• Email: clicca <strong style={{ color: C.text }}>«Annulla l'iscrizione»</strong> nel messaggio.
          <br />• In ogni caso: scrivi a{" "}
          <a href={`mailto:${contatto}`} style={{ color: C.link }}>{contatto}</a>.
        </P>
        <P>
          Puoi proporre reclamo al{" "}
          <a href="https://www.garanteprivacy.it" style={{ color: C.link }} target="_blank" rel="noopener noreferrer">
            Garante per la protezione dei dati personali
          </a>{" "}
          e ricorrere all'autorità giudiziaria.
        </P>

        <H>10. Processo decisionale automatizzato</H>
        <P>
          Non adottiamo decisioni automatizzate che producano effetti giuridici o significativi su di te
          (art. 22). L'eventuale classificazione tecnica riguarda il sito web dell'attività, non la persona.
        </P>

        <H>11. Modifiche</H>
        <P>
          Eventuali aggiornamenti saranno pubblicati su questa pagina con la nuova data in calce.
        </P>
      </article>
    </main>
  );
}
