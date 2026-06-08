import type { PageModel } from './schemas';

export interface JsonLdInput {
  model: PageModel;
  rating?: number | null;
  reviewCount?: number | null;
  photos?: string[];
  url?: string | null;
}

/**
 * Build schema.org JSON-LD for a demo page (Restaurant or LocalBusiness).
 * Kept conservative so it validates: only emits fields we actually have.
 * Opening hours are intentionally omitted (the scraped strings are free-text
 * and don't map cleanly to OpeningHoursSpecification).
 */
export function buildLocalBusinessJsonLd({
  model,
  rating,
  reviewCount,
  photos,
  url,
}: JsonLdInput): Record<string, unknown> {
  const isRestaurant = model.theme.preset === 'restaurant';
  const ld: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': isRestaurant ? 'Restaurant' : 'LocalBusiness',
    name: model.meta.businessName,
  };
  if (model.meta.tagline) ld.description = model.meta.tagline;
  if (photos && photos.length) ld.image = photos.slice(0, 6);
  if (url) ld.url = url;
  if (model.contact.phone) ld.telephone = model.contact.phone;
  if (model.contact.address) {
    ld.address = { '@type': 'PostalAddress', streetAddress: model.contact.address, addressCountry: 'IT' };
  }
  if (isRestaurant) {
    ld.servesCuisine = 'Italiana';
    if (model.menu) ld.hasMenu = true;
  }
  if (typeof rating === 'number' && rating > 0) {
    ld.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: rating,
      ...(reviewCount ? { reviewCount } : {}),
    };
  }
  return ld;
}
