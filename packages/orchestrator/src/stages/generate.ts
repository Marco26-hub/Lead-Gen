import { defaultTemplateFor, env, getLlmModel, type LeadRow, type Priority, type StageResult, emptyResult } from '@maps/core';
import { db, updateLead } from '../lib/db';
import { generatePageModel } from '@maps/core/llm';

export interface GenerateOpts {
  priority?: Priority; // default 'high' (cost control); pass undefined to generate all classified
  limit?: number;
  model?: string; // OpenRouter model id; overrides the dashboard/env default
}

/** Generate a demo PageModel for classified leads → status `generated`, set demo_url. */
export async function runGenerate(opts: GenerateOpts = {}): Promise<StageResult> {
  const res = emptyResult('generate');
  const limit = opts.limit ?? 50;
  const model = opts.model ?? (await getLlmModel()) ?? env.OPENROUTER_MODEL;

  let query = db().from('leads').select('*').eq('source', 'maps').eq('status', 'classified');
  if (opts.priority) query = query.eq('priority', opts.priority);
  const { data, error } = await query.order('rating', { ascending: false, nullsFirst: false }).limit(limit);
  if (error) throw new Error(`select classified leads: ${error.message}`);

  for (const lead of (data ?? []) as LeadRow[]) {
    res.processed++;
    try {
      const pageModel = await generatePageModel(lead, model);
      const demoUrl = lead.slug ? `${env.PUBLIC_BASE_URL}/d/${lead.slug}` : null;
      const template = lead.template ?? defaultTemplateFor(lead.category, pageModel.theme.preset, pageModel.restaurantStyle, pageModel.salonStyle);
      await updateLead(lead.id, {
        page_model: pageModel,
        demo_url: demoUrl,
        template,
        status: 'generated',
      });
      res.advanced++;
    } catch (e) {
      res.errors.push({ placeId: lead.place_id, msg: (e as Error).message });
    }
  }
  return res;
}
