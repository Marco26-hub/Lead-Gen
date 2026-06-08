import { ApifyClient } from 'apify-client';
import { requireEnv, type RawPlace } from '@maps/core';
import { mapApifyItem, SCRAPE_ACTOR_ID } from '@maps/core/scrape';

export interface ScrapeOpts {
  city: string;
  category: string;
  limit: number;
  enrichContacts?: boolean;
  language?: string;
}

/** Synchronous scrape (waits for the run) — used by the CLI. The web app uses the async path in core. */
export async function scrapePlaces(opts: ScrapeOpts): Promise<RawPlace[]> {
  const client = new ApifyClient({ token: requireEnv('APIFY_TOKEN') });
  const input = {
    searchStringsArray: [`${opts.category} ${opts.city}`],
    maxCrawledPlacesPerSearch: opts.limit,
    language: opts.language ?? 'it',
    skipClosedPlaces: true,
    scrapeContactDetails: opts.enrichContacts ?? false,
    maxImages: 10,
    maxReviews: 5,
  };
  const run = await client.actor(SCRAPE_ACTOR_ID).call(input);
  const { items } = await client.dataset(run.defaultDatasetId).listItems();
  return items.map((it) => mapApifyItem(it as Record<string, any>)).filter((p) => p.placeId && p.title);
}
