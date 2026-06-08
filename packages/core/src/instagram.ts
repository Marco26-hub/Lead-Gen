import { ApifyClient } from 'apify-client';
import { requireEnv } from './config';

/**
 * Instagram enrichment via Apify `apify/instagram-profile-scraper`.
 * Imported as `@maps/core/instagram` (not the barrel) so `apify-client` stays
 * out of any client bundle — same trick as `@maps/core/scrape`.
 *
 * The flow: a lead arrives from the Maps scrape with `instagram_handle` already
 * set (only when the compass actor's `scrapeContactDetails` returned a social
 * link, or when the GMB website itself was an instagram.com URL). The enrich
 * stage feeds that handle to this actor, then re-hosts the returned image URLs
 * via `@maps/core/storage` because IG CDN URLs expire (signed).
 */
export const INSTAGRAM_ACTOR_ID = 'apify/instagram-profile-scraper';

/** Strip @ / URL / query / trailing slash, lowercase, validate. Null if not a real handle. */
export function extractInstagramHandle(input: string | undefined | null): string | undefined {
  if (!input) return undefined;
  const s = String(input).trim();
  if (!s) return undefined;

  // URL form: pull the first path segment. Lowercase the host-check window so
  // `INSTAGRAM.COM/foo` (a GMB website that's all-caps) still parses correctly.
  let raw = s;
  const lower = raw.toLowerCase();
  if (/^https?:\/\//i.test(raw) || raw.startsWith('//')) {
    try {
      const u = new URL(raw.startsWith('//') ? `https:${raw}` : raw);
      if (!/(^|\.)instagram\.com$/i.test(u.hostname)) return undefined;
      raw = u.pathname.replace(/^\/+/, '').split('/')[0] ?? '';
    } catch {
      return undefined;
    }
  } else if (lower.startsWith('instagram.com/')) {
    raw = raw.slice('instagram.com/'.length).split('/')[0] ?? '';
  }

  raw = raw.replace(/^@/, '').split('?')[0]!.split('#')[0]!.replace(/\/+$/, '');

  // IG handles: letters, digits, dot, underscore — 1..30 chars
  if (!/^[A-Za-z0-9._]{1,30}$/.test(raw)) return undefined;
  // Reserved IG paths we'd hit if someone passed e.g. instagram.com/explore/
  const reserved = new Set(['p', 'reel', 'reels', 'tv', 'explore', 'accounts', 'directory', 'about', 'stories', 'web']);
  if (reserved.has(raw.toLowerCase())) return undefined;

  return raw.toLowerCase();
}

export interface InstagramMediaItem {
  /** Public IG CDN URL — signed, expires within hours/days. Always re-host. */
  url: string;
  /** Aspect ratio if known, used by the storage helper to pick the file extension. */
  width?: number;
  height?: number;
  /** Permalink to the original post — kept for attribution in the future. */
  postUrl?: string;
}

function apifyClient(): ApifyClient {
  return new ApifyClient({ token: requireEnv('APIFY_TOKEN') });
}

/**
 * Pull recent images for an Instagram handle. Returns an empty array for private
 * profiles or accounts with no public image posts. The actor returns ~12 latest
 * posts; we keep only `Image` and `Sidecar` (carousel) media, drop videos.
 *
 * Uses `.start()` + bounded polling instead of the blocking `.call()` because
 * the actor can take 30-120s on busy profiles — and the per-lead web API has a
 * function-time budget. `timeoutMs` is the caller's deadline; if the actor
 * isn't finished by then we throw a clean timeout error (so the caller knows
 * to retry / use the CLI / raise the Vercel `maxDuration`).
 *
 * NB: `apify/instagram-profile-scraper` charges per profile event (~$0.0026
 * FREE tier); posts ride along free. Caller should pass ONE handle per call to
 * keep telemetry per-lead.
 */
