"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import s from "./mobilenav.module.css";

export interface MobileNavLink {
  href: string;
  label: string;
}

interface MobileNavProps {
  /** In-page anchor links (mirror the desktop nav, respecting conditional sections). */
  links: MobileNavLink[];
  /** Business name shown in the drawer header. */
  brand: string;
  /** Small line under the brand (category / area). */
  tagline?: string;
  /** Optional phone — rendered as a tel: action in the drawer. */
  phone?: string | null;
  /** Primary CTA label (defaults to the hero CTA copy passed by the template). */
  ctaLabel?: string;
  /** CTA target (defaults to the contact anchor). */
  ctaHref?: string;
  /**
   * Accent colour for the CTA + active accents. The drawer is portalled to
   * <body> (to escape the sticky nav's containing block), so pass a *literal*
   * colour here — a `var(--brand)` would not resolve outside the template root.
   */
  accent?: string;
}

const Burger = () => (
  <span className={s.bars} aria-hidden="true">
    <span />
    <span />
    <span />
  </span>
);

const IcClose = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

const IcPhone = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8.1 9.8a16 16 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.8 2.1Z" />
  </svg>
);

const IcArrow = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

/**
 * Shared mobile navigation for every demo template. Hidden above 980px (the
 * template's own desktop nav takes over). On mobile it renders a ≥44px burger
 * that opens an accessible dark-glass slide-in drawer. Closes on link tap,
 * backdrop tap, or Escape; locks body scroll and manages focus while open.
 *
 * The drawer (overlay + panel) is portalled to <body>: the sticky nav uses
 * `backdrop-filter`, which would otherwise become the containing block for the
 * fixed overlay and collapse it to the nav's height. Server-render safe — the
 * burger renders on the server, the portal mounts only on the client.
 */
export function MobileNav({ links, brand, tagline, phone, ctaLabel, ctaHref = "#contatti", accent }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const drawerId = useId();
  const burgerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const tel = phone ? `tel:${phone.replace(/\s+/g, "")}` : undefined;

  useEffect(() => setMounted(true), []);

  // Lock body scroll + close on Escape while the drawer is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const close = () => {
    setOpen(false);
    burgerRef.current?.focus();
  };

  const overlayStyle = accent ? ({ ["--mn-accent"]: accent } as React.CSSProperties) : undefined;

  const drawer = (
    <div className={`${s.overlay}${open ? ` ${s.open}` : ""}`} style={overlayStyle}>
      <div className={s.backdrop} onClick={close} aria-hidden="true" />
      <aside
        id={drawerId}
        className={s.panel}
        role="dialog"
        aria-modal="true"
        aria-label="Menu di navigazione"
        aria-hidden={!open}
        inert={!open ? true : undefined}
      >
        <div className={s.panelHead}>
          <div className={s.brand}>
            <b>{brand}</b>
            {tagline && <small>{tagline}</small>}
          </div>
          <button ref={closeRef} type="button" className={s.close} aria-label="Chiudi il menu" onClick={close}>
            <IcClose />
          </button>
        </div>

        <nav className={s.links} aria-label="Navigazione">
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={close}>
              <span>{l.label}</span>
              <IcArrow />
            </a>
          ))}
        </nav>

        <div className={s.foot}>
          {tel && (
            <a className={s.phone} href={tel} onClick={close}>
              <IcPhone />
              <span>{phone}</span>
            </a>
          )}
          {ctaLabel && (
            <a className={s.cta} href={ctaHref} onClick={close}>
              {ctaLabel}
              <IcArrow />
            </a>
          )}
        </div>
      </aside>
    </div>
  );

  return (
    <div className={s.mnav}>
      <button
        ref={burgerRef}
        type="button"
        className={s.burger}
        aria-label="Apri il menu"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={drawerId}
        onClick={() => setOpen(true)}
      >
        <Burger />
      </button>
      {mounted && createPortal(drawer, document.body)}
    </div>
  );
}
