import { env, type LeadRow, type TechStack, type StageResult, emptyResult } from '@maps/core';
import { db, selectLeadsByStatus, updateLead } from '../lib/db';
import { emailEligible, isSuppressed, recordEvent } from '../outreach/suppression';
import { isPaused } from '../outreach/spam-monitor';
import { emailDemoOffer } from '../outreach/email-templates';
import { sendEmail } from '../providers/resend';

function startOfTodayIso(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

async function countSentToday(): Promise<number> {
  const { count } = await db()
    .from('outreach_events')
    .select('*', { count: 'exact', head: true })
    .gte('ts', startOfTodayIso())
    .eq('channel', 'email')
    .eq('status', 'sent');
  return count ?? 0;
}

/** Italian one-liner describing the prospect's current site gap (used in the email copy). */
function gapText(lead: LeadRow): string {
  if (lead.site_age_class === 'none') return 'la tua attività non ha ancora un sito web online';
  const t = (lead.tech_stack ?? {}) as TechStack;
  const miss: string[] = [];
  if (!t.ssl) miss.push('il certificato di sicurezza HTTPS');
  if (!t.viewport) miss.push("l'ottimizzazione per smartphone");
  if (!t.gtm && !t.gtag && !t.metaPixel) miss.push('i sistemi di tracciamento moderni (es. il Pixel di Facebook)');
  if (miss.length > 0) return `il sito attuale non utilizza ${miss.join(', ')}`;
  return 'il sito attuale potrebbe essere modernizzato';
}

/**
 * Send the demo-offer email to APPROVED leads only. Enforces: spam-guard pause,
 * daily cap, impersonal-address filter, suppression check. Advances lead → contacted.
 */
export async function runOutreachEmail(limit = 200): Promise<StageResult> {
  const res = emptyResult('outreach_email');

  if (await isPaused()) {
    res.errors.push({ msg: 'outreach in pausa (spam guard attivo)' });
    return res;
  }

  let budget = Math.max(0, env.OUTREACH_DAILY_CAP - (await countSentToday()));
  if (budget <= 0) {
    res.errors.push({ msg: 'cap giornaliero raggiunto' });
    return res;
  }

  // Preview mode: when OUTREACH_TEST_RECIPIENT is set, every email goes to that inbox,
  // the impersonal-address filter + suppression are bypassed, and leads are NOT advanced.
  const testTo = env.OUTREACH_TEST_RECIPIENT;

  const leads = await selectLeadsByStatus('approved', limit);
  for (const lead of leads) {
    if (budget <= 0) break;
    res.processed++;
    try {
      const recipient = testTo || lead.email;
      if (!recipient) continue;
      if (!testTo && !emailEligible(lead.email)) continue; // live: impersonal addresses only
      if (!lead.demo_url) {
        res.errors.push({ placeId: lead.place_id, msg: 'manca demo_url' });
        continue;
      }
      if (!testTo && (await isSuppressed(lead.email, lead.phone_e164))) {
        await updateLead(lead.id, { status: 'suppressed' });
        continue;
      }

      const unsubscribeUrl = `${env.PUBLIC_BASE_URL}/api/unsubscribe?token=${lead.unsubscribe_token}`;
      const { subject, html } = emailDemoOffer({
        businessName: lead.business_name,
        siteGap: gapText(lead),
        demoUrl: lead.demo_url,
        unsubscribeUrl,
      });
      const r = await sendEmail({
        to: recipient,
        subject: testTo ? `[TEST] ${subject}` : subject,
        html,
        headers: {
          'List-Unsubscribe': `<${unsubscribeUrl}>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        },
      });
      if (r.error) {
        await recordEvent(lead.id, 'email', { template: 'demo_offer', status: 'failed', error: r.error });
        res.errors.push({ placeId: lead.place_id, msg: r.error });
        continue;
      }
      await recordEvent(lead.id, 'email', {
        template: 'demo_offer',
        status: testTo ? 'test' : 'sent',
        provider_message_id: r.id,
      });
      if (!testTo) {
        await updateLead(lead.id, {
          status: 'contacted',
          outreach_channel: 'email',
          sent_at: new Date().toISOString(),
        });
      }
      budget--;
      res.advanced++;
    } catch (e) {
      res.errors.push({ placeId: lead.place_id, msg: (e as Error).message });
    }
  }
  return res;
}
