import s from "./idraulica.module.css";
import { InterventoForm } from "./InterventoForm";
import { MobileNav } from "./MobileNav";
import { splitPhotos } from "./shared";
import type { DemoProps } from "./types";

const cx = (...names: string[]) => names.map((n) => s[n] ?? n).join(" ");

/* ---- inline icons ---- */
const IcPin = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s7-5.4 7-12a7 7 0 0 0-14 0c0 6.6 7 12 7 12Z" /><circle cx="12" cy="10" r="2.6" /></svg>);
const IcPhone = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8.1 9.8a16 16 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.8 2.1Z" /></svg>);
const IcFile = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M9 13h6M9 17h4" /></svg>);
const IcCheck = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M8 12l2.5 2.5L16 9" /></svg>);
const IcArrow = () => (<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>);
const IcClock = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>);
const IcShield = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /></svg>);
const IcStar = () => (<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.3 6.8.7-5.1 4.6 1.5 6.7L12 17.8 5.9 20.3l1.5-6.7L2.3 9l6.8-.7z" /></svg>);
const IcEuro = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>);
const IcHome = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M5 21V7l8-4 8 4v14" /></svg>);
const IcSupport = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4M12 18v4M4.9 4.9l2.9 2.9M16.2 16.2l2.9 2.9M2 12h4M18 12h4M4.9 19.1l2.9-2.9M16.2 7.8l2.9-2.9" /></svg>);

const SVC_ICONS = [IcPhone, IcSupport, IcClock, IcFile, IcHome, IcShield];

const Stars = ({ cls }: { cls?: string }) => (
  <div className={cx("stars")}>{[0, 1, 2, 3, 4].map((i) => <IcStar key={i} />)}{cls ? null : null}</div>
);

function initials(name: string): string {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}

const FONTS = "https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700;800;900&family=Hanken+Grotesk:wght@400;500;600;700;800&display=swap";

/**
 * IdraulicaPronto — high-conversion emergency-plumber template (ported from a
 * Claude Design export, made data-driven). Bespoke palette (its own CSS module),
 * urgency lead form, real photos/reviews/phone from the lead.
 */
