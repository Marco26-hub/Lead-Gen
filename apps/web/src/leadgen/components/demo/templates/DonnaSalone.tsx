import s from "./donna.module.css";
import { BookingForm } from "../BookingForm";
import { FontLinks, splitPhotos } from "./shared";
import type { DemoProps } from "./types";

const Star = () => (<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.3 6.8.7-5.1 4.6 1.5 6.7L12 17.8 5.9 20.3l1.5-6.7L2.3 9l6.8-.7z" /></svg>);
const Stars = () => (<div className={s.stars}>{[0, 1, 2, 3, 4].map((i) => <Star key={i} />)}</div>);

const DONNA_CTA = {
  kind: "booking" as const,
  title: "Prenota il tuo trattamento",
  sub: "Scegli servizio, giorno e orario.",
  withCalendar: true,
  withTime: true,
  timeSlots: ["09:00", "09:30", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00", "18:00"],
  withParty: false,
  serviceLabel: "Servizio",
  serviceOptions: ["Taglio donna", "Piega", "Colore", "Trattamento capelli", "Permanente", "Altro"],
  askEmail: true,
  requireEmail: true,
  phoneLabel: "Cellulare",
  confirmNote: "Useremo email e cellulare solo per inviarti la conferma.",
  withMessage: false,
  submitLabel: "Prenota",
  successTitle: "Prenotazione inviata!",
  successMsg: "Grazie, ti aspettiamo. Riceverai la conferma a breve.",
};

export function DonnaSalone({ model, rating, reviewCount, photos, openingHours }: DemoProps) {
  const name = model.meta.businessName;
  const phone = model.contact.phone;
  const tel = phone ? `tel:${phone.replace(/\s+/g, "")}` : undefined;
  const { pics, gallery } = splitPhotos(photos);
  const hours = openingHours ?? [];

  return (
    <>
      <FontLinks />
      <div className={s.root}>
        <input type="checkbox" className={s.hamburger} id="donna-nav" aria-label="Menu" />
        <div className={s.content}>
          {/* ── NAV ──────────────────────────────────── */}
          <header className={s.nav}>
            <div className={s.wrap}>
              <span className={s.brand}>{name}</span>
              <label className={s.hamburgerLabel} htmlFor="donna-nav"><span /></label>
              <nav className={s.navlinks}>
                <a href="#servizi">Servizi</a>
                <a href="#galleria">Galleria</a>
                <a href="#contatti">Contatti</a>
              </nav>
              <a className={`${s.btn} ${s.btnPrimary}`} href="#contatti">Prenota</a>
            </div>
          </header>

          {/* ── HERO — MAGAZINE COVER ────────────────── */}
          <section className={s.hero} id="top">
            <div className={s.heroGrid}>
              <div className={s.heroImgWrap}>
                {pics[0] ? <img src={pics[0]} alt={name} /> : <div className={s.heroPlaceholder} />}
              </div>
              <div className={s.heroTextSide}>
                <span className={s.eyebrow}>Benvenuta</span>
                <h1>{model.hero.headline}</h1>
                <p className={s.lead}>{model.hero.sub}</p>
                <div className={s.heroActions}>
                  <a className={`${s.btn} ${s.btnPrimary}`} href="#contatti">{model.hero.ctaLabel}</a>
                  {phone && <a className={`${s.btn} ${s.btnGhost}`} href={tel}>{phone}</a>}
                </div>
                {rating != null && (
                  <div className={s.ratingPill}><Stars /><span>{rating.toFixed(1)}</span>{reviewCount ? <span> · {reviewCount}</span> : null}</div>
                )}
              </div>
            </div>
          </section>

          {/* ── SERVICES + PRICES — SIDE BY SIDE ─────── */}
          <section className={s.spread} id="servizi">
            <div className={s.wrap}>
              <div className={s.sectionHead}>
                <span className={s.eyebrow}>I nostri servizi</span>
                <h2>Cosa facciamo</h2>
              </div>
              <div className={s.svcList}>
                {model.services.map((svc, i) => (
                  <div className={s.svcItem} key={i}>
                    <h3>{svc.title}</h3>
                    <p>{svc.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── GALLERIA + RECENSIONI — SIDE BY SIDE ──── */}
          <section className={s.spread}>
            <div className={s.wrap}>
              <div className={s.spreadGrid}>
                <div className={s.spreadLeft} id="galleria">
                  <div className={s.sectionHead}>
                    <span className={s.eyebrow}>Galleria</span>
                    <h2>I nostri lavori</h2>
                  </div>
                  <div className={s.gal}>
                    {gallery.map((src, i) => (
                      <div className={s.galItem} key={i}><img src={src} alt={`${name} — ${i + 1}`} loading="lazy" /></div>
                    ))}
                  </div>
                </div>
                <div className={s.spreadRight}>
                  <div className={s.sectionHead}>
                    <span className={s.eyebrow}>Recensioni</span>
                    <h2>Dicono di noi</h2>
                  </div>
                  {model.testimonials.map((r, i) => (
                    <div className={s.revCard} key={i}>
                      <Stars />
                      <p className={s.q}>{r.quote}</p>
                      <span className={s.who}>{r.author}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ── BOOKING CALLOUT ──────────────────────── */}
          <section className={s.bookingCallout} id="contatti">
            <div className={s.wrap}>
              <div className={s.bookingInner}>
                <div className={s.bookingText}>
                  <span className={s.eyebrow}>Prenota ora</span>
                  <h2>{model.contact.ctaLabel}</h2>
                  {model.contact.note && <p>{model.contact.note}</p>}
                  <div className={s.contactChips}>
                    {phone && <a href={tel} className={s.chip}>{phone}</a>}
                    {model.contact.address && <span className={s.chip}>{model.contact.address}</span>}
                  </div>
                  {hours.length > 0 && (
                    <div className={s.hoursBlock}>
                      <span className={s.eyebrow} style={{ display: "block", marginBottom: 8 }}>Orari</span>
                      {hours.map((h, i) => <div className={s.hoursRow} key={i}><span>{h.day}</span><span>{h.hours}</span></div>)}
                    </div>
                  )}
                </div>
                <div className={s.bookingForm}>
                  <BookingForm config={DONNA_CTA} businessName={name} />
                </div>
              </div>
            </div>
          </section>

          {/* ── FOOTER ──────────────────────────────── */}
          <footer className={s.foot}>
            <div className={s.wrap}>
              <span className={s.footBrand}>{name}</span>
              <span>Anteprima dimostrativa · bozza non contrattuale</span>
            </div>
          </footer>

          <div className={s.stickyCta}><a className={`${s.btn} ${s.btnPrimary}`} href="#contatti">Prenota ora</a></div>
        </div>
      </div>
    </>
  );
}
