import { createHash } from 'node:crypto';
import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';
import { getServiceClient } from './supabase';
import { env } from './config';

/**
 * Re-host third-party images (Instagram CDN, etc.) into a public Supabase
 * Storage bucket so the URLs we write into `leads.photos` don't rot.
 *
 * Imported as `@maps/core/storage` (deep path) — keeps `node:crypto` and the
 * Supabase Storage SDK out of client bundles via the barrel.
 *
 * The bucket itself is created by migration `0007_storage_lead_photos.sql`.
 *
 * SSRF defense:
 *   1. Scheme allowlist (https only).
 *   2. Host allowlist (Instagram/Facebook CDN suffixes).
 *   3. DNS resolution + private/loopback/link-local IP rejection per hop.
 *   4. redirect: 'manual' so each hop is re-validated.
 *   5. Streaming byte cap (content-length is forgeable / absent on chunked).
 */

const FETCH_TIMEOUT_MS = 15_000;
const MAX_BYTES = 8 * 1024 * 1024; // 8 MB
const MAX_REDIRECTS = 4;
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);

// IG / Meta CDN hostnames per il rehost SSRF-hardened (fetch server-side).
const ALLOWED_HOST_SUFFIXES = ['cdninstagram.com', 'fbcdn.net'];

/**
 * Allowlist degli hostname accettati nei campi `leads.photos`:
 *   - Google Maps photos (lh*.googleusercontent.com, *.gstatic.com, *.ggpht.com)
 *   - Instagram / Meta CDN (cdninstagram.com, fbcdn.net)
 *   - Il bucket Supabase del nostro progetto (env.SUPABASE_URL host) — vi
 *     finiscono le immagini rehostate da IG.
 *
 * Usato da:
 *   - `apps/web/src/app/api/og/[slug]` prima di passare l'URL a next/og
 *     ImageResponse (che internamente fetcha l'immagine server-side).
 *   - `apps/web/src/app/api/leads/[id]/update` per filtrare le URL che il
 *     PhotoManager prova a salvare.
 *
 * Limiti: questa è una validazione SYNC schema+hostname (no DNS lookup, no
 * private-IP check). Va abbinata a `assertSafePublicUrl` quando il server
 * fetcha la URL direttamente (es. `rehostImage`).
 */
const ALLOWED_PHOTO_HOST_SUFFIXES = [
  'googleusercontent.com', // Google Maps CDN (lh3-7, ggpht subdomains)
  'gstatic.com',
  'ggpht.com',
  'cdninstagram.com',
  'fbcdn.net',
];

let _supabaseHostCache: string | null = null;
function supabaseHost(): string | null {
  if (_supabaseHostCache !== null) return _supabaseHostCache;
  if (!env.SUPABASE_URL) return (_supabaseHostCache = null);
  try {
    _supabaseHostCache = new URL(env.SUPABASE_URL).hostname.toLowerCase();
  } catch {
    _supabaseHostCache = null;
  }
  return _supabaseHostCache;
}

/**
 * True se l'URL è https + hostname in allowlist (Google CDN | Meta CDN |
 * il bucket Supabase del nostro progetto). Sync, no DNS, no IP check.
 */
export function isSafeImageUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string') return false;
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return false;
  }
  if (u.protocol !== 'https:') return false;
  const host = u.hostname.toLowerCase();
  if (ALLOWED_PHOTO_HOST_SUFFIXES.some((s) => host === s || host.endsWith('.' + s))) return true;
  const sb = supabaseHost();
  if (sb && host === sb) return true;
  return false;
}

const EXT_BY_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export interface RehostResult {
  /** Public CDN URL of the uploaded object — safe to persist. */
  publicUrl: string;
  /** Storage path inside the bucket (e.g. `<leadId>/<hash>.jpg`). */
  path: string;
  /** Bytes uploaded. */
  bytes: number;
}

/**
 * Download `srcUrl` server-side and upload it to the lead-photos bucket under
 * `<leadId>/<sha1>.<ext>`. Idempotent: re-running for the same source URL hits
 * the same path and returns the same public URL (no duplicate uploads).
 */
