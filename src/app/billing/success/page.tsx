/**
 * Pagina di atterraggio post-checkout Stripe per il cliente pagante.
 *
 * Stripe `success_url` puntava in precedenza a `/leads/[id]` che è dietro
 * Basic Auth → il cliente vedeva 401 dopo aver pagato. Questa pagina è
 * pubblica (allowlist in `middleware.ts`) e dà conferma immediata.
 *
 * NB: lo status del lead viene aggiornato a `paying` dal webhook Stripe, non
 * qui — non possiamo fidarci di un browser-redirect. Questa è solo UX.
 */

import Link from "next/link";

export const dynamic = "force-static";

export default function BillingSuccessPage() {
  return (
    <main
      style={{
        minHeight: "100dvh",
        background: "#0a0a0a",
        color: "#f5f5f5",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 24px",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 480,
          width: "100%",
          background: "linear-gradient(135deg, #0f1a14 0%, #0a0a0a 70%)",
          border: "1px solid rgba(74, 222, 128, 0.25)",
          borderRadius: 20,
          padding: "36px 28px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            margin: "0 auto 20px",
            borderRadius: "50%",
            background: "rgba(74, 222, 128, 0.15)",
            color: "#4ade80",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 36,
            fontWeight: 700,
          }}
        >
          ✓
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: "0 0 12px" }}>Pagamento ricevuto</h1>
        <p style={{ fontSize: 15, lineHeight: 1.6, color: "#a1a1aa", margin: "0 0 20px" }}>
          Grazie! Il vostro abbonamento è attivo. Vi ricontatteremo entro 24 ore lavorative per
          completare la configurazione del sito e degli altri servizi inclusi.
        </p>
        <p style={{ fontSize: 13, color: "#71717a", margin: "0 0 24px" }}>
          La ricevuta Stripe arriverà sulla mail usata al checkout. Conservatela: serve per la
          gestione self-service (cancellazione, fattura, aggiornamento carta).
        </p>
        <Link
          href="/"
          style={{
            display: "inline-block",
            background: "#5b6cff",
            color: "#fff",
            textDecoration: "none",
            padding: "12px 26px",
            borderRadius: 9999,
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          Chiudi
        </Link>
      </div>
    </main>
  );
}
