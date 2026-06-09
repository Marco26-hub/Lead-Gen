import { parsePhoneNumberFromString, type CountryCode } from 'libphonenumber-js';

/** Lowercase host, strip protocol/path and a leading `www.`. Secondary dedupe key. */
export function normalizeDomain(url?: string | null): string | null {
  if (!url) return null;
  let u = url.trim();
  if (!u) return null;
  if (!/^https?:\/\//i.test(u)) u = `http://${u}`;
  try {
    const host = new URL(u).hostname.toLowerCase().replace(/^www\./, '');
    return host || null;
  } catch {
    return null;
  }
}

/** Parse a phone into E.164 (default region Italy). Returns null if invalid. */
export function toE164(phone?: string | null, region: CountryCode = 'IT'): string | null {
  if (!phone) return null;
  try {
    const p = parsePhoneNumberFromString(phone, region);
    return p && p.isValid() ? p.number : null;
  } catch {
    return null;
  }
}

export type PhoneType = 'mobile' | 'fixed' | 'other';

/** Classify a phone as mobile (WhatsApp-eligible), fixed-line, or other. */
export function phoneType(phone?: string | null, region: CountryCode = 'IT'): PhoneType | null {
  if (!phone) return null;
  try {
    const p = parsePhoneNumberFromString(phone, region);
    if (!p || !p.isValid()) return null;
    const t = p.getType();
    if (t === 'MOBILE' || t === 'FIXED_LINE_OR_MOBILE') return 'mobile';
    if (t === 'FIXED_LINE') return 'fixed';
    return 'other';
  } catch {
    return null;
  }
}

/** Normalize a città for grouping: trim, collapse spaces, Title Case. */
export function normalizeCity(s?: string | null): string | null {
  if (!s) return null;
  const t = s.trim().replace(/\s+/g, ' ');
  if (!t) return null;
  return t
    .split(' ')
    .map((w) => (w ? w[0]!.toUpperCase() + w.slice(1).toLowerCase() : w))
    .join(' ');
}

/** Public demo slug: kebab business name + last 6 chars of place_id (kept unique). */
export function slugify(name: string, placeId: string): string {
  const base =
    name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40) || 'lead';
  const cleanId = placeId.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  const suffix = (cleanId.slice(-6) || cleanId || 'x').padStart(2, '0');
  return `${base}-${suffix}`;
}
