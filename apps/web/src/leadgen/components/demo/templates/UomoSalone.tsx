import s from "./uomo.module.css";
import { BookingForm } from "../BookingForm";
import { FontLinks, splitPhotos } from "./shared";
import type { DemoProps } from "./types";

const Star = () => (<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.3 6.8.7-5.1 4.6 1.5 6.7L12 17.8 5.9 20.3l1.5-6.7L2.3 9l6.8-.7z" /></svg>);
const Stars = () => (<div className={s.stars}>{[0, 1, 2, 3, 4].map((i) => <Star key={i} />)}</div>);

const UOMO_CTA = {
  kind: "booking" as const,
  title: "Prenota il tuo trattamento",
  sub: "Scegli servizio, giorno e orario.",
  withCalendar: true,
  withTime: true,
  timeSlots: ["09:00", "09:30", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00", "18:00"],
  withParty: false,
  serviceLabel: "Servizio",
  serviceOptions: ["Taglio uomo", "Piega", "Colore uomo", "Barba", "Trattamento viso", "Altro"],
  askEmail: false,
  withMessage: false,
  submitLabel: "Prenota",
  successTitle: "Prenotazione inviata!",
  successMsg: "A presto! Riceverai conferma a breve.",
};

export function UomoSalone({ model, rating, reviewCount, photos, openingHours }: DemoProps) {
  const name = model.meta.businessName;
  const phone = model.contact.phone;
  const tel = phone ? `tel:${phone.replace(/\s+/g, "")}` : undefined;
  const { pics, gallery } = splitPhotos(photos);
  const hours = openingHours ?? [];

  return (
    <>
      <FontLinks />
      <div className={s.root}>
        <input type="checkbox" className={s.hamburger} id="uomo-nav" aria-label="Menu" />
        <div className={s.content}>
          {/* ── NAV ──────────────────────────────────── */}
          <header className={s.nav}>
            <div className={s.wrap}>
              <span className={s.brand}>{name}</span>
              <label className={s.hamburgerLabel} htmlFor="uomo-nav"><span /></label>
              <nav className={s.navlinks}>
                <a href="#servizi">Servizi</a>
                <a href="#galleria">Galleria</a>
                <a href="#contatti">Contatti</a>
              </nav>
              <a className={`${s.btn} ${s.btnPrimary}`} href="#contatti">Prenota</a>
            </div>
          </header>

          {/* ── HERO — FULL WIDTH IMAGE ──────────────── */}
          <section className={s.hero} id="top">
            {pics[0] ? <img className={s.heroImg} src={pics[0]} alt={name} /> : null}
            <div className={s.heroOverlay} />
            <div className={s.heroContent}>
              <h1>{model.hero.headline}</h1>
              <p className={s.lead}>{model.hero.sub}</p>
              <div className={s.heroActions}>
                <a className={`${s.btn} ${s.btnPrimary}`} href="#contatti">{model.hero.ctaLabel}</a>
                {phone && <a className={`${s.btn} ${s.btnGhost}`} href={tel}>{phone}</a>}
              </div>
              {rating != null && (
                <div className={s.ratingPill}><Stars /><span>{rating.toFixed(1)}</span>{reviewCount ? <span> · {reviewCount} recensioni</span> : null}</div>
              )}
            </div>
          </section>

          {/* ── SERVIZI — LARGE CARDS, STACKED ───────── */}
          <section className={s.block} id="servizi">
            <div className={s.wrap}>
              <div className={s.sectionHead}>
                <span className={s.eyebrow}>Cosa offriamo</span>
                <h2>I nostri servizi</h2>
              </div>
            </div>
            <div className={s.svcStack}>
              {model.services.map((svc, i) => (
                <div className={s.svcCard} key={i}>
                  <div className={s.svcImg}>
                    <img src={pics[Math.min(i + 1, pics.length - 1)] ?? pics[0]} alt={svc.title} loading="lazy" />
                  </div>
                  <div className={s.svcBody}>
                    <span className={s.svcNum}>{String(i + 1).padStart(2, "0")}</span>
                    <h3>{svc.title}</h3>
                    <p>{svc.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── RECENSIONI ───────────────────────────── */}
          {model.testimonials.length > 0 && (
            <section className={s.block}>
              <div className={s.wrap}>
                <div className={s.sectionHead}>
                  <span className={s.eyebrow}>Recensioni</span>
                  <h2>Dicono di noi</h2>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "0 40px" }}>
                  {model.testimonials.map((r, i) => (
                    <div className={s.revCard} key={i}>
                      <Stars />
                      <p className={s.q}>{r.quote}</p>
                      <span className={s.who}>{r.author}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* ── GALLERIA — MASONRY ───────────────────── */}
          {pics.length > 1 && (
            <section className={s.galSection} id="galleria">
              <div className={s.wrap}>
                <div className={s.sectionHead}>
                  <span className={s.eyebrow}>Gallery</span>
                  <h2>I nostri lavori</h2>
                </div>
              </div>
              <div className={s.gal}>
                {gallery.map((src, i) => (
                  <div className={s.galItem} key={i}><img src={src} alt={`${name} — ${i + 1}`} loading="lazy" /></div>
                ))}
              </div>
            </section>
          )}

          {/* ── ABOUT + CONTATTI — STACKED ───────────── */}
          <section className={s.aboutBlock}>
            <div className={s.wrap}>
              <div className={s.twoCol}>
                <div className={s.colLeft}>
                  <span className={s.eyebrow}>Chi siamo</span>
                  <h2 style={{ fontSize: "clamp(22px,2.5vw,34px)", marginTop: 10, marginBottom: 16 }}>{model.about.title}</h2>
                  <p style={{ color: "var(--soft)", lineHeight: 1.7, fontSize: 14 }}>{model.about.body}</p>
                </div>
                <div className={s.colRight} id="contatti">
                  <span className={s.eyebrow}>Contatti</span>
                  <h2 style={{ fontSize: "clamp(22px,2.5vw,34px)", marginTop: 10, marginBottom: 16 }}>{model.contact.ctaLabel}</h2>
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
                  <div className={s.formCard}>
                    <BookingForm config={UOMO_CTA} businessName={name} />
                  </div>
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
