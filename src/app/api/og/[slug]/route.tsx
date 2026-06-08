import { ImageResponse } from "next/og";
import { getServiceClient, PageModelSchema } from "@maps/core";
import { isSafeImageUrl } from "@maps/core/storage";

/**
 * Open Graph screenshot endpoint per le demo pubbliche.
 * Renderizza la hero del lead come PNG 1200x630 (anteprima social).
 * Usato come `MediaUrl` nei messaggi WhatsApp di outreach e come
 * `og:image` nelle metadata di `/d/[slug]` (anteprime LinkedIn/Telegram).
 *
 * Node runtime (non Edge) perché `@maps/core` usa `node:fs` per caricare `.env`
 * dal root del monorepo. Costo: ~100ms cold start, ma la risposta è cached 24h
 * dal CDN Vercel (`s-maxage=86400`), quindi solo il primo hit paga il cold.
 */
export const runtime = "nodejs";

const WIDTH = 1200;
const HEIGHT = 630;

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sb = getServiceClient();
  const { data } = await sb
    .from("leads")
    .select("page_model, business_name, rating, review_count, photos")
    .eq("slug", slug)
    .maybeSingle();

  if (!data?.page_model) return fallbackImage("Anteprima sito");

  const parsed = PageModelSchema.safeParse(data.page_model);
  const tagline = parsed.success ? parsed.data.meta.tagline : "";
  const hero = pickHeroPhoto(data.photos);
  const name = String(data.business_name ?? "Demo");
  const rating = typeof data.rating === "number" ? data.rating : null;
  const reviews = typeof data.review_count === "number" ? data.review_count : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "#0a0a0a",
          color: "#f5f5f5",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Hero photo fullbleed */}
        {hero ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={hero}
            alt=""
            width={WIDTH}
            height={HEIGHT}
            style={{ position: "absolute", inset: 0, objectFit: "cover", width: "100%", height: "100%" }}
          />
        ) : (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 60%, #1f0f0a 100%)",
            }}
          />
        )}

        {/* Dark gradient overlay per leggibilità testo */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0.1) 75%)",
          }}
        />

        {/* Contenuto testo bottom-left */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            padding: 60,
            width: "100%",
            height: "100%",
          }}
        >
          {/* Eyebrow */}
          <div
            style={{
              fontSize: 22,
              letterSpacing: 6,
              textTransform: "uppercase",
              color: "#d4a017",
              fontWeight: 600,
              marginBottom: 20,
            }}
          >
            Anteprima sito
          </div>

          {/* Business name */}
          <div
            style={{
              fontSize: 78,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: -1,
              color: "#fff",
              marginBottom: 18,
              textShadow: "0 4px 24px rgba(0,0,0,0.6)",
              maxWidth: 1000,
            }}
          >
            {truncate(name, 60)}
          </div>

          {/* Tagline */}
          {tagline && (
            <div
              style={{
                fontSize: 30,
                lineHeight: 1.3,
                color: "rgba(245,245,245,0.88)",
                maxWidth: 900,
                marginBottom: 28,
              }}
            >
              {truncate(tagline, 110)}
            </div>
          )}

          {/* Rating pill */}
          {rating != null && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                fontSize: 26,
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.25)",
                borderRadius: 999,
                padding: "12px 22px",
                alignSelf: "flex-start",
                backdropFilter: "blur(12px)",
              }}
            >
              <span style={{ color: "#ffc107", fontWeight: 700 }}>★ {rating.toFixed(1)}</span>
              {reviews && <span style={{ color: "rgba(245,245,245,0.7)" }}>· {reviews} recensioni</span>}
            </div>
          )}
        </div>

        {/* Brand mark top-right */}
        <div
          style={{
            position: "absolute",
            top: 36,
            right: 48,
            zIndex: 2,
            fontSize: 18,
            letterSpacing: 4,
            color: "rgba(255,255,255,0.7)",
            textTransform: "uppercase",
            fontWeight: 600,
            background: "rgba(0,0,0,0.4)",
            padding: "8px 16px",
            borderRadius: 6,
            border: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          socialwebautomation.com
        </div>
      </div>
    ),
    {
      width: WIDTH,
      height: HEIGHT,
      headers: {
        // Cache aggressivo: i lead cambiano raramente, e quando cambiano
        // (rigenerazione, photo curation) `revalidatePath` invalida anche questa.
        "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      },
    },
  );
}

/** Fallback PNG quando il lead non esiste o non ha page_model. */
function fallbackImage(text: string) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)",
          color: "#f5f5f5",
          fontSize: 60,
          fontWeight: 700,
          fontFamily: "system-ui",
        }}
      >
        {text}
      </div>
    ),
    { width: WIDTH, height: HEIGHT },
  );
}

/**
 * Sceglie la prima foto SAFE (host allowlist + https) — next/og fetcha l'URL
 * server-side dall'egress Vercel, quindi senza la validazione un URL che venga
 * stuffed nella tabella `leads.photos` diventa un SSRF probe (port scan,
 * metadata services, etc.). Vedi `isSafeImageUrl` in `@maps/core/storage`.
 */
function pickHeroPhoto(photos: unknown): string | undefined {
  if (!Array.isArray(photos)) return undefined;
  for (const p of photos) {
    if (typeof p === "string" && isSafeImageUrl(p)) return p;
  }
  return undefined;
}

function truncate(s: string, n: number): string {
  if (s.length <= n) return s;
  return s.slice(0, n - 1).trimEnd() + "…";
}
