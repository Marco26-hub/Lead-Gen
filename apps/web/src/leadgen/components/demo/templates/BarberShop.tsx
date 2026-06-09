import s from "./barber.module.css";
import { BookingForm } from "../BookingForm";
import { FontLinks, splitPhotos } from "./shared";
import type { DemoProps } from "./types";

const Star = () => (<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.3 6.8.7-5.1 4.6 1.5 6.7L12 17.8 5.9 20.3l1.5-6.7L2.3 9l6.8-.7z" /></svg>);
const Stars = () => (<div className={s.stars}>{[0, 1, 2, 3, 4].map((i) => <Star key={i} />)}</div>);
const init = (n: string) => n.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");

const BARBER_CTA = {
  kind: "booking" as const,
  title: "PRENOTA IL TUO APPUNTAMENTO",
  sub: "Scegli servizio, giorno e orario.",
  withCalendar: true,
  withTime: true,
  timeSlots: ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00", "18:00"],
  withParty: false,
  serviceLabel: "Servizio",
  serviceOptions: ["Taglio capelli", "Rasatura", "Barba", "Taglio + Barba", "Colore uomo", "Trattamento"],
  askEmail: false,
  withMessage: false,
  submitLabel: "PRENOTA",
  successTitle: "Prenotazione inviata!",
  successMsg: "A presto! Riceverai conferma a breve.",
};

export function BarberShop({ model, rating, reviewCount, photos, openingHours }: DemoProps) {
  const name = model.meta.businessName;
  const phone = model.contact.phone;
  const tel = phone ? `tel:${phone.replace(/\s+/g, "")}` : undefined;
  const { pics, gallery } = splitPhotos(photos);
  const hours = openingHours ?? [];

  return (
    <>
      <FontLinks />
      <div className={s.root}>
        <input type="checkbox" className={s.hamburger} id="barber-nav" aria-label="Menu" />
        <div className={s.content}>
          {/* ── HERO + PRENOTAZIONE INTEGRATA ────────────── */}
          <section className={s.hero} id="top">
            {pics[0] ? <img className={s.heroMedia} src={pics[0]} alt={name} /> : <div style={{ position: "absolute", inset: 0, background: "#111" }} />}
            <div className={s.heroScrim} />
            <div className={`${s.wrap} ${s.heroSplit}`}>
              <div className={s.heroLeft}>
                <h1>{model.hero.headline}</h1>
                <p className={s.lead}>{model.hero.sub}</p>
                {rating != null && (
                  <div className={s.ratingPill}><Stars /><b>{rating.toFixed(1)}</b>{reviewCount ? <span> · {reviewCount}</span> : null}</div>
                )}
              </div>
              <div className={s.heroRight}>
                <BookingForm config={BARBER_CTA} businessName={name} />
              </div>
            </div>
          </section>

          {/* ── NAV INLINE (dopo hero) ──────────────────── */}
          <header className={s.nav}>
            <div className={s.wrap}>
              <span className={s.brand}>{name}</span>
              <label className={s.hamburgerLabel} htmlFor="barber-nav"><span /></label>
              <nav className={s.navlinks}>
                <a href="#servizi">Servizi</a>
                {gallery.length > 0 && <a href="#galleria">Galleria</a>}
                <a href="#contatti">Contatti</a>
              </nav>
              <a className={s.navCta} href="#top">PRENOTA</a>
            </div>
          </header>

          {/* ── SERVIZI — LISTA COMPATTA ────────────────── */}
          <section className={s.block} id="servizi">
            <div className={s.wrap}>
              <div className={s.head}><span className={s.eyebrow}>Cosa facciamo</span><h2>SERVIZI</h2></div>
              <div className={s.svcList}>
                {model.services.map((svc, i) => (
                  <div className={s.svcRow} key={i}>
                    <span className={s.svcNum}>{String(i + 1).padStart(2, "0")}</span>
                    <div>
                      <h3>{svc.title}</h3>
                      <p>{svc.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── GALLERIA ────────────────────────────────── */}
          {gallery.length > 0 && (
            <section className={s.block} id="galleria">
              <div className={s.wrap}>
                <div className={s.head}><span className={s.eyebrow}>Galleria</span><h2>LA NOSTRA BARBERIA</h2></div>
                <div className={s.gal}>
                  {gallery.map((src, i) => (
                    <figure className={s.galItem} key={i}><img src={src} alt={`${name} — ${i + 1}`} loading="lazy" /></figure>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* ── RECENSIONI — LISTA COMPATTA ─────────────── */}
          {model.testimonials.length > 0 && (
            <section className={s.block}>
              <div className={s.wrap}>
                <div className={s.head}><span className={s.eyebrow}>Recensioni</span><h2>DICONO DI NOI</h2></div>
                <div className={s.revList}>
                  {model.testimonials.map((r, i) => (
                    <div className={s.revRow} key={i}>
                      <Stars />
                      <p className={s.q}>{r.quote}</p>
                      <span className={s.who}>{r.author} · Google</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* ── ABOUT + CONTATTI AFFIANCATI ─────────────── */}
          <section className={s.splitBlock}>
            <div className={`${s.wrap} ${s.splitGrid}`}>
              <div className={s.splitLeft}>
                <span className={s.eyebrow}>La nostra storia</span>
                <h2 style={{ fontSize: "clamp(22px,2.5vw,32px)", marginTop: 10, marginBottom: 16 }}>{model.about.title}</h2>
                <p style={{ color: "var(--soft)", lineHeight: 1.6, fontSize: 14 }}>{model.about.body}</p>
              </div>
              <div className={s.splitRight} id="contatti">
                <span className={s.eyebrow}>Contatti</span>
                <h2 style={{ fontSize: "clamp(22px,2.5vw,32px)", marginTop: 10, marginBottom: 16 }}>{model.contact.ctaLabel}</h2>
                {model.contact.note && <p style={{ color: "var(--soft)", marginBottom: 16, fontSize: 14 }}>{model.contact.note}</p>}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
                  {phone && <a href={tel} className={s.chip}>{phone}</a>}
                  {model.contact.address && <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(model.contact.address)}`} target="_blank" rel="noreferrer" className={s.chip}>{model.contact.address}</a>}
                </div>
                {hours.length > 0 && (
                  <div style={{ marginBottom: 20 }}>
                    <span className={s.eyebrow} style={{ display: "block", marginBottom: 8 }}>Orari</span>
                    {hours.map((h, i) => <div className={s.hoursRow} key={i}><span>{h.day}</span><span style={{ color: "var(--soft)" }}>{h.hours}</span></div>)}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* ── FOOTER ──────────────────────────────────── */}
          <footer className={s.foot}>
            <div className={s.wrap}>
              <div className={s.footBrand}>{name}</div>
              <span>Anteprima dimostrativa · bozza non contrattuale</span>
            </div>
          </footer>

          {phone && <div className={s.stickyCta}><a className={`${s.btn} ${s.btnPrimary}`} href="#top">PRENOTA ORA</a></div>}
        </div>
      </div>
    </>
  );
}
