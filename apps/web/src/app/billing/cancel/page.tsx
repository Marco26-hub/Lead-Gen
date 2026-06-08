/**
 * Pagina di atterraggio post-cancellazione Stripe Checkout (cliente che chiude
 * il flusso pagamento senza completarlo). Pubblica, non fa nulla lato DB.
 */

import Link from "next/link";

export const dynamic = "force-static";

export default function BillingCancelPage() {
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
          background: "linear-gradient(135deg, #1a1014 0%, #0a0a0a 70%)",
          border: "1px solid rgba(251, 191, 36, 0.25)",
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
            background: "rgba(251, 191, 36, 0.15)",
            color: "#fbbf24",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 32,
          }}
        >
          ⏸
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: "0 0 12px" }}>Pagamento annullato</h1>
        <p style={{ fontSize: 15, lineHeight: 1.6, color: "#a1a1aa", margin: "0 0 24px" }}>
          Non è stato addebitato nulla. Quando volete riprovare, riutilizzate il link che vi
          abbiamo mandato in chat — oppure contattateci, ne creiamo uno nuovo.
        </p>
        <Link
          href="/"
          style={{
            display: "inline-block",
            background: "rgba(255,255,255,0.08)",
            color: "#f5f5f5",
            textDecoration: "none",
            padding: "12px 26px",
            borderRadius: 9999,
            fontWeight: 600,
            fontSize: 14,
            border: "1px solid rgba(255,255,255,0.18)",
          }}
        >
          Chiudi
        </Link>
      </div>
    </main>
  );
}
