import { env, type StageResult, emptyResult } from '@maps/core';
import { sendWhatsApp, buildDemoMessage } from '@maps/core/whatsapp';
import { selectLeadsByStatus, updateLead } from '../lib/db';
import { isSuppressed, recordEvent } from '../outreach/suppression';
import { isPaused } from '../outreach/spam-monitor';

/**
 * WhatsApp outreach to APPROVED leads with a mobile number. OFF unless WHATSAPP_PROVIDER set.
 * Preview mode (OUTREACH_TEST_WHATSAPP) routes every message to one inbox and does not advance leads.
 */
export async function runOutreachWhatsApp(limit = 100): Promise<StageResult> {
  const res = emptyResult('outreach_whatsapp');
  if (!env.WHATSAPP_PROVIDER) {
    res.errors.push({ msg: 'WhatsApp disattivato (WHATSAPP_PROVIDER vuoto)' });
    return res;
  }
  if (await isPaused()) {
    res.errors.push({ msg: 'outreach in pausa' });
    return res;
  }

  const testTo = env.OUTREACH_TEST_WHATSAPP;
  const leads = await selectLeadsByStatus('approved', limit);
  for (const lead of leads) {
    res.processed++;
    try {
      if (!testTo && (lead.phone_type !== 'mobile' || !lead.phone_e164)) continue; // mobile only
      if (!lead.demo_url) {
        res.errors.push({ placeId: lead.place_id, msg: 'manca demo_url' });
        continue;
      }
      const to = testTo || lead.phone_e164;
      if (!to) continue;
      if (!testTo && (await isSuppressed(null, lead.phone_e164))) {
        await updateLead(lead.id, { status: 'suppressed' });
        continue;
      }

      const msg = buildDemoMessage(lead);
      const r = await sendWhatsApp(to, msg.body, { mediaUrl: msg.mediaUrl, contentSid: msg.contentSid, contentVariables: msg.contentVariables });
      if (r.error) {
        await recordEvent(lead.id, 'whatsapp', { template: 'demo_offer', status: 'failed', error: r.error });
        res.errors.push({ placeId: lead.place_id, msg: r.error });
        continue;
      }
      await recordEvent(lead.id, 'whatsapp', {
        template: 'demo_offer',
        status: testTo ? 'test' : 'sent',
        provider_message_id: r.id,
      });
      if (!testTo) {
        await updateLead(lead.id, { status: 'contacted', outreach_channel: 'whatsapp', sent_at: new Date().toISOString() });
      }
      res.advanced++;
    } catch (e) {
      res.errors.push({ placeId: lead.place_id, msg: (e as Error).message });
    }
  }
  return res;
}
