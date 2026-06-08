import { extractInstagramHandle } from '@maps/core/instagram';
import { db } from '../lib/db';

/**
 * One-off: derive `instagram_handle` from `website_url` for leads that were
 * scraped BEFORE the capture-handle fix. Only fills rows where the GMB website
 * is itself an instagram.com URL — same logic the scrape path uses. Safe to
 * re-run (only updates rows where instagram_handle is null).
 */
async function main() {
  const sb = db();
  const { data, error } = await sb
    .from('leads')
    .select('id, business_name, website_url')
    .is('instagram_handle', null)
    .ilike('website_url', '%instagram.com%');
  if (error) throw new Error(error.message);

  const rows = (data ?? []) as { id: string; business_name: string; website_url: string | null }[];
  let scanned = 0;
  let updated = 0;
  const errors: Array<{ id: string; msg: string }> = [];

  for (const lead of rows) {
    scanned++;
    const handle = extractInstagramHandle(lead.website_url);
    if (!handle) continue;
    const { error: e } = await sb.from('leads').update({ instagram_handle: handle }).eq('id', lead.id);
    if (e) {
      errors.push({ id: lead.id, msg: e.message });
      continue;
    }
    updated++;
  }
  console.log(JSON.stringify({ scanned, updated, skipped: scanned - updated, errors }, null, 2));
  if (errors.length) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
