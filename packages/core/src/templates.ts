import type { ThemePreset } from './schemas';

/**
 * Template selection logic, shared by the web render/dashboard and the
 * orchestrator generate stage. Template ids are implemented in
 * apps/web/src/components/demo/templates.
 */

export function defaultTemplateForPreset(preset: ThemePreset): string {
  if (preset === 'restaurant') return 'ristorante-classic';
  if (preset === 'beauty') return 'unisex';
  return 'editorial';
}

/**
 * Guess the theme preset from the Google Maps category — mirrors the LLM mapping.
 * Used pre-generation (before page_model exists) to offer the right template set.
 */
export function presetFromCategory(category?: string | null): ThemePreset {
  const c = (category ?? '').toLowerCase();
  if (/ristorant|pizz|trattori|osteri|braceri|agritur|paninotec|tavola calda|enotec|sushi|cucina|gastronom/.test(c)) return 'restaurant';
  if (/avvocat|notai|commercialist|legale|consulen/.test(c)) return 'lawyer';
  if (/palestr|fitness|gym|crossfit/.test(c)) return 'gym';
  if (/parrucchier|estetist|beauty|barbier|nail|centro estetico/.test(c)) return 'beauty';
  if (/dentist|medic|dottor|odontoiatr|poliambulator|fisioterap/.test(c)) return 'medical';
  if (/negozi|boutique|abbigliam|store|retail/.test(c)) return 'retail';
  if (/idraul|elettricist|artigian|fabbro|imbianchin|muratore|falegnam|edil/.test(c)) return 'artisan';
  return 'default';
}

const STYLE_TEMPLATE: Record<string, string> = {
  pizzeria: 'pizzeria',
  pesce: 'pesce-mare',
  carne: 'carne-montagna',
  etnico: 'etnico-fusion',
  classic: 'ristorante-classic',
};

const SALON_STYLE_TEMPLATE: Record<string, string> = {
  barber: 'barber-shop',
  uomo: 'uomo',
  donna: 'donna',
  modern: 'modern',
  unisex: 'unisex',
};

/** Hybrid step 1: keyword detection on the Google Maps category. Null if unclear. */
export function restaurantTemplateFromCategory(category?: string | null): string | null {
  if (!category) return null;
  const c = category.toLowerCase();
  if (/pizz/.test(c)) return 'pizzeria';
  if (/pesce|frutti di mare|seafood|pescheria|marinar|crudo/.test(c)) return 'pesce-mare';
  if (/cines|giappon|sushi|asiat|etnic|fusion|kebab|indian|messic|thai|orient/.test(c)) return 'etnico-fusion';
  if (/brace|grigli|grill|carne|steak|bistecch|braceria|baita|rifugio|montan/.test(c)) return 'carne-montagna';
  return null;
}

/** Hybrid step 2: map the LLM-emitted restaurantStyle to a template id. */
export function restaurantStyleToTemplate(style?: string | null): string {
  return (style && STYLE_TEMPLATE[style]) || 'ristorante-classic';
}

/** Salon sub-style: keyword detection on the Google Maps category. Null if unclear. */
export function salonTemplateFromCategory(category?: string | null): string | null {
  if (!category) return null;
  const c = category.toLowerCase();
  if (/barbier|barber|barbiere/.test(c)) return 'barber-shop';
  if (/uomo|men|maschil/.test(c)) return 'uomo';
  if (/donna|women|femminil/.test(c)) return 'donna';
  if (/modern|avanguard|trend|fashion/.test(c)) return 'modern';
  return null;
}

/** Map a salon style to a template id. */
export function salonStyleToTemplate(style?: string | null): string {
  return (style && SALON_STYLE_TEMPLATE[style]) || 'unisex';
}

/**
 * Default template for a lead. Some templates target a specific trade
 * (idraulico). For restaurants it is hybrid: keyword on the Maps category
 * first, then the LLM restaurantStyle, else the classic master.
 */
export function defaultTemplateFor(
  category: string | null | undefined,
  preset: ThemePreset,
  restaurantStyle?: string | null,
  salonStyle?: string | null,
): string {
  if (category && /idraul|plumb/i.test(category)) return 'idraulica-pronto';
  if (preset === 'restaurant') {
    return restaurantTemplateFromCategory(category) ?? restaurantStyleToTemplate(restaurantStyle);
  }
  if (preset === 'beauty') {
    return salonTemplateFromCategory(category) ?? salonStyleToTemplate(salonStyle);
  }
  return defaultTemplateForPreset(preset);
}
