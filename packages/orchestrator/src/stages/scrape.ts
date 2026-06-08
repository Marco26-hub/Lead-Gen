import { readFileSync } from 'node:fs';
import { type RawPlace, type StageResult } from '@maps/core';
import { mapApifyItem, upsertLeads } from '@maps/core/scrape';
import { scrapePlaces, type ScrapeOpts } from '../providers/apify';

/** Load raw Apify dataset items (e.g. a connector dump) and map → RawPlace[]. */
function loadPlaces(file: string): RawPlace[] {
  const raw = JSON.parse(readFileSync(file, 'utf8'));
  if (!Array.isArray(raw)) throw new Error(`${file} non contiene un array JSON`);
  return raw.map((it) => mapApifyItem(it as Record<string, any>)).filter((p: RawPlace) => p.placeId && p.title);
}

/** Scrape (live or from --input) → dedupe-upsert into leads. */
export async function runScrape(opts: ScrapeOpts & { inputFile?: string }): Promise<StageResult> {
  const places = opts.inputFile ? loadPlaces(opts.inputFile) : await scrapePlaces(opts);
  return upsertLeads(places, opts.category);
}
