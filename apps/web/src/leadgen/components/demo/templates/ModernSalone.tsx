import s from "./modern.module.css";
import { BookingForm } from "../BookingForm";
import { FontLinks, splitPhotos } from "./shared";
import type { DemoProps } from "./types";

const Star = () => (<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.3 6.8.7-5.1 4.6 1.5 6.7L12 17.8 5.9 20.3l1.5-6.7L2.3 9l6.8-.7z" /></svg>);
const Stars = () => (<div className={s.stars}>{[0, 1, 2, 3, 4].map((i) => <Star key={i} />)}</div>);

const MODERN_CTA = {
  kind: "booking" as const,
  title: "Prenota la tua esperienza",
  sub: "Scegli servizio, giorno e orario.",
  withCalendar: true,
  withTime: true,
  timeSlots: ["10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"],
  withParty: false,
  serviceLabel: "Servizio",
  serviceOptions: ["Taglio & Styling", "Colorazione creativa", "Trattamento tech", "Consulenza immagine", "Bridal & Eventi", "Altro"],
  askEmail: true,
  requireEmail: true,
  phoneLabel: "Cellulare",
  confirmNote: "Riceverai una conferma via email con tutti i dettagli.",
  withMessage: false,
  submitLabel: "Prenota ora",
  successTitle: "Esperienza prenotata!",
  successMsg: "Benvenuto nel futuro. Riceverai la conferma a breve.",
};

export function ModernSalone({ model, rating, reviewCount, photos, openingHours }: DemoProps) {
  const name = model.meta.businessName;
  const phone = model.contact.phone;
  const tel = phone ? `tel:${phone.replace(/\s+/g, "")}` : undefined;
  const { pics, gallery } = splitPhotos(photos);
  const hours = openingHours ?? [];

  return (
    <>
      <FontLinks />
      <div className={s.root}>
        <input type="checkbox" className={s.hamburger} id="modern-nav" aria-label="Menu" />
        <div className={s.content}>
          {/* ── NAV ──────────────────────────────────── */}
          <header className={s.nav}>
            <div className={s.wrap}>
              <span className={s.brand}><i className={s.dot} /> {name}</span>
              <label className={s.hamburgerLabel} htmlFor="modern-nav"><span /></label>
              <nav className={s.navlinks}>
                <a href="#servizi">Servizi</a>
                <a href="#galleria">Galleria</a>
                <a href="#contatti">Contatti</a>
              </nav>
              <a className={`${s.btn} ${s.btnPrimary}`} href="#contatti">Prenota</a>
            </div>
          </header>

          {/* ── HERO — MINIMAL, BIG TEXT ─────────────── */}
          <section className={s.hero} id="top">
            <div className={s.wrap}>
              <div className={s.heroText}>
                <h1>{model.hero.headline}</h1>
                <p className={s.lead}>{model.hero.sub}</p>
                <div className={s.heroActions}>
                  <a className={`${s.btn} ${s.btnPrimary}`} href="#contatti">{model.hero.ctaLabel}</a>
                  {phone && <a className={`${s.btn} ${s.btnGhost}`} href={tel}>{phone}</a>}
                </div>
                {rating != null && (
                  <div className={s.ratingPill}><Stars /><b>{rating.toFixed(1)}</b>{reviewCount ? <span> · {reviewCount}</span> : null}</div>
                )}
              </div>
            </div>
          </section>

          {/* ── MAIN GRID — everything in a 3-col layout ── */}
          <section className={s.mainGrid} id="servizi">
            <div className={s.wrap}>
              <div className={s.grid3}>
                {/* Col 1: Services */}
                <div className={s.gridCol}>
                  <div className={s.colHead}>
                    <span className={s.eyebrow}>Servizi</span>
                    <h2>Cosa offriamo</h2>
                  </div>
                  <div className={s.svcStack}>
                    {model.services.map((svc, i) => (
                      <div className={s.svcItem} key={i}>
                        <h3>{svc.title}</h3>
                        <p>{svc.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Col 2: Reviews */}
                <div className={s.gridCol}>
                  <div className={s.colHead}>
                    <span className={s.eyebrow}>Recensioni</span>
                    <h2>Dicono di noi</h2>
                  </div>
                  {model.testimonials.map((r, i) => (
                    <div className={s.revItem} key={i}>
                      <p className={s.q}>{r.quote}</p>
                      <span className={s.who}>{r.author}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ── GALLERY — HORIZONTAL STRIP ────────────── */}
          {pics.length > 1 && (
            <section className={s.galSection} id="galleria">
              <div className={s.wrap}>
                <div className={s.colHead}>
                  <span className={s.eyebrow}>Galleria</span>
                  <h2>Prima e dopo</h2>
                </div>
              </div>
              <div className={s.galStrip}>
                {gallery.map((src, i) => (
                  <div className={s.galItem} key={i}><img src={src} alt={`${name} — ${i + 1}`} loading="lazy" /></div>
                ))}
              </div>
            </section>
          )}

          {/* ── BOOKING + CONTACTS — TWO COL ──────────── */}
          <section className={s.bookingSection} id="contatti">
            <div className={s.wrap}>
              <div className={s.bookingGrid}>
                <div className={s.bookingInfo}>
                  <span className={s.eyebrow}>Contatti</span>
                  <h2 style={{ fontSize: "clamp(24px,3vw,38px)", marginTop: 10, marginBottom: 16 }}>{model.contact.ctaLabel}</h2>
                  {model.contact.note && <p style={{ color: "var(--soft)", marginBottom: 20, fontSize: 14 }}>{model.contact.note}</p>}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
                    {phone && <a href={tel} className={s.chip}>{phone}</a>}
                    {model.contact.address && <span className={s.chip}>{model.contact.address}</span>}
                  </div>
                  {hours.length > 0 && (
                    <div style={{ marginBottom: 20 }}>
                      <span className={s.eyebrow} style={{ display: "block", marginBottom: 8 }}>Orari</span>
                      {hours.map((h, i) => <div className={s.hoursRow} key={i}><span>{h.day}</span><span style={{ color: "var(--soft)" }}>{h.hours}</span></div>)}
                    </div>
                  )}
                </div>
                <div className={s.bookingForm}>
                  <BookingForm config={MODERN_CTA} businessName={name} />
                </div>
              </div>
            </div>
          </section>

          <footer className={s.foot}>
            <div className={s.wrap}>Anteprima dimostrativa per <b>{name}</b> · bozza non contrattuale</div>
          </footer>

          <div className={s.stickyCta}><a className={`${s.btn} ${s.btnPrimary}`} href="#contatti">Prenota ora</a></div>
        </div>
      </div>
    </>
  );
}