export async function rehostImage(leadId: string, srcUrl: string): Promise<RehostResult> {
  if (!leadId || !srcUrl) throw new Error('rehostImage: leadId and srcUrl are required');

  const { res, mime } = await safeFetchImage(srcUrl);
  const buf = await readBoundedBuffer(res, MAX_BYTES);

  const hash = createHash('sha1').update(srcUrl).digest('hex').slice(0, 16);
  const ext = EXT_BY_MIME[mime]!;
  const path = `${leadId}/${hash}.${ext}`;
  const bucket = env.SUPABASE_STORAGE_BUCKET;

  const sb = getServiceClient();
  const { error } = await sb.storage.from(bucket).upload(path, buf, {
    contentType: mime,
    cacheControl: '31536000',
    upsert: true,
  });
  if (error) throw new Error(`upload ${path}: ${error.message}`);

  const { data } = sb.storage.from(bucket).getPublicUrl(path);
  return { publicUrl: data.publicUrl, path, bytes: buf.byteLength };
}

/** Resolve, validate, and fetch a URL with redirects validated per-hop. */
async function safeFetchImage(initialUrl: string): Promise<{ res: Response; mime: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    let current = initialUrl;
    for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
      await assertSafePublicUrl(current);
      const res = await fetch(current, { signal: controller.signal, redirect: 'manual' });
      if (res.status >= 300 && res.status < 400) {
        const loc = res.headers.get('location');
        if (!loc) throw new Error(`redirect without location at ${current}`);
        current = new URL(loc, current).toString();
        continue;
      }
      if (!res.ok) throw new Error(`fetch ${current}: HTTP ${res.status}`);
      const mime = (res.headers.get('content-type') ?? '').split(';')[0]!.trim().toLowerCase();
      if (!ALLOWED_MIME.has(mime)) throw new Error(`unsupported content-type: ${mime || 'unknown'}`);
      return { res, mime };
    }
    throw new Error(`too many redirects (${MAX_REDIRECTS})`);
  } finally {
    clearTimeout(timer);
  }
}

/** Stream the response body, aborting if total bytes exceed cap. */
async function readBoundedBuffer(res: Response, max: number): Promise<Buffer> {
  if (!res.body) throw new Error('response has no body');
  const chunks: Uint8Array[] = [];
  let total = 0;
  const reader = res.body.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > max) {
      try { await reader.cancel(); } catch {}
      throw new Error(`image too large: >${max} bytes`);
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks, total);
}

/** Reject anything that's not https + an allowed host + a public unicast IP. */
async function assertSafePublicUrl(rawUrl: string): Promise<void> {
  let u: URL;
  try {
    u = new URL(rawUrl);
  } catch {
    throw new Error(`invalid URL: ${rawUrl}`);
  }
  if (u.protocol !== 'https:') throw new Error(`scheme not allowed: ${u.protocol}`);
  const host = u.hostname.toLowerCase();
  if (!ALLOWED_HOST_SUFFIXES.some((suffix) => host === suffix || host.endsWith('.' + suffix))) {
    throw new Error(`host not allowed: ${host}`);
  }
  // Resolve and reject private/loopback/link-local/reserved targets. Belt-and-
  // braces: an allowlisted host that points (via DNS) at a private IP — or any
  // future allowlist mistake — gets caught here.
  let address: string;
  if (isIP(host)) {
    address = host;
  } else {
    try {
      const r = await lookup(host);
      address = r.address;
    } catch (e) {
      throw new Error(`DNS lookup failed for ${host}: ${(e as Error).message}`);
    }
  }
  if (!isPublicUnicastIp(address)) throw new Error(`resolved to non-public IP: ${address}`);
}

function isPublicUnicastIp(ip: string): boolean {
  const v = isIP(ip);
  if (v === 4) {
    const [a = 0, b = 0] = ip.split('.').map(Number);
    if (a === 10) return false;                                  // 10/8
    if (a === 127) return false;                                 // loopback
    if (a === 169 && b === 254) return false;                    // link-local
    if (a === 172 && b >= 16 && b <= 31) return false;           // 172.16/12
    if (a === 192 && b === 168) return false;                    // 192.168/16
    if (a === 100 && b >= 64 && b <= 127) return false;          // CGNAT 100.64/10
    if (a === 0) return false;                                   // 0/8
    if (a >= 224) return false;                                  // multicast + reserved
    return true;
  }
  if (v === 6) {
    const lower = ip.toLowerCase();
    if (lower === '::1' || lower === '::') return false;
    if (lower.startsWith('fe80:')) return false;                 // link-local
    if (lower.startsWith('fc') || lower.startsWith('fd')) return false; // ULA
    if (lower.startsWith('ff')) return false;                    // multicast
    // IPv4-mapped (::ffff:a.b.c.d) — re-check the embedded v4 address.
    if (lower.startsWith('::ffff:')) {
      const tail = lower.slice('::ffff:'.length);
      if (isIP(tail) === 4) return isPublicUnicastIp(tail);
    }
    return true;
  }
  return false;
}
