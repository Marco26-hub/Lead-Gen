import { scorePriority } from '@maps/core/classify';
import { type StageResult, emptyResult } from '@maps/core';
import { selectLeadsByStatus, updateLead } from '../lib/db';

export { scorePriority };

/** Recompute priority for all classified leads (useful when the rubric changes). */
export async function runScore(limit = 1000): Promise<StageResult> {
  const res = emptyResult('score');
  const leads = await selectLeadsByStatus('classified', limit);
  for (const lead of leads) {
    res.processed++;
    try {
      await updateLead(lead.id, { priority: scorePriority(lead.site_age_class) });
      res.advanced++;
    } catch (e) {
      res.errors.push({ placeId: lead.place_id, msg: (e as Error).message });
    }
  }
  return res;
}
