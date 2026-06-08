import * as cheerio from 'cheerio';
import { getServiceClient } from './supabase';
import { type TechStack, type SiteAgeClass, type Priority, type LeadRow, type StageResult, emptyResult } from './types';

/**
 * DIY technographic classification — shared by orchestrator CLI and web app.
 * Imported as `@maps/core/classify` (keeps cheerio out of client bundles).
 */

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
const TIMEOUT_MS = 3000;
const MAX_BYTES = 512 * 1024;

export interface ProbeResult {
  reachable: boolean;
  status: number | null;
  html: string | null;
  ssl: boolean;
}

function candidates(website: string): string[] {
  const w = website.trim();
  if (/^https?:\/\//i.test(w)) return w.startsWith('http://') ? [w.replace(/^http:/i, 'https:'), w] : [w];
  return [`https://${w}`, `http://${w}`];
}

export async function probe(website: string): Promise<ProbeResult> {
  for (const url of candidates(website)) {
    try {
      const res = await fetch(url, {
        method: 'GET',
        redirect: 'follow',
        signal: AbortSignal.timeout(TIMEOUT_MS),
        headers: { 'user-agent': UA, accept: 'text/html,*/*' },
      });
      const html = (await res.text()).slice(0, MAX_BYTES);
      return { reachable: res.status < 500, status: res.status, html, ssl: (res.url || url).startsWith('https') };
    } catch {
      // try next candidate
    }
  }
  return { reachable: false, status: null, html: null, ssl: false };
}

export function analyzeTech(html: string, ssl: boolean): TechStack {
  const $ = cheerio.load(html);
  const lower = html.toLowerCase();
  const gtm = lower.includes('googletagmanager.com/gtm') || /["'\/]gtm-[a-z0-9]+/i.test(html);
  const gtag = lower.includes('gtag/js') || lower.includes('googletagmanager.com/gtag');
  const metaPixel =
    lower.includes('fbevents.js') || (lower.includes('connect.facebook.net') && lower.includes('fbq('));
  const viewport = /width\s*=\s*device-width/i.test($('meta[name="viewport"]').attr('content') ?? '');
  const generator = $('meta[name="generator"]').attr('content') ?? null;
  let cms: string | null = null;
  let cmsVersion: string | null = null;
  if (generator) {
    const g = generator.toLowerCase();
    if (g.includes('wordpress')) cms = 'WordPress';
    else if (g.includes('joomla')) cms = 'Joomla';
    else if (g.includes('drupal')) cms = 'Drupal';
    else if (g.includes('wix')) cms = 'Wix';
    else if (g.includes('squarespace')) cms = 'Squarespace';
    else if (g.includes('shopify')) cms = 'Shopify';
    const m = generator.match(/(\d+\.\d+(?:\.\d+)?)/);
    cmsVersion = m ? m[1]! : null;
  } else if (lower.includes('/wp-content/') || lower.includes('/wp-includes/')) {
    cms = 'WordPress';
  }
  return { ssl, gtm, gtag, metaPixel, viewport, generator, cms, cmsVersion };
}

export function classifySiteAge(tech: TechStack, reachable: boolean): SiteAgeClass {
  if (!reachable) return 'none';
  const modernTracking = Boolean(tech.gtm || tech.gtag || tech.metaPixel);
  if (tech.ssl && tech.viewport && modernTracking) return 'modern';
  return 'old';
}

export function scorePriority(ageClass: SiteAgeClass | null): Priority {
  if (ageClass === 'none') return 'high';
  if (ageClass === 'old') return 'medium';
  return 'low';
}

/** Probe + classify a batch of `scraped` leads → `classified` (+ priority). */
export async function classifyBatch(limit = 50): Promise<StageResult> {
  const res = emptyResult('classify');
  const sb = getServiceClient();
  const { data, error } = await sb
    .from('leads')
    .select('*')
    // Website/inbound leads (source='website') must never enter the pipeline.
    .eq('source', 'maps')
    .eq('status', 'scraped')
    .order('created_at', { ascending: true })
    .limit(limit);
  if (error) throw new Error(`select scraped leads: ${error.message}`);

  for (const lead of (data ?? []) as LeadRow[]) {
    res.processed++;
    try {
      let tech: TechStack = { ssl: false };
      let reachable: boolean | null = null;
      let httpStatus: number | null = null;
      let ageClass: SiteAgeClass;
      if (!lead.website_url) {
        ageClass = 'none';
      } else {
        const p = await probe(lead.website_url);
        reachable = p.reachable;
        httpStatus = p.status;
        if (!p.reachable || !p.html) {
          ageClass = 'none';
          tech = { ssl: p.ssl };
        } else {
          tech = analyzeTech(p.html, p.ssl);
          ageClass = classifySiteAge(tech, true);
        }
      }
      await sb
        .from('leads')
        .update({
          tech_stack: tech,
          site_age_class: ageClass,
          reachable,
          http_status: httpStatus,
          priority: scorePriority(ageClass),
          status: 'classified',
        })
        .eq('id', lead.id);
      res.advanced++;
    } catch (e) {
      res.errors.push({ placeId: lead.place_id, msg: (e as Error).message });
    }
  }
  return res;
}
