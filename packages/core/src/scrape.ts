import { ApifyClient } from 'apify-client';
import { getServiceClient } from './supabase';
import { requireEnv } from './config';
import { normalizeDomain, toE164, phoneType, slugify } from './normalize';
import { type RawPlace, type ReviewItem, type StageResult, emptyResult } from './types';
import { extractInstagramHandle } from './instagram';

/**
 * Apify Google Maps scraping — shared by the orchestrator CLI and the web app.
 * Imported as `@maps/core/scrape` (not from the barrel, to keep apify-client out of client bundles).
 */
export const SCRAPE_ACTOR_ID = 'compass/crawler-google-places';

export interface ScrapeParams {
  city: string;
  category: string;
  limit: number;
  enrichContacts?: boolean;
  websiteFilter?: 'all' | 'with' | 'without';
}

export function apifyClient(): ApifyClient {
  return new ApifyClient({ token: requireEnv('APIFY_TOKEN') });
}

function buildActorInput(p: ScrapeParams): Record<string, unknown> {
  const websiteMap = { all: 'allPlaces', with: 'withWebsite', without: 'withoutWebsite' } as const;
  return {
    searchStringsArray: [p.category],
    locationQuery: p.city,
    maxCrawledPlacesPerSearch: p.limit,
    language: 'it',
    skipClosedPlaces: true,
    scrapeContactDetails: p.enrichContacts ?? false,
    website: websiteMap[p.websiteFilter ?? 'all'],
    maxImages: 10,
    maxReviews: 5,
  };
}

/** Start an async Apify run with completion webhooks. Returns run + dataset ids. */
export async function startScrapeRun(
  p: ScrapeParams,
  webhookUrl: string,
): Promise<{ runId: string; datasetId: string }> {
  const run = await apifyClient()
    .actor(SCRAPE_ACTOR_ID)
    .start(buildActorInput(p), {
      webhooks: [
        {
          eventTypes: ['ACTOR.RUN.SUCCEEDED', 'ACTOR.RUN.FAILED', 'ACTOR.RUN.TIMED_OUT', 'ACTOR.RUN.ABORTED'],
          requestUrl: webhookUrl,
        },
      ],
    });
  return { runId: run.id, datasetId: run.defaultDatasetId };
}

export async function fetchDatasetItems(datasetId: string): Promise<Record<string, unknown>[]> {
  const { items } = await apifyClient().dataset(datasetId).listItems();
  return items as Record<string, unknown>[];
}

/** Map one raw Apify dataset item → RawPlace. */
export function mapApifyItem(it: Record<string, any>): RawPlace {
  const reviews = Array.isArray(it.reviews)
    ? it.reviews
        .map((r: any) => ({
          text: (r?.text ?? r?.reviewText ?? null) as string | null,
          name: (r?.name ?? r?.reviewerName ?? undefined) as string | undefined,
          stars: (typeof r?.stars === 'number' ? r.stars : r?.rating) as number | undefined,
        }))
        .filter((r: { text: string | null }) => r.text)
    : undefined;
  const emails: string[] | undefined = Array.isArray(it.emails) ? it.emails : it.email ? [it.email] : undefined;
  const imageUrls: string[] | undefined = Array.isArray(it.imageUrls)
    ? it.imageUrls.filter((u: unknown): u is string => typeof u === 'string' && u.length > 0)
    : typeof it.imageUrl === 'string'
      ? [it.imageUrl]
      : undefined;
  const openingHours = Array.isArray(it.openingHours)
    ? it.openingHours
        .map((o: any) => ({ day: String(o?.day ?? ''), hours: String(o?.hours ?? '') }))
        .filter((o: { day: string; hours: string }) => o.day && o.hours)
    : undefined;
  // Instagram handle — only the actor's `scrapeContactDetails` mode populates these.
  // Try the structured `socials.instagram[0]`, then the flat `instagrams[0]`, then
  // fall back to the website itself if the SMB registered an instagram.com URL as
  // their Google Business website. Always normalize to a bare handle (no @, no URL).
  const igRaw =
    (it?.socials && Array.isArray(it.socials.instagram) ? it.socials.instagram[0] : undefined) ??
    (Array.isArray(it.instagrams) ? it.instagrams[0] : undefined) ??
    (typeof it.website === 'string' && /instagram\.com/i.test(it.website) ? it.website : undefined);
  const instagramHandle = extractInstagramHandle(igRaw);
  return {
    placeId: String(it.placeId ?? it.fid ?? it.cid ?? ''),
    title: String(it.title ?? it.name ?? ''),
    categoryName: it.categoryName ?? (Array.isArray(it.categories) ? it.categories[0] : undefined),
    address: it.address ?? it.street ?? undefined,
    phone: it.phone ?? undefined,
    phoneUnformatted: it.phoneUnformatted ?? undefined,
    website: it.website ?? undefined,
    totalScore: typeof it.totalScore === 'number' ? it.totalScore : undefined,
    reviewsCount: typeof it.reviewsCount === 'number' ? it.reviewsCount : undefined,
    reviews,
    emails,
    imageUrls,
    openingHours,
    instagramHandle,
  };
}

