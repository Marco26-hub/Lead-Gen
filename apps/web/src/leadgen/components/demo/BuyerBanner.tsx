/**
 * Buyer-CTA banner mostrato in cima alla demo pubblica `/d/[slug]` quando il
 * lead NON è ancora pagante. Il BookingForm sotto è pensato per i clienti
 * del cliente (es. prenotare tavolo); il prospect (es. ristoratore) atterra
 * qui dal WhatsApp e deve poter contattarci direttamente.
 *
 * Si auto-nasconde quando `lead.status` diventa 'paying' o 'unsubscribed':
 * la pagina viene `revalidatePath`'ed dal webhook Stripe / dal flow STOP.
 *
 * Server component — niente JS lato client, solo link cliccabili.
 */
export interface BuyerBannerProps {
  /** Nome attività — usato nel testo del banner e nel messaggio WhatsApp pre-compilato. */
  businessName: string;
  /** URL Calendly/Cal.com per prenotare la call. Se vuoto, il bottone "Prenota call" non appare. */
  calendlyUrl: string;
  /** Numero WhatsApp sales E.164. Se vuoto, link wa.me non appare. */
  salesWhatsapp: string;
  /** Email sales fallback. */
  salesEmail: string;
}

export function BuyerBanner({ businessName, calendlyUrl, salesWhatsapp, salesEmail }: BuyerBannerProps) {
  const waMessage = encodeURIComponent(
    `Ciao, sono il titolare di ${businessName}. Ho visto l'anteprima del sito che mi avete preparato — vorrei attivarlo.`,
  );
  const waUrl = salesWhatsapp ? `https://wa.me/${salesWhatsapp.replace(/[^0-9]/g, "")}?text=${waMessage}` : "";
  const mailto = `mailto:${salesEmail}?subject=${encodeURIComponent(
    `Attivazione sito ${businessName}`,
  )}&body=${encodeURIComponent(`Ciao, sono il titolare di ${businessName}. Ho visto l'anteprima del sito che mi avete preparato — vorrei attivarlo.\n\n`)}`;

  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "linear-gradient(95deg, #1a1a1a 0%, #2a1a08 60%, #3d1810 100%)",
        color: "#fff",
        borderBottom: "1px solid rgba(255,193,7,0.35)",
        boxShadow: "0 2px 14px rgba(0,0,0,0.32)",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          padding: "10px 20px",
          fontSize: 14,
          lineHeight: 1.35,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 220 }}>
          <span
            aria-hidden
            style={{
              display: "inline-flex",
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "#ffc107",
              color: "#1a1a1a",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              flexShrink: 0,
            }}
          >
            !
          </span>
          <span>
            <strong style={{ color: "#ffc107" }}>Anteprima dimostrativa</strong> creata per{" "}
            <strong>{businessName}</strong>. Vuoi attivarla?
          </span>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {calendlyUrl && (
            <a
              href={calendlyUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                background: "#ffc107",
                color: "#1a1a1a",
                padding: "8px 16px",
                borderRadius: 999,
                fontWeight: 700,
                fontSize: 13,
                textDecoration: "none",
                letterSpacing: 0.2,
                whiteSpace: "nowrap",
              }}
            >
              Prenota call →
            </a>
          )}
          {waUrl ? (
            <a
              href={waUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                background: "rgba(255,255,255,0.12)",
                color: "#fff",
                padding: "8px 16px",
                borderRadius: 999,
                fontWeight: 600,
                fontSize: 13,
                textDecoration: "none",
                border: "1px solid rgba(255,255,255,0.25)",
                whiteSpace: "nowrap",
              }}
            >
              WhatsApp
            </a>
          ) : (
            <a
              href={mailto}
              style={{
                background: "rgba(255,255,255,0.12)",
                color: "#fff",
                padding: "8px 16px",
                borderRadius: 999,
                fontWeight: 600,
                fontSize: 13,
                textDecoration: "none",
                border: "1px solid rgba(255,255,255,0.25)",
                whiteSpace: "nowrap",
              }}
            >
              Email
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

