import { resolveTheme, resolveCta } from "@maps/core";
import styles from "./ristorante.module.css";
import { BookingForm } from "../BookingForm";
import { FontLinks, stars, splitPhotos } from "./shared";
import type { DemoProps } from "./types";

/**
 * RistoranteClassic — the rich restaurant master template.
 * Warm candle-lit editorial look: full-bleed real photography, Playfair display,
 * a printed-style "La Carta" menu with dotted leaders, gallery, hours and a
 * reservation module (reuses the restaurant CTA + BookingForm).
 * Degrades gracefully when a lead has no photos / no menu.
 */
export function RistoranteClassic({ model, rating, reviewCount, photos, openingHours }: DemoProps) {
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

  const { pics, hero: heroPhoto, gallery, aboutPhoto } = splitPhotos(photos);
  const hours = openingHours ?? [];
  const menu = model.menu;
  const name = model.meta.businessName;

  return (
    <>
      <FontLinks />

      <div className={styles.root} style={rootVars}>
        <div className={styles.content}>
          {/* Nav */}
          <header className="sticky top-0 z-40">
            <div className={`${styles.nav} flex items-center justify-between px-6 py-4`}>
              <span className={`${styles.display} text-lg font-bold`}>{name}</span>
              <nav className="hidden items-center gap-8 text-sm font-medium sm:flex" style={{ color: "var(--muted)" }}>
                {menu && <a href="#menu" className="transition-colors hover:text-[var(--text)]">Menù</a>}
                {gallery.length > 0 && <a href="#galleria" className="transition-colors hover:text-[var(--text)]">Galleria</a>}
                <a href="#prenota" className="transition-colors hover:text-[var(--text)]">Contatti</a>
              </nav>
              <a href="#prenota" className={styles.btnPrimary} style={{ padding: "0.55rem 1.2rem" }}>
                {model.hero.ctaLabel}
              </a>
            </div>
          </header>

          {/* Hero */}
          <section className={styles.hero}>
            {heroPhoto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className={styles.heroMedia} src={heroPhoto} alt={`${name} — ambiente`} />
            ) : (
              <div className={styles.heroNoPhoto} />
            )}
            <div className={styles.heroScrim} />
            <div className="relative mx-auto w-full max-w-6xl px-6 pb-16 sm:pb-24">
              <p className={`${styles.eyebrow} ${styles.reveal}`} style={{ animationDelay: "60ms" }}>{model.meta.tagline}</p>
              <h1
                className={`${styles.display} ${styles.reveal} mt-4 max-w-4xl text-5xl font-extrabold sm:text-7xl lg:text-8xl`}
                style={{ animationDelay: "160ms" }}
              >
                {model.hero.headline}
              </h1>
              <p
                className={`${styles.reveal} mt-6 max-w-2xl text-lg leading-relaxed sm:text-xl`}
                style={{ color: "var(--muted)", animationDelay: "260ms" }}
              >
                {model.hero.sub}
              </p>
              <div className={`${styles.reveal} mt-9 flex flex-wrap items-center gap-4`} style={{ animationDelay: "360ms" }}>
                <a href="#prenota" className={styles.btnPrimary}>{model.hero.ctaLabel} <span aria-hidden>→</span></a>
                {menu && <a href="#menu" className={styles.btnGhost}>Vedi il menù</a>}
                {rating != null && (
                  <div className={styles.ratingBadge}>
                    <span style={{ color: "var(--accent)" }}>{stars(rating)}</span>
                    <span className="text-sm font-semibold">{rating.toFixed(1)}</span>
                    {reviewCount ? <span className="text-sm" style={{ color: "var(--muted)" }}>· {reviewCount} recensioni</span> : null}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Highlights (services) */}
          <section className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
            <p className={`${styles.eyebrow} ${styles.sectionLabel}`}>{"L'esperienza"}</p>
            <h2 className={`${styles.display} mt-4 text-3xl font-bold sm:text-5xl`}>Perché sceglierci</h2>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {model.services.map((s, i) => (
                <div key={i} className={`${styles.highlight} ${styles.reveal} p-7`} style={{ animationDelay: `${i * 80}ms` }}>
                  <div className={styles.highlightNum}>{String(i + 1).padStart(2, "0")}</div>
                  <h3 className={`${styles.display} mt-3 text-xl font-semibold`}>{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--muted)" }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Menu — La Carta */}
          {menu && (
            <section id="menu" className="mx-auto max-w-6xl px-6 pb-20 sm:pb-28">
              <p className={`${styles.eyebrow} ${styles.sectionLabel}`}>La Carta</p>
              <h2 className={`${styles.display} mt-4 text-3xl font-bold sm:text-5xl`}>Il nostro menù</h2>
              {menu.note && <p className="mt-3 max-w-2xl" style={{ color: "var(--muted)" }}>{menu.note}</p>}
              <div className={`${styles.menuCard} mt-10 grid gap-x-14 gap-y-12 p-8 sm:p-12 md:grid-cols-2`}>
                {menu.sections.map((sec, si) => (
                  <div key={si}>
                    <h3 className={styles.menuSectionTitle}>{sec.name}</h3>
                    <div className={`${styles.goldRule} mt-2 mb-5`} />
                    <ul className="space-y-4">
                      {sec.items.map((it, ii) => (
                        <li key={ii}>
                          <div className="flex items-baseline gap-2">
                            <span className="font-medium">{it.name}</span>
                            {it.price && <span className={styles.leader} style={{ flex: 1 }} />}
                            {it.price && <span className={styles.price}>{it.price}</span>}
                          </div>
                          {it.desc && <p className="mt-0.5 text-sm leading-relaxed" style={{ color: "var(--muted)" }}>{it.desc}</p>}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Gallery */}
          {gallery.length > 0 && (
            <section id="galleria" className="mx-auto max-w-6xl px-6 pb-20 sm:pb-28">
              <p className={`${styles.eyebrow} ${styles.sectionLabel}`}>Galleria</p>
              <h2 className={`${styles.display} mt-4 mb-10 text-3xl font-bold sm:text-5xl`}>Dai nostri tavoli</h2>
              <div className={styles.gallery}>
                {gallery.map((src, i) => (
                  <figure key={i} className={styles.galleryItem}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt={`${name} — foto ${i + 2}`} loading="lazy" />
                  </figure>
                ))}
              </div>
            </section>
          )}

          {/* Testimonials */}
          {model.testimonials.length > 0 && (
            <section className="mx-auto max-w-6xl px-6 pb-20 sm:pb-28">
              <p className={`${styles.eyebrow} ${styles.sectionLabel}`}>Le parole dei clienti</p>
              <h2 className={`${styles.display} mt-4 mb-10 text-3xl font-bold sm:text-5xl`}>Dicono di noi</h2>
              <div className="grid gap-6 md:grid-cols-3">
                {model.testimonials.map((r, i) => (
                  <figure key={i} className={`${styles.highlight} ${styles.reveal} flex flex-col p-7`} style={{ animationDelay: `${i * 90}ms` }}>
                    <div className="text-2xl" style={{ color: "var(--accent)" }}>{stars(r.rating ?? 5)}</div>
                    <blockquote className="mt-3 flex-1 text-[15px] leading-relaxed">{r.quote}</blockquote>
                    <figcaption className="mt-5 text-sm font-semibold" style={{ color: "var(--muted)" }}>— {r.author}</figcaption>
                  </figure>
                ))}
              </div>
            </section>
          )}

          {/* About */}
          <section className="mx-auto max-w-6xl px-6 pb-20 sm:pb-28">
            <div className="grid items-center gap-10 lg:grid-cols-2">
              <div>
                <p className={`${styles.eyebrow} ${styles.sectionLabel}`}>La nostra storia</p>
                <h2 className={`${styles.display} mt-4 text-3xl font-bold sm:text-4xl`}>{model.about.title}</h2>
                <p className="mt-5 leading-relaxed" style={{ color: "var(--muted)" }}>{model.about.body}</p>
              </div>
              {aboutPhoto && (
                <div className="overflow-hidden rounded-[1.4rem]" style={{ border: "1px solid color-mix(in srgb, var(--accent) 18%, transparent)" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={aboutPhoto} alt={`${name} — la nostra sala`} loading="lazy" className="h-full w-full object-cover" style={{ minHeight: 280 }} />
                </div>
              )}
            </div>
          </section>

          {/* Reservation + contact + hours */}
          <section id="prenota" className="mx-auto max-w-6xl px-6 pb-24">
            <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
              <div className={`${styles.infoPanel} p-9 sm:p-12`}>
                <div className="relative">
                  <p className={styles.eyebrow} style={{ color: "rgba(42,23,8,.7)" }}>Vieni a trovarci</p>
                  <h2 className={`${styles.display} mt-3 text-3xl font-extrabold sm:text-4xl`}>{model.contact.ctaLabel}</h2>
                  {model.contact.note && <p className="mt-3 max-w-sm text-base opacity-90">{model.contact.note}</p>}
                  <div className="mt-6 flex flex-wrap gap-3">
                    {model.contact.phone && <a href={`tel:${model.contact.phone}`} className={styles.chip}>☎ {model.contact.phone}</a>}
                    {model.contact.address && <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(model.contact.address)}`} target="_blank" rel="noreferrer" className={styles.chip}>📍 {model.contact.address}</a>}
                  </div>
                  {model.contact.address && (
                    <div className="mt-8">
                      <p className={styles.eyebrow} style={{ color: "rgba(42,23,8,.7)" }}>Dove siamo</p>
                      <div className={`${styles.mapFrame} mt-3`}>
                        <iframe
                          title={`Mappa — ${name}`}
                          src={`https://maps.google.com/maps?q=${encodeURIComponent(`${name} ${model.contact.address}`)}&z=15&output=embed`}
                          className="block h-60 w-full"
                          style={{ border: 0 }}
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                        />
                      </div>
                    </div>
                  )}
                  {hours.length > 0 && (
                    <div className="mt-8">
                      <p className={styles.eyebrow} style={{ color: "rgba(42,23,8,.7)" }}>Orari</p>
                      <div className="mt-3 max-w-sm">
                        {hours.map((h, i) => (
                          <div key={i} className={styles.hoursRow} style={{ borderColor: "rgba(42,23,8,.18)" }}>
                            <span className="font-semibold">{h.day}</span>
                            <span style={{ opacity: 0.85 }}>{h.hours}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className={`${styles.formCard} p-7 sm:p-9`}>
                <BookingForm config={cta} businessName={name} />
              </div>
            </div>
          </section>

          <footer className="mx-auto max-w-6xl px-6 pb-12 text-center text-xs" style={{ color: "var(--muted)" }}>
            Anteprima dimostrativa per <strong>{name}</strong> · bozza non contrattuale.
          </footer>
        </div>
      </div>
    </>
  );
}
