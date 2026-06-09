import { resolveCta } from "@maps/core";
import styles from "./pizzeria.module.css";
import { BookingForm } from "../BookingForm";
import { MobileNav } from "./MobileNav";
import { FontLinks, splitPhotos } from "./shared";
import type { DemoProps } from "./types";

const Star = () => (<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.3 6.8.7-5.1 4.6 1.5 6.7L12 17.8 5.9 20.3l1.5-6.7L2.3 9l6.8-.7z" /></svg>);
const Stars = () => (<div className={styles.stars}>{[0, 1, 2, 3, 4].map((i) => <Star key={i} />)}</div>);
const initials = (n: string) => n.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");

/** Pizzeria — wood-fired, casual, menu-forward. Bespoke cream/ember palette. */
export function Pizzeria({ model, rating, reviewCount, photos, openingHours }: DemoProps) {
  const name = model.meta.businessName;
  const phone = model.contact.phone;
  const tel = phone ? `tel:${phone.replace(/\s+/g, "")}` : undefined;
  const { pics, hero: heroPhoto, gallery, aboutPhoto } = splitPhotos(photos);
  const hours = openingHours ?? [];
  const menu = model.menu;

  const navLinks = [
    { href: "#specialita", label: "Specialità" },
    ...(menu ? [{ href: "#menu", label: "Menù" }] : []),
    ...(gallery.length > 0 ? [{ href: "#galleria", label: "Galleria" }] : []),
    { href: "#contatti", label: "Contatti" },
  ];

  return (
    <>
      <FontLinks />
      <div className={styles.root}>
        <div className={styles.content}>
          {/* strip */}
          <div className={styles.strip}>
            <div className={styles.wrap}>
              <span>Forno a legna</span>
              <span>Impasto a lunga lievitazione</span>
              <span>Asporto e domicilio</span>
            </div>
          </div>

          {/* nav */}
          <header className={styles.nav}>
            <div className={styles.wrap}>
              <span className={styles.brand}><i className={styles.dot} /> {name}</span>
              <nav className={styles.navlinks}>
                <a href="#specialita">Specialità</a>
                {menu && <a href="#menu">Menù</a>}
                {gallery.length > 0 && <a href="#galleria">Galleria</a>}
                <a href="#contatti">Contatti</a>
              </nav>
              <a className={`${styles.btn} ${styles.btnPrimary}`} href="#contatti">{model.hero.ctaLabel}</a>
              <MobileNav
                links={navLinks}
                brand={name}
                tagline={model.meta.category}
                phone={phone}
                ctaLabel={model.hero.ctaLabel}
                ctaHref="#contatti"
                accent="#c0392b"
              />
            </div>
          </header>

          {/* hero */}
          <section className={styles.hero} id="top">
            {heroPhoto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className={styles.heroMedia} src={heroPhoto} alt={`${name} — pizza`} />
            ) : (
              <div className={styles.heroEmpty} />
            )}
            <div className={styles.heroScrim} />
            <div className={`${styles.wrap} ${styles.heroInner} ${styles.reveal}`} style={{ paddingBottom: 64, paddingTop: 40 }}>
              <span className={styles.hbadge}>{model.meta.tagline}</span>
              <h1 style={{ marginTop: 18 }}>{model.hero.headline}</h1>
              <p className={styles.lead}>{model.hero.sub}</p>
              <div className={styles.heroCta}>
                <a className={`${styles.btn} ${styles.btnPrimary}`} href="#contatti">{model.hero.ctaLabel}</a>
                {phone && <a className={`${styles.btn} ${styles.btnGhost}`} href={tel} style={{ color: "#fff", borderColor: "#fff" }}>☎ {phone}</a>}
                {rating != null && (
                  <span className={styles.ratingPill}>
                    <span style={{ color: "var(--gold)" }}><Stars /></span>
                    <b>{rating.toFixed(1)}</b>{reviewCount ? <span style={{ opacity: .8 }}>· {reviewCount}</span> : null}
                  </span>
                )}
              </div>
            </div>
          </section>

          {/* specialità */}
          <section className={styles.block} id="specialita">
            <div className={styles.wrap}>
              <div className={styles.head}>
                <span className={styles.eyebrow}>Le nostre specialità</span>
                <h2>Cosa portiamo in tavola</h2>
              </div>
              <div className={styles.svcGrid}>
                {model.services.map((svc, i) => (
                  <article className={`${styles.svc} ${styles.reveal}`} key={i} style={{ animationDelay: `${i * 70}ms` }}>
                    <div className={styles.n}>{String(i + 1).padStart(2, "0")}</div>
                    <h3>{svc.title}</h3>
                    <p>{svc.desc}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* menu */}
          {menu && (
            <section className={`${styles.block} ${styles.menu}`} id="menu">
              <div className={styles.wrap}>
                <div className={styles.head}>
                  <span className={styles.eyebrow}>La carta</span>
                  <h2 style={{ color: "#fff" }}>Il nostro menù</h2>
                  {menu.note && <p style={{ color: "rgba(253,246,236,.6)" }}>{menu.note}</p>}
                </div>
                <div className={styles.menuCard}>
                  {menu.sections.map((sec, si) => (
                    <div className={styles.menuSec} key={si}>
                      <h3>{sec.name}</h3>
                      <div className={styles.rule} />
                      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 14 }}>
                        {sec.items.map((it, ii) => (
                          <li key={ii}>
                            <div className={styles.mItem}>
                              <span className={styles.nm}>{it.name}</span>
                              {it.price && <span className={styles.leader} />}
                              {it.price && <span className={styles.price}>{it.price}</span>}
                            </div>
                            {it.desc && <p className={styles.mDesc}>{it.desc}</p>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* gallery */}
          {gallery.length > 0 && (
            <section className={styles.block} id="galleria">
              <div className={styles.wrap}>
                <div className={styles.head}>
                  <span className={styles.eyebrow}>Galleria</span>
                  <h2>Dal nostro forno</h2>
                </div>
                <div className={styles.gal}>
                  {gallery.map((src, i) => (
                    <figure className={styles.galItem} key={i}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt={`${name} — foto ${i + 1}`} loading="lazy" />
                    </figure>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* reviews */}
          {model.testimonials.length > 0 && (
            <section className={styles.block} style={{ paddingTop: 0 }}>
              <div className={styles.wrap}>
                <div className={styles.head}>
                  <span className={styles.eyebrow}>Recensioni</span>
                  <h2>Dicono di noi</h2>
                </div>
                <div className={styles.revGrid}>
                  {model.testimonials.map((r, i) => (
                    <article className={styles.rev} key={i}>
                      <Stars />
                      <p className={styles.q}>{r.quote}</p>
                      <div className={styles.who}>
                        <span className={styles.av}>{initials(r.author)}</span>
                        <span><b>{r.author}</b></span>
                        <span className={styles.src}>Google</span>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* about */}
          <section className={styles.block} style={{ paddingTop: 0 }}>
            <div className={`${styles.wrap} ${styles.about}`}>
              <div>
                <span className={styles.eyebrow}>La nostra storia</span>
                <h2 style={{ marginTop: 12 }}>{model.about.title}</h2>
                <p style={{ marginTop: 16, color: "var(--soft)" }}>{model.about.body}</p>
              </div>
              {aboutPhoto && (
                <div className={styles.aboutImg}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={aboutPhoto} alt={`${name} — locale`} loading="lazy" />
                </div>
              )}
            </div>
          </section>

          {/* contact */}
          <section className={`${styles.block} ${styles.contact}`} id="contatti">
            <div className={`${styles.wrap} ${styles.cGrid}`}>
              <div>
                <span className={styles.eyebrow}>Contatti</span>
                <h2 style={{ marginTop: 12 }}>{model.contact.ctaLabel}</h2>
                {model.contact.note && <p style={{ marginTop: 14, color: "var(--soft)" }}>{model.contact.note}</p>}
                <div style={{ marginTop: 20, display: "flex", flexWrap: "wrap", gap: 10 }}>
                  {phone && <a href={tel} className={styles.chip}>☎ {phone}</a>}
                  {model.contact.address && <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(model.contact.address)}`} target="_blank" rel="noreferrer" className={styles.chip}>📍 {model.contact.address}</a>}
                </div>
                {hours.length > 0 && (
                  <div style={{ marginTop: 22, maxWidth: 380 }}>
                    <span className={styles.eyebrow}>Orari</span>
                    <div style={{ marginTop: 10 }}>
                      {hours.map((h, i) => (
                        <div className={styles.hoursRow} key={i}><span style={{ fontWeight: 600 }}>{h.day}</span><span style={{ color: "var(--soft)" }}>{h.hours}</span></div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className={styles.formCard}>
                <BookingForm config={resolveCta("restaurant")} businessName={name} />
              </div>
            </div>
          </section>

          <footer className={styles.foot}>
            <div className={styles.wrap}>Anteprima dimostrativa per <b>{name}</b> · bozza non contrattuale</div>
          </footer>
        </div>
      </div>
    </>
  );
}