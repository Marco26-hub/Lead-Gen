import { resolveTheme, resolveCta } from "@maps/core";
import styles from "../demo.module.css";
import { BookingForm } from "../BookingForm";
import { FontLinks, initials, stars } from "./shared";
import type { DemoProps } from "./types";

/**
 * Editorial — the original atmospheric layout. Default template for every preset
 * except those with a dedicated template. Content-only; ignores photos.
 */
export function Editorial({ model, rating, reviewCount }: DemoProps) {
  const t = resolveTheme(model.theme.preset);
  const cta = resolveCta(model.theme.preset);
  const rootVars = {
    "--bg": t.palette.bg,
    "--surface": t.palette.surface,
    "--primary": t.palette.primary,
    "--accent": t.palette.accent,
    "--text": t.palette.text,
    "--muted": t.palette.muted,
    "--fh": t.font.heading,
    "--fb": t.font.body,
  } as React.CSSProperties;

  return (
    <>
      <FontLinks />

      <div className={styles.root} style={rootVars}>
        <div className={styles.blob} style={{ width: 520, height: 520, top: -160, right: -120, background: "var(--primary)" }} />
        <div className={styles.blob} style={{ width: 460, height: 460, bottom: -160, left: -140, background: "var(--accent)" }} />

        <div className={styles.content}>
          {/* Nav */}
          <header className="sticky top-0 z-40">
            <div className={`${styles.glass} mx-auto mt-4 flex max-w-6xl items-center justify-between rounded-full px-5 py-3`}>
              <span className={`${styles.display} text-lg font-bold tracking-tight`}>{model.meta.businessName}</span>
              <nav className="hidden items-center gap-7 text-sm font-medium sm:flex" style={{ color: "var(--muted)" }}>
                <a href="#servizi" className="transition-colors hover:text-[var(--text)]">Servizi</a>
                <a href="#storia" className="transition-colors hover:text-[var(--text)]">Chi siamo</a>
                <a href="#contatti" className="transition-colors hover:text-[var(--text)]">Contatti</a>
              </nav>
              <a href="#contatti" className={styles.btnPrimary} style={{ padding: "0.6rem 1.2rem" }}>
                {model.hero.ctaLabel}
              </a>
            </div>
          </header>

          {/* Hero */}
          <section className="mx-auto max-w-6xl px-6 pb-20 pt-16 sm:pt-24">
            <p className={`${styles.eyebrow} ${styles.reveal} text-xs sm:text-sm`} style={{ animationDelay: "60ms" }}>
              {model.meta.tagline}
            </p>
            <h1
              className={`${styles.display} ${styles.gradientText} ${styles.reveal} mt-5 max-w-4xl text-5xl font-extrabold sm:text-7xl`}
              style={{ animationDelay: "140ms" }}
            >
              {model.hero.headline}
            </h1>
            <p
              className={`${styles.reveal} mt-6 max-w-2xl text-lg leading-relaxed sm:text-xl`}
              style={{ color: "var(--muted)", animationDelay: "240ms" }}
            >
              {model.hero.sub}
            </p>
            <div className={`${styles.reveal} mt-9 flex flex-wrap items-center gap-4`} style={{ animationDelay: "340ms" }}>
              <a href="#contatti" className={styles.btnPrimary}>{model.hero.ctaLabel} <span aria-hidden>→</span></a>
              <a href="#servizi" className={styles.btnGhost}>Scopri di più</a>
              {rating != null && (
                <div className={`${styles.floaty} flex items-center gap-2 rounded-full px-4 py-2`} style={{ background: "color-mix(in srgb, var(--surface) 80%, transparent)" }}>
                  <span style={{ color: "var(--accent)" }}>{stars(rating)}</span>
                  <span className="text-sm font-semibold">{rating.toFixed(1)}</span>
                  {reviewCount ? <span className="text-sm" style={{ color: "var(--muted)" }}>· {reviewCount} recensioni</span> : null}
                </div>
              )}
            </div>
          </section>

          {/* Stats band */}
          <section className="mx-auto max-w-6xl px-6">
            <div className={`${styles.glass} grid grid-cols-2 gap-px overflow-hidden rounded-3xl sm:grid-cols-3`}>
              <Stat big={rating != null ? rating.toFixed(1) : "★"} label="Valutazione media" t={t} />
              <Stat big={reviewCount ? `${reviewCount}` : "100%"} label={reviewCount ? "Recensioni reali" : "Passione locale"} t={t} />
              <Stat big={model.meta.category} label="La nostra specialità" t={t} span />
            </div>
          </section>

          {/* Services */}
          <section id="servizi" className="mx-auto max-w-6xl px-6 py-24">
            <div className="mb-12 flex items-end justify-between gap-6">
              <h2 className={`${styles.display} text-3xl font-bold sm:text-5xl`}>Cosa offriamo</h2>
              <div className={`${styles.rule} hidden flex-1 sm:block`} />
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {model.services.map((s, i) => (
                <div key={i} className={`${styles.card} ${styles.reveal} p-7`} style={{ animationDelay: `${i * 80}ms` }}>
                  <div className={styles.num}>{String(i + 1).padStart(2, "0")}</div>
                  <h3 className={`${styles.display} mt-4 text-xl font-semibold`}>{s.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--muted)" }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Testimonials */}
          {model.testimonials.length > 0 && (
            <section className="mx-auto max-w-6xl px-6 pb-24">
              <p className={styles.eyebrow} style={{ fontSize: "0.75rem" }}>Le parole dei clienti</p>
              <h2 className={`${styles.display} mt-3 mb-12 text-3xl font-bold sm:text-5xl`}>Dicono di noi</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {model.testimonials.map((r, i) => (
                  <figure key={i} className={`${styles.card} ${styles.reveal} flex flex-col p-7`} style={{ animationDelay: `${i * 90}ms` }}>
                    <span className={styles.quoteMark} aria-hidden>&ldquo;</span>
                    <blockquote className="-mt-4 flex-1 text-[15px] leading-relaxed">{r.quote}</blockquote>
                    <figcaption className="mt-5 flex items-center gap-3">
                      <span
                        className={`${styles.display} flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold`}
                        style={{ background: "color-mix(in srgb, var(--accent) 22%, transparent)", color: "var(--accent)" }}
                      >
                        {initials(r.author)}
                      </span>
                      <span>
                        <span className="block text-sm font-semibold">{r.author}</span>
                        <span className="block text-xs" style={{ color: "var(--accent)" }}>{stars(r.rating ?? 5)}</span>
                      </span>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </section>
          )}

          {/* About */}
          <section id="storia" className="mx-auto max-w-6xl px-6 py-12">
            <div className={`${styles.glass} grid items-center gap-10 overflow-hidden rounded-[2rem] p-8 sm:p-14 lg:grid-cols-[1.4fr_1fr]`}>
              <div>
                <p className={styles.eyebrow} style={{ fontSize: "0.75rem" }}>La nostra storia</p>
                <h2 className={`${styles.display} mt-3 text-3xl font-bold sm:text-4xl`}>{model.about.title}</h2>
                <p className={`${styles.dropcap} mt-5 leading-relaxed`} style={{ color: "var(--muted)" }}>{model.about.body}</p>
              </div>
              <div className="flex items-center justify-center">
                <div className={`${styles.monogram} ${styles.floaty} select-none`} aria-hidden>{initials(model.meta.businessName)}</div>
              </div>
            </div>
          </section>

          {/* Contact + category-coherent booking module */}
          <section id="contatti" className="mx-auto max-w-6xl px-6 py-20">
            <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
              <div className={`${styles.contactPanel} relative rounded-[2rem] p-9 sm:p-12`}>
                <div className="relative">
                  <p className={styles.eyebrow} style={{ color: "rgba(255,255,255,.85)", fontSize: "0.75rem" }}>Contatti</p>
                  <h2 className={`${styles.display} mt-3 text-3xl font-extrabold sm:text-4xl`}>{model.contact.ctaLabel}</h2>
                  {model.contact.note && <p className="mt-3 max-w-sm text-base opacity-90">{model.contact.note}</p>}
                  <div className="mt-7 flex flex-wrap gap-3">
                    {model.contact.phone && <a href={`tel:${model.contact.phone}`} className={styles.chip}>☎ {model.contact.phone}</a>}
                    {model.contact.address && <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(model.contact.address)}`} target="_blank" rel="noreferrer" className={styles.chip}>📍 {model.contact.address}</a>}
                  </div>
                </div>
              </div>
              <div className={`${styles.glass} rounded-[2rem] p-7 sm:p-9`}>
                <BookingForm config={cta} businessName={model.meta.businessName} />
              </div>
            </div>
          </section>

          <footer className="mx-auto max-w-6xl px-6 pb-12 text-center text-xs" style={{ color: "var(--muted)" }}>
            Anteprima realizzata per <strong>{model.meta.businessName}</strong> · bozza dimostrativa.
          </footer>
        </div>
      </div>
    </>
  );
}

function Stat({
  big,
  label,
  t,
  span,
}: {
  big: string;
  label: string;
  t: ReturnType<typeof resolveTheme>;
  span?: boolean;
}) {
  return (
    <div
      className={`p-6 text-center sm:p-8 ${span ? "col-span-2 sm:col-span-1" : ""}`}
      style={{ background: "color-mix(in srgb, var(--surface) 60%, transparent)" }}
    >
      <div className={`${styles.display} truncate text-2xl font-extrabold sm:text-3xl`} style={{ color: t.palette.accent }}>
        {big}
      </div>
      <div className="mt-1 text-xs uppercase tracking-wider" style={{ color: "var(--muted)" }}>{label}</div>
    </div>
  );
}