export function IdraulicaPronto({ model, rating, reviewCount, photos, openingHours }: DemoProps) {
  const name = model.meta.businessName;
  const phone = model.contact.phone;
  const tel = phone ? `tel:${phone.replace(/\s+/g, "")}` : undefined;
  const { pics, hero: heroPhoto, gallery } = splitPhotos(photos);
  const hours = openingHours ?? [];
  const services = model.services;
  const reviews = model.testimonials;

  const navLinks = [
    { href: "#servizi", label: "Servizi" },
    ...(reviews.length > 0 ? [{ href: "#recensioni", label: "Recensioni" }] : []),
    ...(gallery.length > 0 ? [{ href: "#lavori", label: "Lavori" }] : []),
    { href: "#perche", label: "Perché noi" },
    { href: "#contatti", label: "Contatti" },
  ];

  const stats: { num: string; u?: string; lab: string }[] = [];
  if (rating != null) stats.push({ num: rating.toFixed(1), u: "★", lab: "Valutazione media" });
  if (reviewCount) stats.push({ num: `${reviewCount}`, u: "+", lab: "Recensioni verificate" });
  stats.push({ num: "24/7", lab: "Sempre reperibili" });
  stats.push({ num: "Gratis", lab: "Preventivo e sopralluogo" });

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="stylesheet" href={FONTS} />

      <div className={cx("root")}>
        {/* TOP STRIP */}
        <div className={cx("topstrip")}>
          <div className={cx("wrap")}>
            <span><i className={cx("dot")} /> Pronto intervento attivo ora</span>
            <span>Reperibilità 24 ore su 24, 7 giorni su 7</span>
            <span>Preventivo gratuito e senza impegno</span>
          </div>
        </div>

        {/* NAV */}
        <header className={cx("nav")}>
          <div className={cx("wrap")}>
            <a className={cx("brand")} href="#top">
              <span className={cx("mark")} aria-hidden="true"><IcPin /></span>
              <span>{name}<small>{model.meta.category}</small></span>
            </a>
            <nav className={cx("nav-links")}>
              <a href="#servizi">Servizi</a>
              {reviews.length > 0 && <a href="#recensioni">Recensioni</a>}
              {gallery.length > 0 && <a href="#lavori">Lavori</a>}
              <a href="#perche">Perché noi</a>
              <a href="#contatti">Contatti</a>
            </nav>
            <div className={cx("nav-cta")}>
              {phone && (
                <span className={cx("nav-phone")}>
                  <small>Pronto intervento</small>
                  <b>{phone}</b>
                </span>
              )}
              <a className={cx("btn", "btn-urgent")} href="#contatti"><IcPhone /> {model.hero.ctaLabel}</a>
            </div>
            <MobileNav
              links={navLinks}
              brand={name}
              tagline={model.meta.category}
              phone={phone}
              ctaLabel={model.hero.ctaLabel}
              ctaHref="#contatti"
              accent="#e8612c"
            />
          </div>
        </header>
        <a id="top" />

        {/* HERO */}
        <section className={cx("hero")}>
          <div className={cx("wrap")}>
            <div className={cx("hero-copy")}>
              <span className={cx("eyebrow")}>{model.meta.tagline}</span>
              <h1>{model.hero.headline}</h1>
              <p className={cx("lead")}>{model.hero.sub}</p>
              <div className={cx("hero-cta")}>
                <a className={cx("btn", "btn-primary", "btn-lg")} href="#contatti"><IcFile /> {model.hero.ctaLabel}</a>
                {phone && <a className={cx("btn", "btn-ghost", "btn-lg")} href={tel}><IcPhone /> {phone}</a>}
              </div>
              <div className={cx("hero-trust")}>
                <Stars />
                {rating != null && <div className={cx("t")}><b>{rating.toFixed(1)} / 5</b>{reviewCount ? ` su oltre ${reviewCount} recensioni` : ""}</div>}
                <div className={cx("sep")} />
                <div className={cx("t")}><b>Assicurati</b> e con garanzia sul lavoro</div>
              </div>
            </div>
            <div className={cx("hero-visual")}>
              <div className={`${s["hero-photo"]} ${heroPhoto ? "" : s["empty"]}`}>
                {heroPhoto && <img src={heroPhoto} alt={`${name} — al lavoro`} />}
              </div>
              {rating != null && (
                <div className={cx("float-card", "float-rating")}>
                  <div className={cx("big")}>{rating.toFixed(1)}</div>
                  <div>
                    <Stars />
                    <small>Recensioni verificate Google</small>
                  </div>
                </div>
              )}
              <div className={cx("float-card", "float-badge")}>
                <div className={cx("ic")} aria-hidden="true"><IcCheck /></div>
                <div>
                  <b>Pronto intervento</b>
                  <small>24 ore su 24</small>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className={cx("stats")}>
          <div className={cx("wrap")}>
            {stats.map((st, i) => (
              <div className={cx("stat")} key={i}>
                <div className={cx("num")}>{st.num}{st.u && <span className={cx("u")}>{st.u}</span>}</div>
                <div className={cx("lab")}>{st.lab}</div>
              </div>
            ))}
          </div>
        </section>

        {/* SERVIZI */}
        <section className={cx("block")} id="servizi">
          <div className={cx("wrap")}>
            <div className={cx("sec-head")}>
              <span className={cx("eyebrow")}>Cosa facciamo</span>
              <h2>Tutti gli interventi, un solo numero</h2>
              <p>{"Dalla piccola perdita all'impianto completo. Lavoro pulito, materiali di qualità e preventivo concordato prima di iniziare."}</p>
            </div>
            <div className={cx("svc-grid")}>
              {services.map((svc, i) => {
                const Icon = SVC_ICONS[i % SVC_ICONS.length];
                return (
                  <article className={i === 0 ? cx("svc", "featured") : cx("svc")} key={i}>
                    <div className={cx("ic")}><Icon /></div>
                    <h3>{svc.title}</h3>
                    <p>{svc.desc}</p>
                    {i === 0 && phone && <a className={cx("more")} href={tel}>Chiama ora <IcArrow /></a>}
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* RECENSIONI */}
        {reviews.length > 0 && (
          <section className={cx("block", "reviews")} id="recensioni">
            <div className={cx("wrap")}>
              <div className={cx("rev-top")}>
                <div className={cx("sec-head")} style={{ marginBottom: 0 }}>
                  <span className={cx("eyebrow")}>La fiducia dei clienti</span>
                  <h2>Cosa dicono di noi</h2>
                </div>
                {rating != null && (
                  <div className={cx("rev-score")}>
                    <div className={cx("big")}>{rating.toFixed(1)}</div>
                    <div>
                      <Stars />
                      <small>{reviewCount ? `${reviewCount}+ recensioni verificate` : "Recensioni verificate"}</small>
                    </div>
                  </div>
                )}
              </div>
              <div className={cx("rev-grid")}>
                {reviews.map((r, i) => (
                  <article className={cx("rev")} key={i}>
                    <Stars />
                    <p className={cx("quote")}>{r.quote}</p>
                    <div className={cx("who")}>
                      <div className={cx("av")}>{initials(r.author)}</div>
                      <div><b>{r.author}</b></div>
                      <span className={cx("src")}>Google</span>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* LAVORI */}
        {gallery.length > 0 && (
          <section className={cx("block")} id="lavori">
            <div className={cx("wrap")}>
              <div className={cx("sec-head", "center")}>
                <span className={cx("eyebrow")}>I nostri lavori</span>
                <h2>Qualche intervento recente</h2>
              </div>
              <div className={cx("work-grid")}>
                {gallery.map((src, i) => {
                  const extra = i === 0 ? "wide" : i === 2 ? "tall" : i === 5 ? "wide" : "";
                  return (
                    <figure className={extra ? cx("cell", extra) : cx("cell")} key={i}>
                      <img src={src} alt={`${name} — lavoro ${i + 1}`} loading="lazy" />
                    </figure>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* PERCHÉ NOI */}
        <section className={cx("block", "why")} id="perche">
          <div className={cx("wrap", "why-grid")}>
            <div>
              <span className={cx("eyebrow")}>Perché sceglierci</span>
              <h2 style={{ fontSize: "clamp(30px,3.2vw,42px)", marginTop: 14 }}>{model.about.title}</h2>
              <p style={{ marginTop: 18, fontSize: 18, color: "var(--ink-soft)", maxWidth: "30em" }}>{model.about.body}</p>
              <div className={cx("why-badges")}>
                <span className={cx("why-badge")}><IcShield /> Assicurazione RC</span>
                <span className={cx("why-badge")}><IcCheck /> Professionisti certificati</span>
                <span className={cx("why-badge")}><IcCheck /> Garanzia sul lavoro</span>
              </div>
            </div>
            <div className={cx("why-list")}>
              <WhyItem icon={<IcSupport />} title="Disponibili 24 ore su 24" body="Una persona vera risponde al telefono, anche di notte e nei festivi." />
              <WhyItem icon={<IcEuro />} title="Prezzo concordato prima" body="Ti diciamo quanto costa prima di iniziare. Nessun costo nascosto in fattura." />
              <WhyItem icon={<IcClock />} title="Interventi rapidi" body="Arriviamo in fretta e risolviamo nella maggior parte dei casi in giornata." />
              <WhyItem icon={<IcHome />} title="Lavoro pulito e ordinato" body="Rispettiamo la tua casa: copriamo, proteggiamo e lasciamo tutto in ordine." />
            </div>
          </div>
        </section>

        {/* CONTATTI */}
        <section className={cx("block", "contact")} id="contatti">
          <div className={cx("wrap")}>
            <div className={cx("contact-left")}>
              <span className={cx("eyebrow")}>Contattaci</span>
              <h2 style={{ fontSize: "clamp(32px,3.4vw,46px)", marginTop: 14 }}>{model.contact.ctaLabel}</h2>
              <p className={cx("lead")}>{model.contact.note ?? "Compila il modulo o chiamaci direttamente. Per le emergenze il telefono è la via più veloce."}</p>
              <div className={cx("contact-info")}>
                {phone && (
                  <div className={cx("ci")}>
                    <div className={cx("ic")}><IcPhone /></div>
                    <div><small>Telefono</small><a href={tel}><b>{phone}</b></a></div>
                  </div>
                )}
                {model.contact.address && (
                  <div className={cx("ci")}>
                    <div className={cx("ic")}><IcPin /></div>
                    <div><small>Zona di copertura</small><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(model.contact.address)}`} target="_blank" rel="noreferrer"><b className={cx("sub")}>{model.contact.address}</b></a></div>
                  </div>
                )}
                <div className={cx("ci")}>
                  <div className={cx("ic")}><IcClock /></div>
                  <div><small>Orari</small><b className={cx("sub")}>{hours.length > 0 ? hours.map((h) => `${h.day}: ${h.hours}`).join(" · ") : "Ufficio 8:00–19:00 · Pronto intervento 24 ore su 24"}</b></div>
                </div>
              </div>
              {phone && (
                <div className={cx("urgent-call")}>
                  <div className={cx("ic")} aria-hidden="true"><IcPhone /></div>
                  <div><small>Emergenza in corso?</small><a href={tel}><b>Chiama il {phone}</b></a></div>
                </div>
              )}
            </div>
            <div className={cx("form-card")}>
              <InterventoForm phone={phone} />
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className={cx("foot")}>
          <div className={cx("wrap")}>
            <div className={cx("foot-grid")}>
              <div>
                <a className={cx("brand")} href="#top">
                  <span className={cx("mark")} aria-hidden="true"><IcPin /></span>
                  <span>{name}<small>{model.meta.category}</small></span>
                </a>
                <p className={cx("about")} style={{ marginTop: 16 }}>{model.about.body.slice(0, 160)}</p>
              </div>
              <div>
                <h5>Servizi</h5>
                <ul>{services.slice(0, 5).map((svc, i) => <li key={i}><a href="#servizi">{svc.title}</a></li>)}</ul>
              </div>
              <div>
                <h5>Contatti</h5>
                <ul>
                  {phone && <li><a href={tel}>{phone}</a></li>}
                  {model.contact.address && <li><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(model.contact.address)}`} target="_blank" rel="noreferrer">{model.contact.address}</a></li>}
                  <li>Pronto intervento 24/7</li>
                  <li><a href="#contatti">Richiedi un preventivo</a></li>
                </ul>
              </div>
            </div>
            <div className={cx("foot-bottom")}>
              <span>© {name}</span>
              <span>Professionisti assicurati · Garanzia sul lavoro · Anteprima dimostrativa</span>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

function WhyItem({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className={cx("why-item")}>
      <div className={cx("ic")}>{icon}</div>
      <div>
        <h4>{title}</h4>
        <p>{body}</p>
      </div>
    </div>
  );
}