function topReviews(p: RawPlace): ReviewItem[] {
  const rs = (p.reviews ?? []).filter((r) => r.text);
  rs.sort((a, b) => (b.stars ?? 0) - (a.stars ?? 0));
  return rs.slice(0, 3).map((r) => ({ text: String(r.text), author: r.name, rating: r.stars }));
}

/** Upsert payload — omits status/page_model/demo_url so re-scrape never regresses a lead. */
export function buildLeadPayload(p: RawPlace, fallbackCategory: string): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    place_id: p.placeId,
    business_name: p.title,
    category: p.categoryName ?? fallbackCategory,
    address: p.address ?? null,
    rating: typeof p.totalScore === 'number' ? p.totalScore : null,
    review_count: typeof p.reviewsCount === 'number' ? p.reviewsCount : null,
    reviews: topReviews(p),
    slug: slugify(p.title, p.placeId),
  };
  if (p.imageUrls && p.imageUrls.length) payload.photos = p.imageUrls.slice(0, 10);
  if (p.openingHours && p.openingHours.length) payload.opening_hours = p.openingHours;
  if (p.website) payload.website_url = p.website;
  const domain = normalizeDomain(p.website);
  if (domain) payload.domain = domain;
  const phone = toE164(p.phoneUnformatted ?? p.phone ?? null);
  if (phone) payload.phone_e164 = phone;
  const ptype = phoneType(p.phoneUnformatted ?? p.phone ?? null);
  if (ptype) payload.phone_type = ptype;
  const email = p.emails?.[0] ?? null;
  if (email) payload.email = email;
  if (p.instagramHandle) payload.instagram_handle = p.instagramHandle;
  return payload;
}

/** Dedupe-upsert places into `leads` (conflict on place_id; graceful domain-unique fallback). */
export async function upsertLeads(places: RawPlace[], fallbackCategory: string): Promise<StageResult> {
  const res = emptyResult('scrape');
  const sb = getServiceClient();
  for (const p of places) {
    if (!p.placeId || !p.title) continue;
    res.processed++;
    const payload = buildLeadPayload(p, fallbackCategory);
    const { error } = await sb.from('leads').upsert(payload, { onConflict: 'place_id' });
    if (error) {
      if (error.code === '23505' && /domain/i.test(error.message)) {
        const { domain: _omit, ...withoutDomain } = payload;
        const retry = await sb.from('leads').upsert(withoutDomain, { onConflict: 'place_id' });
        if (retry.error) {
          res.errors.push({ placeId: p.placeId, msg: retry.error.message });
          continue;
        }
      } else {
        res.errors.push({ placeId: p.placeId, msg: error.message });
        continue;
      }
    }
    res.advanced++;
  }
  return res;
}
