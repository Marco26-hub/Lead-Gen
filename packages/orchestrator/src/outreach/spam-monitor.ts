import { env } from '@maps/core';
import { db } from '../lib/db';

const PAUSE_KEY = 'outreach_paused';
const MIN_SENDS_TO_TRIP = 20;

export interface SpamStats {
  sends: number;
  complaints: number;
  rate: number;
}

/** Spam-complaint rate over a trailing window from outreach_events. */
export async function spamRate(windowDays = 7): Promise<SpamStats> {
  const sinceIso = new Date(Date.now() - windowDays * 86_400_000).toISOString();
  const sb = db();
  const sentQ = await sb
    .from('outreach_events')
    .select('*', { count: 'exact', head: true })
    .gte('ts', sinceIso)
    .in('status', ['sent', 'delivered', 'opened', 'complained', 'bounced']);
  const complaintQ = await sb
    .from('outreach_events')
    .select('*', { count: 'exact', head: true })
    .gte('ts', sinceIso)
    .eq('spam_complaint', true);
  const sends = sentQ.count ?? 0;
  const complaints = complaintQ.count ?? 0;
  return { sends, complaints, rate: sends > 0 ? complaints / sends : 0 };
}

export async function isPaused(): Promise<boolean> {
  const { data } = await db().from('app_flags').select('value').eq('key', PAUSE_KEY).maybeSingle();
  const value = (data?.value ?? {}) as { paused?: boolean };
  return Boolean(value.paused);
}

export async function setPaused(paused: boolean, reason?: string): Promise<void> {
  await db()
    .from('app_flags')
    .upsert({ key: PAUSE_KEY, value: { paused, reason: reason ?? null }, updated_at: new Date().toISOString() });
}

/** Auto-pause sends if the trailing spam rate exceeds the threshold (needs a minimum volume). */
export async function enforceSpamGuard(): Promise<{ paused: boolean; rate: number; sends: number }> {
  const { rate, sends } = await spamRate();
  if (sends >= MIN_SENDS_TO_TRIP && rate > env.SPAM_RATE_THRESHOLD) {
    await setPaused(true, `spam rate ${(rate * 100).toFixed(2)}% > ${(env.SPAM_RATE_THRESHOLD * 100).toFixed(2)}%`);
    return { paused: true, rate, sends };
  }
  return { paused: await isPaused(), rate, sends };
}