export async function fetchInstagramMedia(
  handle: string,
  opts?: { maxImages?: number; timeoutMs?: number; pollIntervalMs?: number },
): Promise<InstagramMediaItem[]> {
  const max = Math.max(1, Math.min(20, opts?.maxImages ?? 10));
  const timeoutMs = opts?.timeoutMs ?? 270_000; // default ~4.5 min — orchestrator CLI is the unbounded path
  const pollIntervalMs = opts?.pollIntervalMs ?? 3_000;
  const client = apifyClient();

  const started = await client.actor(INSTAGRAM_ACTOR_ID).start({
    usernames: [handle],
    includeAboutSection: false,
  });

  const deadline = Date.now() + timeoutMs;
  // Apify run terminal states. SUCCEEDED is the only happy path.
  const TERMINAL = new Set(['SUCCEEDED', 'FAILED', 'TIMED-OUT', 'TIMED_OUT', 'ABORTED']);
  let run = started;
  while (!TERMINAL.has(run.status)) {
    if (Date.now() >= deadline) {
      throw new Error(`IG actor still running after ${timeoutMs}ms (run ${started.id}) — retry later or use the CLI`);
    }
    await new Promise((r) => setTimeout(r, pollIntervalMs));
    const next = await client.run(started.id).get();
    if (!next) throw new Error(`IG run ${started.id} disappeared`);
    run = next;
  }
  if (run.status !== 'SUCCEEDED') {
    throw new Error(`IG actor run ${run.status}: ${run.statusMessage ?? 'no message'}`);
  }

  const { items } = await client.dataset(run.defaultDatasetId).listItems();
  const profile = (items[0] ?? {}) as Record<string, any>;
  if (profile.private) return [];
  const posts: any[] = Array.isArray(profile.latestPosts) ? profile.latestPosts : [];

  const out: InstagramMediaItem[] = [];
  for (const post of posts) {
    if (!post || typeof post !== 'object') continue;
    const type = String(post.type ?? '');
    const postUrl = typeof post.url === 'string' ? post.url : undefined;

    if (type === 'Sidecar' && Array.isArray(post.childPosts)) {
      for (const child of post.childPosts as any[]) {
        if (child?.type === 'Video') continue;
        const url = pickImageUrl(child);
        if (url) out.push({ url, width: child.dimensionsWidth, height: child.dimensionsHeight, postUrl });
        if (out.length >= max) return out;
      }
    } else if (type !== 'Video') {
      const url = pickImageUrl(post);
      if (url) out.push({ url, width: post.dimensionsWidth, height: post.dimensionsHeight, postUrl });
    }
    if (out.length >= max) break;
  }
  return out;
}

function pickImageUrl(p: any): string | undefined {
  if (Array.isArray(p?.images) && typeof p.images[0] === 'string') return p.images[0];
  if (typeof p?.displayUrl === 'string') return p.displayUrl;
  return undefined;
}

/**
 * High-level "enrich one lead from Instagram" used by both the orchestrator
 * stage and the per-lead API route. Returns the rehosted public URLs that
 * should be PREPENDED to `leads.photos` (so the IG hero replaces the GMB hero).
 *
 * Safe to call with no handle (returns `{ added: 0, photos: [] }`). Failed
 * uploads of individual images are logged into `errors` but do not abort the
 * batch — partial success is fine.
 */
export async function enrichLeadFromInstagram(
  leadId: string,
  handle: string,
  opts?: { maxImages?: number; timeoutMs?: number },
): Promise<{
  fetched: number;
  added: number;
  photos: string[];
  errors: Array<{ url: string; msg: string }>;
}> {
  // Lazy import — keeps `node:crypto` / Storage SDK out of any unrelated bundle
  // that might import `@maps/core/instagram` for `extractInstagramHandle` only.
  const { rehostImage } = await import('./storage');
  const media = await fetchInstagramMedia(handle, opts);
  const photos: string[] = [];
  const errors: Array<{ url: string; msg: string }> = [];
  for (const m of media) {
    try {
      const r = await rehostImage(leadId, m.url);
      photos.push(r.publicUrl);
    } catch (e) {
      errors.push({ url: m.url, msg: (e as Error).message });
    }
  }
  return { fetched: media.length, added: photos.length, photos, errors };
}

/** Cap on combined photo count after merge — keeps galleries from ballooning. */
export const PHOTOS_AFTER_MERGE_CAP = 20;

/** Prepend new photos to existing ones, de-dupe, cap. Pure helper. */
export function mergeLeadPhotos(existing: string[] | null | undefined, fresh: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const u of [...fresh, ...(existing ?? [])]) {
    if (!u || seen.has(u)) continue;
    seen.add(u);
    out.push(u);
    if (out.length >= PHOTOS_AFTER_MERGE_CAP) break;
  }
  return out;
}
