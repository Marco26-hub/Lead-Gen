/** Bits shared across demo templates: font loading + small text helpers. */

export const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Anton&family=Archivo:wght@500;600;700;800;900&family=Cormorant+Garamond:wght@600;700&family=DM+Sans:wght@400;500;600;700&family=Hanken+Grotesk:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&family=Libre+Baskerville:wght@700&family=Oswald:wght@500;600;700&family=Playfair+Display:wght@600;700;800;900&family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Poppins:wght@600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap";

/** Preconnect + stylesheet links for the Google Fonts used by the theme presets. */
export function FontLinks() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="stylesheet" href={FONTS_HREF} />
    </>
  );
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export function stars(n: number): string {
  return "★".repeat(Math.max(0, Math.min(5, Math.round(n))));
}

/**
 * Photo slot policy — single source of truth for every demo template (current
 * and future). Operators curate `leads.photos` via the PhotoManager and the
 * IG-enrich pipeline; templates only read these slots, never re-pick.
 *
 *   pics[0]              → hero
 *   pics[1] .. pics[8]   → gallery (up to 8 shots)
 *   pics[last]           → optional about photo (only used by templates that
 *                          have a dedicated about-photo slot)
 *
 * Rules baked in:
 *   - Gallery MUST start at index 1 — never duplicate the hero.
 *   - Gallery cap is GALLERY_MAX (8). Bumping it once here propagates to every
 *     template.
 *   - aboutPhoto falls back to the hero if only one photo exists, and is
 *     deliberately distinct from the gallery (it's the tail of the array, so
 *     it changes last when an operator curates the head).
 */
export const HERO_INDEX = 0;
export const GALLERY_START = 1;
/** Max gallery photos rendered by any template. Bump in one place. */
export const GALLERY_MAX = 8;
export const GALLERY_END = GALLERY_START + GALLERY_MAX; // exclusive: slice(1, 9)

export interface PhotoSplit {
  /** Truthy photos in stored order — use this for any custom slicing. */
  pics: string[];
  /** First photo or undefined. */
  hero: string | undefined;
  /** Up to GALLERY_MAX photos, never includes hero. */
  gallery: string[];
  /** Last photo (or hero if only one) — for templates with an about slot. */
  aboutPhoto: string | undefined;
}

/** Apply the photo slot policy. Every template should consume photos via this. */
export function splitPhotos(photos: string[] | null | undefined): PhotoSplit {
  const pics = (photos ?? []).filter(Boolean);
  const hero = pics[HERO_INDEX];
  const gallery = pics.slice(GALLERY_START, GALLERY_END);
  const aboutPhoto = pics.length > 1 ? pics[pics.length - 1] : hero;
  return { pics, hero, gallery, aboutPhoto };
}
