import { type StageResult, type LeadRow, emptyResult } from '@maps/core';
import { enrichLeadFromInstagram, mergeLeadPhotos } from '@maps/core/instagram';
import { db, updateLead } from '../lib/db';

export interface EnrichInstagramOpts {
  /** Max leads to process this run. */
  limit?: number;
  /** Max images to keep per profile. */
  maxImages?: number;
  /** Skip leads that already have at least this many photos (cheap dedupe over time). */
  skipIfPhotosAtLeast?: number;
}

/**
 * Enrich leads' galleries from Instagram. Selects leads with a known
 * `instagram_handle`, fetches their recent IG posts via Apify, re-hosts the
 * images into Supabase Storage, and PREPENDS the public URLs into `photos`.
 *
 * Lifecycle status is NOT changed — this is a side-channel enrichment that
 * can run any time after `scraped`. `advanced` counts leads where at least
 * one new image was added.
 */
export async function runEnrichInstagram(opts: EnrichInstagramOpts = {}): Promise<StageResult> {
  const res = emptyResult('enrich_instagram');
  const limit = opts.limit ?? 50;
  const skipIf = opts.skipIfPhotosAtLeast ?? 0;

  const { data, error } = await db()
    .from('leads')
    .select('*')
    .eq('source', 'maps')
    .not('instagram_handle', 'is', null)
    .order('created_at', { ascending: true })
    .limit(limit);
  if (error) throw new Error(`select leads with instagram_handle: ${error.message}`);

  for (const lead of (data ?? []) as LeadRow[]) {
    // Skip BEFORE bumping processed so the counter reflects real work, not the
    // SQL result count. (`instagram_handle IS NOT NULL` is already filtered in
    // the query so the second guard is just defensive — kept as belt-and-braces.)
    if (skipIf > 0 && (lead.photos ?? []).length >= skipIf) continue;
    if (!lead.instagram_handle) continue;
    res.processed++;
    try {
      const r = await enrichLeadFromInstagram(lead.id, lead.instagram_handle, { maxImages: opts.maxImages });
      if (r.added === 0) {
        if (r.errors.length) res.errors.push({ placeId: lead.place_id, msg: `IG: ${r.errors[0]!.msg}` });
        continue;
      }
      const merged = mergeLeadPhotos(lead.photos, r.photos);
      await updateLead(lead.id, { photos: merged });
      res.advanced++;
    } catch (e) {
      res.errors.push({ placeId: lead.place_id, msg: (e as Error).message });
    }
  }
  return res;
}
